#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Usecase for converting a wiki site to markdown.
"""

import os
from typing import Optional
from src.domain.entities import WikiPage, WikiSite
from src.repository.web_repository import WebRepository
from src.repository.html_repository import HtmlRepository
from src.repository.markdown_repository import MarkdownRepository
from src.repository.file_repository import FileRepository


class ConvertWikiSiteToMarkdownUsecase:
    """
    Usecase for converting a DeepWiki site to a collection of Markdown documents.
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
        WikiサイトをMarkdownファイルのコレクションに変換する。

        Args:
            url: DeepWikiのURL (例: https://deepwiki.com/langchain-ai/langchain)
            output_base_dir: 出力ディレクトリのベースパス
        """
        print("Starting Wiki to Markdown conversion process...")
        print(f"Target URL: {url}")
        print(f"Output Base Directory: {output_base_dir}")

        # 1. URLからWikiサイト情報を抽出
        wiki_site = WikiSite.from_url(url)
        print(f"Processing wiki for {wiki_site.organization}/{wiki_site.repository}")

        # 2. 出力ディレクトリ構造を作成
        output_dir = wiki_site.get_output_directory(output_base_dir)
        images_dir = os.path.join(output_dir, "images")
        self.file_repository.ensure_directory(output_dir)
        self.file_repository.ensure_directory(images_dir)
        print(f"Output directory: {output_dir}")
        print(f"Images directory: {images_dir}")

        # 3. メインページのHTMLを取得
        print(f"Fetching main wiki page: {url}")
        main_page_html = await self.web_repository.fetch_content(url)
        if not main_page_html:
            print("Failed to retrieve main page. Exiting.")
            return

        # 4. ナビゲーションメニューからすべてのページリンクを抽出
        navigation_links = self.html_repository.extract_wiki_navigation(main_page_html)
        if not navigation_links:
            print("No navigation links found. Exiting.")
            return

        print(f"Found {len(navigation_links)} wiki pages.")

        # 5. 各ページを処理
        for page_num, page_link in enumerate(navigation_links, 1):
            page_url = page_link["url"]
            page_title = page_link["title"]

            print(f"Processing page {page_num}/{len(navigation_links)}: {page_title}")

            # 5.1. ページコンテンツの取得
            page_html = await self.web_repository.fetch_content(page_url)
            if not page_html:
                print(f"Failed to retrieve page: {page_title}. Skipping.")
                continue

            # 5.2. ページコンテンツの解析とMermaid図の抽出
            wiki_page = self.html_repository.extract_wiki_page(
                page_html,
                title=page_title,
                url=page_url,
                page_number=page_num,
                output_dir=output_dir,
            )

            # 5.3. ページコンテンツの処理（Mermaid図の保存など）
            processed_content = self.html_repository.process_wiki_page_content(
                wiki_page, output_dir
            )

            # 5.4. Markdownへの変換
            markdown_content = self.markdown_repository.convert_wiki_to_markdown(
                wiki_page, processed_content
            )

            # 5.5. Markdownファイルの保存
            page_filename = wiki_page.get_filename()
            page_filepath = os.path.join(output_dir, page_filename)
            self.file_repository.save_markdown(markdown_content, page_filepath)
            print(f"Saved: {page_filepath}")

            # WikiSiteにページを追加
            wiki_site.add_page(wiki_page)

        # 6. インデックス（目次）ページの生成と保存
        index_content = self.markdown_repository.generate_wiki_index(wiki_site)
        index_filepath = os.path.join(output_dir, "index.md")
        self.file_repository.save_markdown(index_content, index_filepath)
        print(f"Generated index page: {index_filepath}")

        print(f"Successfully converted {len(wiki_site.pages)} wiki pages to Markdown.")
        print(f"Output directory: {output_dir}")
