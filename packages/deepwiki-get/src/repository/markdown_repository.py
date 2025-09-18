#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Markdown repository for converting entities to markdown using the MarkdownAdapter.
"""

from typing import Optional
from src.domain.entities import ProcessedAnswer, ChatLog, WikiPage, WikiSite
from src.gateway.markdown_adapter import MarkdownAdapter


class MarkdownRepository:
    """
    Repository for markdown operations, using MarkdownAdapter.
    """

    def __init__(self, markdown_adapter: MarkdownAdapter):
        """
        Initialize the MarkdownRepository with a MarkdownAdapter.

        Args:
            markdown_adapter: The MarkdownAdapter to use for markdown conversions.
        """
        self.markdown_adapter = markdown_adapter

    def convert_processed_answer_to_markdown(
        self, processed_answer: ProcessedAnswer
    ) -> str:
        """
        Converts a ProcessedAnswer entity to markdown.

        Args:
            processed_answer: The ProcessedAnswer entity to convert.

        Returns:
            The markdown representation of the processed answer.
        """
        return processed_answer.to_markdown(self.markdown_adapter)

    def convert_chat_log_to_markdown(self, chat_log: ChatLog) -> str:
        """
        Converts a ChatLog entity to markdown.

        Args:
            chat_log: The ChatLog entity to convert.

        Returns:
            The markdown representation of the chat log.
        """
        return chat_log.to_markdown(self.markdown_adapter)

    # ----- Wiki関連のメソッド -----

    def convert_wiki_to_markdown(
        self, wiki_page: WikiPage, processed_content: ProcessedAnswer
    ) -> str:
        """
        WikiページをMarkdownに変換する。

        Args:
            wiki_page: 変換対象のWikiPageエンティティ
            processed_content: 処理済みのページコンテンツ

        Returns:
            str: 変換されたMarkdown
        """
        # 基本的なコンテンツをMarkdownに変換
        markdown_content = self.markdown_adapter.convert_html_to_markdown(
            processed_content.html_content_with_placeholders
        )

        # Mermaid図のプレースホルダーを置き換え
        for (
            placeholder,
            md_link,
        ) in processed_content.placeholder_to_markdown_link_map.items():
            if placeholder in markdown_content:
                markdown_content = markdown_content.replace(placeholder, md_link)
            else:
                print(
                    f"Warning: Placeholder '{placeholder}' not found in markdownified content for replacement."
                )

        # タイトルをページの先頭に追加
        title_prefix = f"# {wiki_page.title}\n\n"

        return title_prefix + markdown_content

    def generate_wiki_index(self, wiki_site: WikiSite) -> str:
        """
        Wiki全体の目次ページを生成する。

        Args:
            wiki_site: WikiSiteエンティティ

        Returns:
            str: 目次ページのMarkdown
        """
        lines = [
            f"# {wiki_site.repository} Wiki",
            f"Organization: {wiki_site.organization}",
            "",
            "## Pages",
            "",
        ]

        # ページリンクのリストを生成
        for page in wiki_site.pages:
            filename = page.get_filename()
            lines.append(f"- [{page.title}]({filename})")

        return "\n".join(lines)
