#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CLI interface for deepwiki-to-md.
"""

import argparse
import asyncio
import os
import sys

from src.usecase.chat_page_usecase import ConvertChatPageToMarkdownUsecase
from src.usecase.wiki_site_usecase import ConvertWikiSiteToMarkdownUsecase
from src.gateway.web_adapter import WebAdapter
from src.gateway.html_adapter import HtmlAdapter
from src.gateway.markdown_adapter import MarkdownAdapter
from src.gateway.file_adapter import FileAdapter
from src.repository.web_repository import WebRepository
from src.repository.html_repository import HtmlRepository
from src.repository.markdown_repository import MarkdownRepository
from src.repository.file_repository import FileRepository


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="DeepWiki content to Markdown converter."
    )

    # サブコマンドを設定
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # chatコマンド - チャットページをMarkdownに変換
    chat_parser = subparsers.add_parser("chat", help="Convert chat page to Markdown")
    chat_parser.add_argument("url", help="URL of the chat page")
    chat_parser.add_argument(
        "-o",
        "--output",
        help="Output directory path (default: current directory)",
        default=os.getcwd(),
    )

    # wikiコマンド - WikiサイトをMarkdownに変換
    wiki_parser = subparsers.add_parser("wiki", help="Convert wiki site to Markdown")
    wiki_parser.add_argument("url", help="URL of the wiki site")
    wiki_parser.add_argument(
        "-o",
        "--output",
        help="Output directory path (default: current directory)",
        default=os.getcwd(),
    )

    # コマンドが指定されていない場合のデフォルトヘルプ
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)

    return parser.parse_args()


async def execute_chat_command(url: str, output_dir: str):
    """chatコマンドを実行する"""
    # Initialize adapters
    web_adapter = WebAdapter()
    html_adapter = HtmlAdapter()
    markdown_adapter = MarkdownAdapter()
    file_adapter = FileAdapter()

    # Initialize repositories
    web_repository = WebRepository(web_adapter)
    html_repository = HtmlRepository(html_adapter)
    markdown_repository = MarkdownRepository(markdown_adapter)
    file_repository = FileRepository(file_adapter)

    # Initialize usecase
    usecase = ConvertChatPageToMarkdownUsecase(
        web_repository,
        html_repository,
        markdown_repository,
        file_repository,
    )

    # Execute the usecase
    await usecase.execute(url, output_dir)


async def execute_wiki_command(url: str, output_dir: str):
    """wikiコマンドを実行する"""
    # Initialize adapters
    web_adapter = WebAdapter()
    html_adapter = HtmlAdapter()
    markdown_adapter = MarkdownAdapter()
    file_adapter = FileAdapter()

    # Initialize repositories
    web_repository = WebRepository(web_adapter)
    html_repository = HtmlRepository(html_adapter)
    markdown_repository = MarkdownRepository(markdown_adapter)
    file_repository = FileRepository(file_adapter)

    # Initialize usecase
    usecase = ConvertWikiSiteToMarkdownUsecase(
        web_repository,
        html_repository,
        markdown_repository,
        file_repository,
    )

    # Execute the usecase
    await usecase.execute(url, output_dir)


async def run_cli():
    """Run the CLI application."""
    try:
        # Parse command line arguments
        args = parse_arguments()

        # コマンドに応じて処理を分岐
        if args.command == "chat":
            await execute_chat_command(args.url, args.output)
        elif args.command == "wiki":
            await execute_wiki_command(args.url, args.output)
        else:
            print("Error: Unknown command. Use 'chat' or 'wiki'.")
            return 1
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    return 0


def main():
    """Main entry point for the CLI application."""
    return asyncio.run(run_cli())


if __name__ == "__main__":
    sys.exit(main())
