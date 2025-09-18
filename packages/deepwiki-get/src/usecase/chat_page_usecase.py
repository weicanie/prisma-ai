#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Usecase for converting a chat page to markdown.
"""

import os
from src.domain.entities import ChatLog
from src.repository.web_repository import WebRepository
from src.repository.html_repository import HtmlRepository
from src.repository.markdown_repository import MarkdownRepository
from src.repository.file_repository import FileRepository


class ConvertChatPageToMarkdownUsecase:
    """
    Usecase for converting a web page's chat content to a Markdown document.
    """

    def __init__(
        self,
        web_repository: WebRepository,
        html_repository: HtmlRepository,
        markdown_repository: MarkdownRepository,
        file_repository: FileRepository,
    ):
        """
        Initialize the usecase with repositories.

        Args:
            web_repository: For fetching web content.
            html_repository: For parsing HTML content.
            markdown_repository: For converting to markdown.
            file_repository: For file operations.
        """
        self.web_repository = web_repository
        self.html_repository = html_repository
        self.markdown_repository = markdown_repository
        self.file_repository = file_repository

    async def execute(self, url: str, output_base_dir: str) -> None:
        """
        チャットページをMarkdownに変換する。

        Args:
            url: DeepWiki ChatページのURL (例: https://deepwiki.com/search/chat_id)
            output_base_dir: 出力ディレクトリのベースパス
        """
        print("Starting the HTML to Markdown conversion process...")
        print(f"Target URL: {url}")
        print(f"Output Base Directory: {output_base_dir}")

        # URLからチャットIDを抽出
        chat_id = self._extract_chat_id_from_url(url)

        # 出力ディレクトリ構造を作成
        output_dir = os.path.join(output_base_dir, "chat", chat_id)
        images_dir = os.path.join(output_dir, "images")
        self.file_repository.ensure_directory(output_dir)
        self.file_repository.ensure_directory(images_dir)

        # 出力ファイルパスの設定
        output_md_filepath = os.path.join(output_dir, "chat.md")

        print(f"Output Markdown File: {output_md_filepath}")
        print(f"SVG files will be saved in: {images_dir}")

        # Fetch page content
        page_html = await self.web_repository.fetch_content(url)
        if not page_html:
            print("Failed to retrieve page content. Exiting.")
            return

        print("Page content retrieved, parsing HTML...")

        # Extract chat blocks
        chat_blocks = self.html_repository.extract_chat_blocks(page_html, output_dir)

        if not chat_blocks:
            print("No chat blocks found. Exiting.")
            return

        print(f"Found {len(chat_blocks)} chat block(s). Processing...")

        # Create chat log
        chat_log = ChatLog()
        for block in chat_blocks:
            chat_log.add_chat_block(block)

        # Convert to markdown
        final_markdown = self.markdown_repository.convert_chat_log_to_markdown(chat_log)

        if not final_markdown.strip():
            print(
                "No content was extracted to Markdown. The output file will be empty or not created."
            )
            return

        # Save markdown to file
        self.file_repository.save_markdown(final_markdown, output_md_filepath)

        print(f"Successfully converted chat from {url}")
        print(f"Output directory: {output_dir}")

    def _extract_chat_id_from_url(self, url: str) -> str:
        """
        URLからチャットIDを抽出する。

        Args:
            url: チャットページのURL

        Returns:
            str: 抽出されたチャットID、または抽出できない場合はデフォルト値
        """
        import re
        import urllib.parse

        # URLをパース
        parsed_url = urllib.parse.urlparse(url)

        # パスからIDを抽出（例: /search/chat_xyz → chat_xyz）
        path_parts = parsed_url.path.strip("/").split("/")
        if len(path_parts) >= 2 and path_parts[0] == "search":
            return path_parts[1]

        # クエリパラメータからIDを抽出（例: ?id=chat_xyz）
        query_params = urllib.parse.parse_qs(parsed_url.query)
        if "id" in query_params and query_params["id"]:
            return query_params["id"][0]

        # 正規表現でURLから何かしらのIDを抽出
        match = re.search(r"([a-zA-Z0-9_-]{4,})(?:[/?#]|$)", url)
        if match:
            return match.group(1)

        # 最後の手段：URLのハッシュ値を使用
        import hashlib

        return hashlib.md5(url.encode()).hexdigest()[:12]
