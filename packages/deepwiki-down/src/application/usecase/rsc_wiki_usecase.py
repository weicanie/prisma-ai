#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Usecase for converting a wiki site to markdown using RSC interception.
"""

import os
import re
from urllib.parse import quote
from src.domain.models.wikisite_entity import WikiSite
from src.infrastructure.repository.rsc_repository import RSCRepository
from src.infrastructure.repository.file_repository import FileRepository

class ConvertWikiSiteToMarkdownViaRSCUsecase:
    """
    通过RSC拦截将DeepWiki站点转换为Markdown文档集合的用例。
    """

    def __init__(
        self,
        rsc_repository: RSCRepository,
        file_repository: FileRepository,
    ):
        """
        Initialize the usecase with repositories.

        Args:
            rsc_repository: For fetching RSC content.
            file_repository: For file operations.
        """
        self.rsc_repository = rsc_repository
        self.file_repository = file_repository

    async def execute(self, url: str, output_base_dir: str) -> None:
        """
        通过RSC拦截将Wiki网站转换为Markdown文件的集合。

        Args:
            url: DeepWiki的URL (例: https://deepwiki.com/langchain-ai/langchain)
            output_base_dir: 输出目录的基本路径
        """
        print("Starting RSC-based Wiki to Markdown conversion process...")
        print(f"Target URL: {url}")
        print(f"Output Base Directory: {output_base_dir}")
        print("Mode: RSC Interception (Direct Markdown extraction)")

        # 1.从URL中提取Wiki站点信息
        wiki_site = WikiSite.from_url(url)
        print(f"Processing wiki for {wiki_site.organization}/{wiki_site.repository}")

        # 2. 创建输出目录结构
        output_dir = wiki_site.get_output_directory(output_base_dir)
        self.file_repository.ensure_directory(output_dir)
        print(f"Output directory: {output_dir}")

        # 3. 通过拦截RSC响应获取Wiki内容
        print("Fetching wiki content via RSC interception...")
        try:
            pages_info, content_map, all_pages_content = await self.rsc_repository.fetch_wiki_content(url)
            
            if not pages_info:
                print("No pages found via RSC interception. Exiting.")
                return
            
            print(f"Found {len(pages_info)} pages via RSC interception.")
            print(f"Successfully extracted content for {len(content_map)} pages.")
            
            # 保存页面信息以便在文件名生成中使用
            self._current_pages_info = all_pages_content
            
        except Exception as e:
            print(f"Error during RSC content extraction: {e}")
            return

        # 4. 直接保存获取到的Markdown内容
        saved_count = 0
        for page_num, page_info in enumerate(pages_info, 1):
            page_url = page_info["url"]
            page_title = page_info["title"]
            
            print(f"Processing page {page_num}/{len(pages_info)}: {page_title}")
            
            if page_url in content_map:
                markdown_content = content_map[page_url]
                
                # 从内容映射中提取页面信息来生成正确的文件名
                # 尝试从all_pages_content中找到匹配的页面信息
                page_id = None
                actual_title = page_title
                
                # 如果有详细的页面信息，使用它们
                if hasattr(self, '_current_pages_info'):
                    for page_key, page_data in self._current_pages_info.items():
                        if page_data.get('content') == markdown_content:
                            page_id = page_data.get('id')
                            actual_title = page_data.get('title', page_title)
                            break
                
                # 生成保持层级关系的文件名
                if page_id:
                    page_filename = self._generate_hierarchical_filename(actual_title, page_id)
                else:
                    page_filename = self._generate_filename(page_title, page_num)
                
                page_filepath = os.path.join(output_dir, page_filename)
                                
                self.file_repository.save_markdown(markdown_content, page_filepath)
                print(f"Saved: {page_filepath}")
                saved_count += 1
                
            else:
                print(f"Warning: No content found for page: {page_title}")

        # 5. 生成简单的索引页面
        if saved_count > 0:
            index_content = self._generate_simple_index(pages_info, wiki_site.organization, wiki_site.repository)
            index_filepath = os.path.join(output_dir, "index.md")
            self.file_repository.save_markdown(index_content, index_filepath)
            print(f"Generated index page: {index_filepath}")

        print(f"Successfully saved {saved_count} wiki pages as Markdown files via RSC.")
        print(f"Output directory: {output_dir}")

    def _generate_filename(self, title: str, page_number: int) -> str:
        """
        生成文件名。
        
        Args:
            title: 页面标题
            page_number: 页面编号
            
        Returns:
            清理后的文件名
        """
        # 清理标题，移除特殊字符
        sanitized_title = re.sub(r'[^\w\s-]', '', title)
        sanitized_title = re.sub(r'[-\s]+', '-', sanitized_title).strip('-')
        
        return f"{page_number}-{sanitized_title.lower()}.md"

    def _generate_simple_index(self, pages_info: list, organization: str, repository: str) -> str:
        """
        生成简单的索引页面内容。
        
        Args:
            pages_info: 页面信息列表
            organization: 组织名
            repository: 仓库名
            
        Returns:
            索引页面的Markdown内容
        """
        lines = [
            f"# {organization}/{repository}",
            "",
            "## Pages",
            ""
        ]
        
        # 使用 self._current_pages_info 中的实际文件名映射
        if hasattr(self, '_current_pages_info') and self._current_pages_info:
            # 按照页面ID排序，确保目录顺序正确
            sorted_pages = sorted(self._current_pages_info.items(), 
                                key=lambda x: self._extract_sort_key(x[1].get('id', '0')))
            
            for page_key, page_data in sorted_pages:
                title = page_data.get('title', page_key)
                page_id = page_data.get('id', '')
                # 生成文件名（与实际保存的文件名一致）
                filename = self._generate_hierarchical_filename(title, page_id)
                # 对文件名进行URL编码以确保链接合法
                encoded_filename = quote(filename)
                lines.append(f"- [{title}](./{encoded_filename})")
        else:
            # 回退到原始方法
            for page_num, page_info in enumerate(pages_info, 1):
                page_title = page_info["title"]
                filename = self._generate_filename(page_title, page_num)
                # 对文件名进行URL编码以确保链接合法
                encoded_filename = quote(filename)
                lines.append(f"- [{page_title}](./{encoded_filename})")
        
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append("*Generated by deepwiki-get via RSC interception*")
        lines.append("")
        
        return "\n".join(lines)

    def _extract_sort_key(self, page_id: str) -> tuple:
        """
        从页面ID提取排序键，支持层级排序。
        例如：'1' -> (1,), '2.1' -> (2, 1), '2.10' -> (2, 10)
        
        Args:
            page_id: 页面ID字符串
            
        Returns:
            排序用的元组
        """
        if not page_id:
            return (0,)
        
        try:
            # 分割页面ID并转换为整数元组
            parts = page_id.split('.')
            return tuple(int(part) for part in parts)
        except ValueError:
            # 如果转换失败，使用字符串排序
            return (float('inf'), page_id)

    def _generate_hierarchical_filename(self, title: str, page_id: str) -> str:
        """
        生成保持层级关系的文件名。
        
        Args:
            title: 页面标题
            page_id: 页面ID（如 "2.3"）
            
        Returns:
            层级化的文件名（如 "2.3 frontend application.md"）
        """
        # 避免/生成目录导致写文件错误
        sanitized_title = title.replace('/', '-')
        # 清理标题，移除特殊字符
        # sanitized_title = re.sub(r'[^\w\s-]', '', title)
        # sanitized_title = re.sub(r'[-\s]+', '-', sanitized_title).strip('-')
        
        return f"{page_id}-{sanitized_title}.md"
