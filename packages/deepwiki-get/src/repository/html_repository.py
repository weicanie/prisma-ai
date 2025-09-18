#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HTML repository for parsing HTML content and creating domain entities.
"""

from typing import List, Dict, Optional
from bs4 import BeautifulSoup

from src.domain.entities import (
    ChatBlockContent,
    CodeReference,
    CodeReferenceCollection,
    ProcessedAnswer,
    MermaidDiagram,
    WikiPage,
    WikiSite,
)
from src.gateway.html_adapter import HtmlAdapter


class HtmlRepository:
    """
    Repository for HTML operations, using HtmlAdapter.
    """

    def __init__(self, html_adapter: HtmlAdapter):
        """
        Initialize the HtmlRepository with an HtmlAdapter.

        Args:
            html_adapter: The HtmlAdapter to use for HTML operations.
        """
        self.html_adapter = html_adapter

    def extract_chat_blocks(
        self,
        html_content: str,
        output_dir: str,
        chat_block_indices: Optional[List[int]] = None,
    ) -> List[ChatBlockContent]:
        """
        Extracts chat blocks from HTML content and creates ChatBlockContent entities.

        Args:
            html_content: The HTML content to parse.
            output_dir: Directory where output files (e.g., SVGs) will be saved.
            chat_block_indices: Indices of chat blocks to parse. If None, all blocks are parsed.

        Returns:
            A list of ChatBlockContent objects.
        """
        # Extract chat block snippets
        snippets = self.html_adapter.extract_chat_block_snippets(html_content)

        # If specific indices were requested, filter the snippets
        if chat_block_indices is not None:
            filtered_snippets = [
                (i, s) for i, s in enumerate(snippets) if i in chat_block_indices
            ]
        else:
            filtered_snippets = enumerate(snippets)

        # Parse each snippet into a ChatBlockContent object
        chat_blocks = []
        for i, snippet in filtered_snippets:
            chat_block = self.parse_chat_block(snippet, output_dir, i)
            if chat_block:
                chat_blocks.append(chat_block)

        return chat_blocks

    def parse_chat_block(
        self, html_snippet: str, output_dir: str, chat_block_index: int
    ) -> ChatBlockContent:
        """
        Parses a single chat block HTML into a ChatBlockContent entity.

        Args:
            html_snippet: The HTML snippet for a chat block.
            output_dir: Directory where output files will be saved.
            chat_block_index: The index of this chat block.

        Returns:
            A ChatBlockContent object.
        """
        # Parse HTML snippet
        block_soup = self.html_adapter.parse_html(html_snippet)

        # Extract query
        query = self.html_adapter.extract_query_from_block(block_soup)

        # Extract answer area
        answer_area = self.html_adapter.extract_answer_area(block_soup)

        # Extract code references
        code_references = self._create_code_references(block_soup)

        # Process answer if available
        processed_answer = None
        if answer_area:
            processed_answer = self._process_answer_area(
                answer_area, output_dir, chat_block_index
            )

        # Create and return ChatBlockContent
        return ChatBlockContent(
            query=query,
            processed_answer=processed_answer,
            code_references=code_references,
        )

    def _create_code_references(
        self, block_soup: BeautifulSoup
    ) -> CodeReferenceCollection:
        """
        Creates CodeReference entities from a chat block.

        Args:
            block_soup: The BeautifulSoup object for a chat block.

        Returns:
            A CodeReferenceCollection object.
        """
        collection = CodeReferenceCollection()
        ref_data_list = self.html_adapter.extract_code_references(block_soup)

        for ref_data in ref_data_list:
            code_ref = CodeReference(
                repo_name=ref_data["repo_name"],
                file_name=ref_data["file_name"],
                github_url=ref_data["github_url"],
            )
            collection.add(code_ref)

        return collection

    def _process_answer_area(
        self, answer_area: BeautifulSoup, output_dir: str, chat_block_index: int
    ) -> ProcessedAnswer:
        """
        Processes the answer area, extracting and saving Mermaid diagrams.

        Args:
            answer_area: The BeautifulSoup object for the answer area.
            output_dir: Directory where diagram files will be saved.
            chat_block_index: The index of the chat block.

        Returns:
            A ProcessedAnswer object.
        """
        # Copy the answer area to avoid modifying the original
        answer_area_copy = BeautifulSoup(str(answer_area), "html.parser")

        # Extract Mermaid diagrams
        diagrams = self.html_adapter.extract_mermaid_diagrams(answer_area_copy)

        # Process each diagram
        placeholder_map = {}
        for diagram_data in diagrams:
            svg_tag = diagram_data["svg_tag"]
            pre_tag = diagram_data["pre_tag"]
            diagram_index = diagram_data["index"]

            # Create MermaidDiagram entity
            diagram = MermaidDiagram(
                original_id=svg_tag.get("id", ""),
                svg_content=svg_tag,
                chat_block_index=chat_block_index,
                diagram_index=diagram_index,
            )

            # Save the diagram and get the file path
            relative_svg_path = diagram.prepare_and_save(output_dir)

            # Create a placeholder for this diagram
            placeholder = self.html_adapter.create_placeholder(
                chat_block_index, diagram_index
            )

            # Add the placeholder and corresponding markdown link to the map
            if relative_svg_path:
                placeholder_map[placeholder] = (
                    f"![Mermaid Diagram]({relative_svg_path})"
                )
            else:
                placeholder_map[placeholder] = ""

            # Replace the SVG with a placeholder in the HTML
            self.html_adapter.replace_svg_with_placeholder(pre_tag, placeholder)

        # Clean up the HTML
        self.html_adapter.unwrap_nested_pre_tags(answer_area_copy)
        self.html_adapter.remove_empty_pre_tags(answer_area_copy)

        # Create and return ProcessedAnswer
        return ProcessedAnswer(
            html_content_with_placeholders=str(answer_area_copy),
            placeholder_to_markdown_link_map=placeholder_map,
        )

    # ----- Wiki関連のメソッド -----

    def extract_wiki_navigation(self, html_content: str) -> List[Dict[str, str]]:
        """
        Wikiサイトのナビゲーションリンク情報を抽出する。

        Args:
            html_content: Wikiページのhtml全体

        Returns:
            List[Dict[str, str]]: [{"title": "ページタイトル", "url": "ページURL"}, ...]
        """
        return self.html_adapter.extract_wiki_navigation(html_content)

    def extract_wiki_page(
        self, html_content: str, title: str, url: str, page_number: int, output_dir: str
    ) -> WikiPage:
        """
        Wikiページの内容を解析してWikiPageエンティティを作成する。

        Args:
            html_content: Wikiページのhtml
            title: ページタイトル
            url: ページURL
            page_number: ページ番号
            output_dir: 出力ディレクトリ

        Returns:
            WikiPage: 作成されたWikiPageエンティティ
        """
        # コンテンツの抽出
        content_html = self.html_adapter.extract_wiki_content(html_content)

        # Mermaid図の抽出と処理
        diagram_infos = self.html_adapter.extract_wiki_mermaid_diagrams(html_content)
        diagrams = []

        # コンテンツのコピーを作成（プレースホルダー置換のため）
        content_copy = BeautifulSoup(content_html, "html.parser")

        # 各Mermaid図を処理
        for diagram_idx, diagram_info in enumerate(diagram_infos):
            svg_tag = diagram_info["svg_tag"]
            pre_tag = diagram_info["pre_tag"]

            # MermaidDiagram作成（chat_block_indexの代わりにpage_numberを使用）
            diagram = MermaidDiagram(
                original_id=svg_tag.get("id", ""),
                svg_content=svg_tag,
                chat_block_index=page_number,  # ページ番号をチャットブロックインデックスとして使用
                diagram_index=diagram_idx,
            )

            # 図をリストに追加
            diagrams.append(diagram)

            # SVGをプレースホルダーに置換（必要に応じて）
            # HTML解析のままでは図が含まれない場合もあるので、コンテンツ解析方法によって調整

        # WikiPage作成
        return WikiPage(
            title=title,
            content=content_html,
            url=url,
            page_number=page_number,
            diagrams=diagrams,
        )

    def process_wiki_page_content(
        self, wiki_page: WikiPage, output_dir: str
    ) -> ProcessedAnswer:
        """
        WikiページのコンテンツをMarkdown用に処理し、Mermaid図をファイルに保存する。

        Args:
            wiki_page: 処理対象のWikiPageエンティティ
            output_dir: 出力ディレクトリ

        Returns:
            ProcessedAnswer: プレースホルダー付きのHTMLとプレースホルダーマップ
        """
        # コンテンツのコピーを作成
        content_copy = BeautifulSoup(wiki_page.content, "html.parser")
        placeholder_map = {}

        # Mermaid図を再度抽出（pre_tagを取得するため）
        diagram_infos = self.html_adapter.extract_wiki_mermaid_diagrams(
            wiki_page.content
        )

        # 各Mermaid図を処理
        for i, (diagram, diagram_info) in enumerate(
            zip(wiki_page.diagrams, diagram_infos)
        ):
            # 図を保存し、相対パスを取得
            relative_svg_path = diagram.prepare_and_save(output_dir)

            # プレースホルダー作成
            placeholder = self.html_adapter.create_placeholder(
                diagram.chat_block_index, diagram.diagram_index
            )

            # プレースホルダーとMarkdownリンクのマッピングに追加
            if relative_svg_path:
                placeholder_map[placeholder] = (
                    f"![Mermaid Diagram]({relative_svg_path})"
                )
            else:
                placeholder_map[placeholder] = ""

            # 重要: HTMLのMermaid図をプレースホルダーに置換
            if "pre_tag" in diagram_info and "svg_tag" in diagram_info:
                pre_tag = diagram_info["pre_tag"]
                svg_tag = diagram_info["svg_tag"]
                svg_id = svg_tag.get("id", "")

                # Mermaidダイアグラムに特化したセレクタを使用してpreタグを探す
                mermaid_selector = (
                    f'pre:has(div[type="button"] > div > svg[id="{svg_id}"])'
                )
                matching_pre = content_copy.select(mermaid_selector)

                if matching_pre:
                    # 見つかったpreタグをプレースホルダーに置換
                    self.html_adapter.replace_svg_with_placeholder(
                        matching_pre[0], placeholder
                    )
                    print(
                        f"Replaced diagram with id {svg_id} with placeholder: {placeholder}"
                    )
                else:
                    # IDベースの検索に失敗した場合、位置ベースで試みる
                    print(
                        f"Could not find exact match for diagram {i} with id {svg_id}, trying position-based approach"
                    )
                    # Mermaidダイアグラムに特化したセレクタでpreタグを探す
                    mermaid_pre_tags = content_copy.select(
                        'pre:has(div[type="button"][aria-haspopup="dialog"] > div > svg[id^="mermaid-"])'
                    )
                    if i < len(mermaid_pre_tags):
                        self.html_adapter.replace_svg_with_placeholder(
                            mermaid_pre_tags[i], placeholder
                        )
                        print(
                            f"Replaced diagram at position {i} with placeholder: {placeholder}"
                        )
                    else:
                        print(
                            f"Warning: Could not find appropriate pre tag for diagram {i}"
                        )

        # コンテンツのクリーンアップ
        if isinstance(content_copy, BeautifulSoup):
            self.html_adapter.unwrap_nested_pre_tags(content_copy)
            self.html_adapter.remove_empty_pre_tags(content_copy)

        # プレースホルダー付きHTMLとプレースホルダーマップを返す
        return ProcessedAnswer(
            html_content_with_placeholders=str(content_copy),
            placeholder_to_markdown_link_map=placeholder_map,
        )
