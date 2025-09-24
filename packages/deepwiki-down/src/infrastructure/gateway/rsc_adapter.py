#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
RSC (React Server Components) adapter for intercepting Next.js RSC requests to get Markdown content directly.
"""

import json
import re
import html
from typing import Dict, List, Optional, Tuple
from playwright.async_api import async_playwright, Page, Response
from urllib.parse import urljoin, urlparse


class RSCAdapter:
    """
    适配器，用于拦截Next.js的RSC请求以直接获取Markdown内容。
    """

    def __init__(self):
        # RSC请求URL -> RSC文本内容
        self.intercepted_data = {}
        self.navigation_data = None
        self.rsc_param = None

    async def fetch_wiki_content_via_rsc(self, base_url: str) -> Tuple[List[Dict], Dict[str, str]]:
        """
        通过拦截RSC请求获取Wiki内容。
        
        Args:
            base_url: Wiki的基础URL (例: https://deepwiki.com/facebook/react)
            
        Returns:
            Tuple[List[Dict], Dict[str, str]]: (页面列表, 页面 -> 页面文本内容映射)
        """
        pages_info = []
        content_map = {}
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # 设置请求拦截器
                await self._setup_request_interceptor(page)
                
                print(f"open url {base_url}...")
                await page.goto(base_url, wait_until="networkidle", timeout=60000)
                
                # 等待页面加载完成
                # print("Waiting for page to settle...")
                # await page.wait_for_timeout(5000)
                
                # 检查拦截到的请求
                print(f"Intercepted {len(self.intercepted_data)} RSC requests so far")
                for url in self.intercepted_data.keys():
                    print(f"  - Intercepted: {url}")
                       
                # 从导航中提取页面列表
                print("Extracting navigation info...")
                pages_info = await self._extract_navigation_info(page, base_url)
                print(f"Found {len(pages_info)} navigation links")
                
                # 只需要获取一次RSC内容，因为响应包含所有页面
                if pages_info:
                    first_page_url = pages_info[0]['url']
                    
                    # 构造RSC URL
                    rsc_url = await self._construct_rsc_url(first_page_url)
                    if rsc_url:
                        all_pages_content = await self._fetch_rsc_content(page, rsc_url)
                        if all_pages_content:
                            
                            # 保存页面信息供后续使用
                            self._last_pages_content = all_pages_content
                            
                            # 尝试将分割的页面内容匹配到导航链接
                            content_map = self._match_pages_to_navigation(pages_info, all_pages_content)
                
            except Exception as e:
                print(f"Error during RSC interception: {e}")
                raise
            finally:
                await browser.close()
        
        return pages_info, content_map

    async def _setup_request_interceptor(self, page: Page):
        """设置请求拦截器来捕获RSC请求"""
        print("Setting up request interceptor...")
        
        async def handle_response(response: Response):
            """处理响应，捕获RSC数据"""
            url = response.url
            
            # 只记录RSC相关的响应
            if f'_rsc=' in url:
                print(f"RSC Response: {response.status} {url[:100]}...")
                # 获取rsc参数
                rsc_param = url.split('_rsc=')[1]
                print(f"获取到rsc_param: {rsc_param}")
                self.rsc_param = rsc_param
                if response.status == 200:
                    try:
                        content_type = response.headers.get('content-type', '')
                        print(f"content-type: {content_type}")
                        
                        # 尝试获取内容
                        content = await response.text()
                        self.intercepted_data[url] = content
                        print(f"Successfully intercepted RSC response: {len(content)} chars")
                    except Exception as e:
                        print(f"Error processing RSC response: {e}")
                else:
                    print(f"RSC request failed with status: {response.status}")                

        async def handle_request(request):
            """处理请求，记录所有请求"""
            url = request.url
            if f'_rsc=' in url:
                print(f"RSC Request: {request.method} {url}")
        
        page.on("response", handle_response)
        page.on("request", handle_request)
        print("Request interceptor setup complete")

    async def _extract_navigation_info(self, page: Page, base_url: str) -> List[Dict]:
        """从页面中提取导航信息"""
        navigation_info = []
        
        try:
            # 查找导航链接 - 根据DeepWiki的实际结构调整选择器
            print("Looking for navigation links...")
            selectors = [
                'nav a[href*="/"]',
                '.sidebar a[href*="/"]', 
                '.navigation a[href*="/"]',
                'a[href*="/"]'  # 更宽泛的选择器
            ]
            
            all_links = []
            for selector in selectors:
                links = await page.query_selector_all(selector)
                all_links.extend(links)
            
            # 去重
            seen_hrefs = set()
            nav_links = []
            for link in all_links:
                href = await link.get_attribute('href')
                if href and href not in seen_hrefs:
                    seen_hrefs.add(href)
                    nav_links.append(link)
            
            print(f"Total unique links found: {len(nav_links)}")
            
            for link in nav_links:
                href = await link.get_attribute('href')
                text = await link.text_content()
                
                if href and text and href.strip() and text.strip():
                    
                    # 确保链接是相对于当前wiki的
                    if href.startswith('/'):
                        full_url = urljoin(base_url, href)
                    else:
                        full_url = href
                    
                    # 检查是否是同一个wiki的页面
                    is_same_wiki = self._is_same_wiki_page(base_url, full_url)
                    
                    if is_same_wiki:
                        navigation_info.append({
                            'title': text.strip(),
                            'url': full_url,
                            'path': href
                        })
            
            # 去重并排序
            seen_urls = set()
            unique_navigation = []
            for item in navigation_info:
                if item['url'] not in seen_urls:
                    seen_urls.add(item['url'])
                    unique_navigation.append(item)
            print('--------------找到的所有页面链接------------------')
            for link in unique_navigation:
                print(f"Navigation link: {link['title']} -> {link['url']}")
            print('--------------------------------')
            return unique_navigation
            
        except Exception as e:
            print(f"Error extracting navigation: {e}")
            return []

    def _is_same_wiki_page(self, base_url: str, target_url: str) -> bool:
        """检查目标URL是否属于同一个wiki"""
        base_parsed = urlparse(base_url)
        target_parsed = urlparse(target_url)
        
        # 检查域名
        if base_parsed.netloc != target_parsed.netloc:
            return False
        
        # 检查路径前缀
        base_path_parts = base_parsed.path.strip('/').split('/')
        target_path_parts = target_parsed.path.strip('/').split('/')
        
        # 至少要有组织名和仓库名匹配
        if len(base_path_parts) >= 2 and len(target_path_parts) >= 2:
            return (base_path_parts[0] == target_path_parts[0] and 
                   base_path_parts[1] == target_path_parts[1])
        
        return False

    async def _construct_rsc_url(self, page_url: str) -> Optional[str]:
        """构造RSC请求URL"""
        try:
            # 解析URL
            parsed = urlparse(page_url)
            
            # 构造RSC URL
            if parsed.query:
                rsc_url = f"{page_url}&_rsc={self.rsc_param}"
            else:
                rsc_url = f"{page_url}?_rsc={self.rsc_param}"
            
            return rsc_url
            
        except Exception as e:
            print(f"Error constructing RSC URL: {e}")
            return None


    async def _fetch_rsc_content(self, page: Page, rsc_url: str) -> Optional[Dict[str, str]]:
        """获取RSC内容并解析所有页面的Markdown"""
        try:
            # 导航到RSC URL
            response = await page.goto(rsc_url, wait_until="networkidle", timeout=30000)
            
            if response and response.status == 200:
                content = await page.content()
                
                # 尝试从响应中提取所有页面的Markdown内容
                all_pages_content = self._extract_markdown_from_rsc_response(content)
                return all_pages_content
            
            print(f'直接请求rsc {rsc_url} 失败，尝试从拦截的数据中获取')
            # 如果直接访问失败，尝试从拦截的数据中获取
            if rsc_url in self.intercepted_data:
                rsc_response = self.intercepted_data[rsc_url]
                return self._extract_markdown_from_rsc_response(rsc_response)
            
            print(f'从拦截的数据中获取 {rsc_url} 失败')        
            return None
            
        except Exception as e:
            print(f"Error fetching RSC content: {e}")
            return None

    def _extract_markdown_from_rsc_response(self, rsc_response: str) -> Optional[Dict[str, str]]:
        """从RSC响应中提取所有页面的Markdown内容"""
        try:            
            # 提取每个页面的Markdown内容
            script_pattern = r'<script>self\.__next_f\.push\(\[1,"(#.+?)"\]\)<\/script>'
            matches = re.findall(script_pattern, rsc_response)

            pages_content = {}
            markdown_contents = []
            # 解码转义字符
            for match in matches:
                decoded_content = self._decode_content(match)
                markdown_contents.append(decoded_content)
            
            # 提取页面元数据（标题和ID）
            pages_metadata = self._extract_pages_metadata(rsc_response)            
            # 将Markdown内容与页面元数据匹配
            if len(markdown_contents) == len(pages_metadata):
                for i, (page_meta, content) in enumerate(zip(pages_metadata, markdown_contents)):
                    page_key = f"{page_meta['id']} {page_meta['title']}"
                    pages_content[page_key] = {
                        'content': content,
                        'title': page_meta['title'],
                        'id': page_meta['id']
                    }
                    print(f"Matched page: {page_meta['id']} - {page_meta['title']}")
            else:
                print(f"Mismatch: {len(markdown_contents)} content blocks vs {len(pages_metadata)} metadata entries")
                # 如果数量不匹配，尝试其他策略
                for i, content in enumerate(markdown_contents):
                    page_key = f"page-{i+1}"
                    pages_content[page_key] = {
                        'content': content,
                        'title': f"Page {i+1}",
                        'id': str(i+1)
                    }
            
            return pages_content
            
        except Exception as e:
            print(f"Error extracting Markdown from RSC response: {e}")
            return None

    def _extract_pages_metadata(self, rsc_response: str) -> List[Dict[str, str]]:
        """从RSC响应中提取页面元数据"""
        try:
            # 查找包含pages数组的JSON数据
            pages_pattern = r'"pages\\":\[([^\]]+)\]'
            pages_match = re.search(pages_pattern, rsc_response)
            
            if not pages_match:
                print("No pages metadata found in RSC response")
                return []
            
            pages_data = pages_match.group(1)
            
            # 提取每个页面的id和title
            page_pattern = r'\\"page_plan\\":\{\\"id\\":\\"(.+?)\\",\\"title\\":\\"(.+?)\\"'
            page_matches = re.findall(page_pattern, pages_data)
            
            print(f"Found {len(page_matches)} page matches")
            
            pages_metadata = []
            for page_id, title in page_matches:
                # 使用完整的解码方法
                decoded_title = self._decode_content(title)
                pages_metadata.append({
                    'id': page_id,
                    'title': decoded_title
                })
            
            return pages_metadata
            
        except Exception as e:
            print(f"Error extracting pages metadata: {e}")
            return []


    def _match_pages_to_navigation(self, pages_info: List[Dict], all_pages_content: Dict[str, Dict]) -> Dict[str, str]:
        """将页面内容匹配到导航链接"""
        try:
            content_map = {}
            
            print("Matching pages to navigation...")
            print(f"Available content keys: {list(all_pages_content.keys())}")
            
            for page_info in pages_info:
                page_url = page_info['url']
                page_title = page_info['title']
                
                # 尝试多种匹配策略
                matched_content = None
                
                # 策略1: 直接标题匹配
                for content_key, page_data in all_pages_content.items():
                    content_title = page_data['title']
                    if page_title.lower() == content_title.lower():
                        matched_content = page_data['content']
                        print(f"Exact title match: '{page_title}' -> '{content_title}'")
                        break
                
                # 策略2: 部分标题匹配
                if not matched_content:
                    for content_key, page_data in all_pages_content.items():
                        content_title = page_data['title']
                        if (page_title.lower() in content_title.lower() or 
                            content_title.lower() in page_title.lower()):
                            matched_content = page_data['content']
                            print(f"Partial title match: '{page_title}' -> '{content_title}'")
                            break
                
                # 策略3: 基于URL路径匹配
                if not matched_content:
                    # 从URL中提取可能的标识符
                    url_parts = page_url.split('/')
                    if len(url_parts) > 0:
                        url_identifier = url_parts[-1].lower()
                        for content_key, page_data in all_pages_content.items():
                            if url_identifier in content_key.lower():
                                matched_content = page_data['content']
                                print(f"URL match: '{page_title}' -> '{content_key}' (via {url_identifier})")
                                break
                
                # 策略4: 如果只有一个页面内容，直接使用
                if not matched_content and len(all_pages_content) == 1:
                    matched_content = list(all_pages_content.values())[0]['content']
                    print(f"Single page match: '{page_title}'")
                
                if matched_content:
                    content_map[page_url] = matched_content
                    print(f"Matched content for: {page_title} ({len(matched_content)} chars)")
                else:
                    print(f"No content match found for: {page_title}")
            
            return content_map
            
        except Exception as e:
            print(f"Error matching pages to navigation: {e}")
            return {}

    def _decode_content(self, content: str) -> str:
        """完整解码内容中的各种转义字符 - 优先使用内置库"""
        try:
            # 1. 首先尝试JSON解码 - 处理JSON字符串转义
            try:
                # 将内容包装为JSON字符串然后解码
                json_wrapped = f'"{content}"'
                decoded = json.loads(json_wrapped)
                content = decoded
            except (json.JSONDecodeError, ValueError):
                # JSON解码失败，继续使用其他方法
                pass
            
            # 2. Unicode转义序列解码 (\uXXXX -> 字符)
            # 使用内置的unicode_escape codec
            try:
                # 需要先编码为bytes，然后用unicode_escape解码
                if '\\u' in content:
                    content = content.encode('utf-8').decode('unicode_escape')
            except (UnicodeDecodeError, UnicodeEncodeError):
                # 如果内置解码失败，回退到手动替换关键字符
                critical_unicode = {
                    '\\u003c': '<',
                    '\\u003e': '>',
                    '\\u0026': '&',
                    '\\u0022': '"',
                    '\\u0027': "'",
                }
                for escaped, unescaped in critical_unicode.items():
                    content = content.replace(escaped, unescaped)
            
            # 3. HTML实体解码 (&lt; -> <, &gt; -> >, &amp; -> &)
            # 使用内置的html.unescape()
            content = html.unescape(content)
            
            return content
            
        except Exception as e:
            print(f"Error decoding content: {e}")
            return content  # 返回原始内容作为回退
