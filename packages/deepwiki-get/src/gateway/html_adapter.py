#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HTML adapter for parsing HTML content using BeautifulSoup.
"""

import re
from typing import List, Dict, Optional
from bs4 import BeautifulSoup, Tag
from urllib.parse import urljoin


class HtmlAdapter:
    """
    Adapter for parsing HTML content using BeautifulSoup.
    """

    def parse_html(self, page_html: str) -> BeautifulSoup:
        """
        Parses HTML content into a BeautifulSoup object.

        Args:
            page_html: HTML content as a string.

        Returns:
            A BeautifulSoup object.
        """
        return BeautifulSoup(page_html, "html.parser")

    def extract_chat_block_snippets(self, page_html: str) -> List[str]:
        """
        Extracts HTML snippets for each chat block.

        Args:
            page_html: HTML content of the page.

        Returns:
            A list of HTML snippet strings for each chat block.
        """
        soup = self.parse_html(page_html)
        return [str(block) for block in soup.select('div[data-query-display="true"]')]

    def extract_query_from_block(self, block_soup: BeautifulSoup) -> Optional[str]:
        """
        Extracts the query text from a chat block.

        Args:
            block_soup: BeautifulSoup object of a chat block.

        Returns:
            The query text, or None if not found.
        """
        left_pane = block_soup.select_one(":scope > div:nth-child(1)")
        if left_pane:
            query_span = left_pane.select_one("span.text-xl, span.xl\\:text-2xl")
            if query_span:
                for button in query_span.select("button"):
                    button.decompose()
                return query_span.get_text(strip=True)
        return None

    def extract_answer_area(self, block_soup: BeautifulSoup) -> Optional[Tag]:
        """
        Extracts the answer area from a chat block.

        Args:
            block_soup: BeautifulSoup object of a chat block.

        Returns:
            The answer area as a Tag, or None if not found.
        """
        left_pane = block_soup.select_one(":scope > div:nth-child(1)")
        if not left_pane:
            return None

        answer_area_soup = left_pane.select_one("div.prose-custom")
        return answer_area_soup

    def extract_code_references(self, block_soup: BeautifulSoup) -> List[dict]:
        """
        Extracts code references from a chat block.

        Args:
            block_soup: BeautifulSoup object of a chat block.

        Returns:
            A list of dictionaries containing code reference information.
        """
        references = []
        right_pane = block_soup.select_one(":scope > div:nth-child(2)")
        if right_pane:
            file_blocks = right_pane.select('div[id^="file-Repo"]')
            if not file_blocks:
                file_blocks = right_pane.select(
                    "div.flex.flex-col.gap-3.p-0 > div.flex.flex-col.gap-2.scroll-smooth.rounded-md"
                )

            for file_block in file_blocks:
                header_div = file_block.select_one('div[class*="sticky"]')
                file_name = "Unknown File"
                github_url = "#"
                repo_name = None

                if header_div:
                    repo_link_tag = header_div.select_one(
                        'a[href^="https://github.com/"]:not([href*="/blob/"])'
                    )
                    file_link_tag = header_div.select_one('a[href*="/blob/"]')

                    if repo_link_tag:
                        repo_name = repo_link_tag.get_text(strip=True)
                    if file_link_tag:
                        file_name = file_link_tag.get_text(strip=True)
                        github_url = file_link_tag["href"]

                references.append(
                    {
                        "repo_name": repo_name,
                        "file_name": file_name,
                        "github_url": github_url,
                    }
                )
        return references

    def extract_mermaid_diagrams(self, answer_area_soup: Tag) -> List[dict]:
        """
        Extracts Mermaid diagrams from the answer area.

        Args:
            answer_area_soup: The answer area as a BeautifulSoup Tag.

        Returns:
            A list of dictionaries containing information about each Mermaid diagram.
        """
        diagrams = []
        if not answer_area_soup:
            return diagrams

        for i, pre_tag_mermaid in enumerate(
            answer_area_soup.select(
                'pre:has(div[type="button"] > div > svg[id^="mermaid-"])'
            )
        ):
            svg_bs_tag_original = pre_tag_mermaid.select_one(
                'div[type="button"] > div > svg[id^="mermaid-"]'
            )
            if svg_bs_tag_original:
                fresh_svg_soup = BeautifulSoup(str(svg_bs_tag_original), "xml")
                svg_tag_for_diagram = fresh_svg_soup.find("svg")

                if svg_tag_for_diagram:
                    diagrams.append(
                        {
                            "svg_tag": svg_tag_for_diagram,
                            "pre_tag": pre_tag_mermaid,
                            "index": i,
                        }
                    )
                else:
                    print(f"Warning: Failed to re-parse SVG for diagram {i}. Skipping.")

        return diagrams

    def create_placeholder(self, chat_block_index: int, diagram_index: int) -> str:
        """
        Creates a placeholder for a Mermaid diagram.

        Args:
            chat_block_index: The index of the chat block.
            diagram_index: The index of the diagram within the chat block.

        Returns:
            A unique placeholder string for the diagram.
        """
        return f"HTMLPARSERMERMAIDPLACEHOLDER{chat_block_index}{diagram_index}ENDHTMLPARSER"

    def replace_svg_with_placeholder(self, pre_tag: Tag, placeholder: str) -> None:
        """
        Replaces an SVG container with a placeholder in the HTML.

        Args:
            pre_tag: The pre tag containing the SVG.
            placeholder: The placeholder to use.
        """
        pre_tag.replace_with(BeautifulSoup(f"<p>{placeholder}</p>", "html.parser").p)

    def unwrap_nested_pre_tags(self, answer_area_soup: Tag) -> None:
        """
        Unwraps nested pre tags in the answer area.

        Args:
            answer_area_soup: The answer area as a BeautifulSoup Tag.
        """
        unwrapped = True
        while unwrapped:
            unwrapped = False
            for pre_tag in answer_area_soup.find_all("pre"):
                children = [
                    child
                    for child in pre_tag.children
                    if isinstance(child, Tag) or child.strip()
                ]
                if len(children) == 1 and children[0].name == "pre":
                    pre_tag.replace_with(children[0])
                    unwrapped = True
                    break
            if not unwrapped:
                break

    def remove_empty_pre_tags(self, answer_area_soup: Tag) -> None:
        """
        Removes empty pre tags from the answer area.

        Args:
            answer_area_soup: The answer area as a BeautifulSoup Tag.
        """
        for pre_tag in answer_area_soup.find_all("pre"):
            if not pre_tag.get_text(strip=True):
                pre_tag.decompose()

    # ----- Wiki関連のメソッド -----

    def extract_wiki_navigation(self, html_content: str) -> List[Dict[str, str]]:
        """
        Wikiページのナビゲーションメニューからすべてのページリンクを抽出する。

        Args:
            html_content: Wikiページ全体のHTML

        Returns:
            List[Dict[str, str]]: [{"title": "ページタイトル", "url": "ページURL"}, ...]
        """
        soup = self.parse_html(html_content)
        navigation_links = []

        # DeepWikiの特定のナビゲーション構造にマッチするセレクタを使用
        # XPath: //*[@id="codebase-wiki-repo-page"]/div[2]/div/div/div[1]/div/ul
        nav_ul = soup.select_one(
            "#codebase-wiki-repo-page > div:nth-child(2) > div > div > div:nth-child(1) > div > ul"
        )

        if nav_ul:
            # ナビゲーションリンクを取得
            for li in nav_ul.find_all("li"):
                link = li.find("a")
                if link:
                    href = link.get("href")
                    title = link.get_text(strip=True)

                    # リンクが有効な場合のみ処理
                    if href and title:
                        # 相対URLを絶対URLに変換
                        if not href.startswith("http"):
                            href = urljoin("https://deepwiki.com", href)

                        navigation_links.append({"title": title, "url": href})

            # ナビゲーションリンクが見つかった場合、情報をログに出力
            if navigation_links:
                print(f"Found {len(navigation_links)} navigation links")
        else:
            print(
                "Navigation container not found. Check if the page structure has changed."
            )

        return navigation_links

    def extract_wiki_content(self, html_content: str) -> str:
        """
        Wikiページの主要コンテンツを抽出する。

        Args:
            html_content: Wikiページ全体のHTML

        Returns:
            str: コンテンツ部分のHTML
        """
        soup = self.parse_html(html_content)

        # DeepWikiのWikiコンテンツ要素のセレクタ
        # 注: 実際のHTMLを解析して適切なセレクタに調整する必要がある
        content_area = soup.select_one(".wiki-content, .main-content, article, main")

        if content_area:
            # 不要な要素を削除（例: 編集ボタンなど）
            for button in content_area.select("button, .edit-button, .action-button"):
                button.decompose()

            return str(content_area)

        # コンテンツエリアが見つからない場合、body全体を返す
        return str(soup.body) if soup.body else ""

    def extract_wiki_mermaid_diagrams(self, html_content: str) -> List[dict]:
        """
        Wikiページ内のMermaid図を抽出する。

        Args:
            html_content: Wikiページ全体のHTML

        Returns:
            List[dict]: 抽出されたMermaid図情報のリスト
        """
        soup = self.parse_html(html_content)
        diagrams = []

        # コンテンツエリアを特定 (DeepWikiの構造に合わせる)
        content_area = soup.select_one("#codebase-wiki-repo-page")
        if not content_area:
            content_area = soup.body

        if not content_area:
            return diagrams

        print("Searching for Mermaid diagrams in Wiki content...")

        # DeepWikiのMermaidダイアグラム構造に合わせたセレクタ
        # XPath: //*[@id="codebase-wiki-repo-page"]/div[2]/div/div/div[2]/div[2]/div/div/div/div/pre[1]
        diagram_selector = 'pre:has(div[type="button"][aria-haspopup="dialog"] > div > svg[id^="mermaid-"])'

        # すべてのpreタグを探す (デバッグ出力)
        all_pre_tags = content_area.find_all("pre")
        print(f"Found {len(all_pre_tags)} pre tags in content")

        # Mermaid図を探索
        diagram_candidates = content_area.select(diagram_selector)
        print(f"Found {len(diagram_candidates)} potential Mermaid diagrams")

        for i, pre_tag_mermaid in enumerate(diagram_candidates):
            # SVGタグを抽出
            svg_bs_tag_original = pre_tag_mermaid.select_one(
                'div[type="button"][aria-haspopup="dialog"] > div > svg[id^="mermaid-"]'
            )

            if svg_bs_tag_original:
                svg_id = svg_bs_tag_original.get("id", f"unknown-{i}")
                print(f"Processing Mermaid diagram: {svg_id}")

                fresh_svg_soup = BeautifulSoup(str(svg_bs_tag_original), "xml")
                svg_tag_for_diagram = fresh_svg_soup.find("svg")

                if svg_tag_for_diagram:
                    diagrams.append(
                        {
                            "svg_tag": svg_tag_for_diagram,
                            "pre_tag": pre_tag_mermaid,
                            "index": i,
                        }
                    )
                    print(f"Successfully extracted SVG for diagram {i}")
                else:
                    print(f"Warning: Failed to re-parse SVG for diagram {i}. Skipping.")

        print(f"Total Mermaid diagrams successfully extracted: {len(diagrams)}")
        return diagrams
