#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CLI interface for deepwiki-to-md.
"""

import argparse
import asyncio
import os
import sys

from src.application.usecase.rsc_wiki_usecase import ConvertWikiSiteToMarkdownViaRSCUsecase
from src.infrastructure.gateway.file_adapter import FileAdapter
from src.infrastructure.gateway.rsc_adapter import RSCAdapter
from src.infrastructure.repository.file_repository import FileRepository
from src.infrastructure.repository.rsc_repository import RSCRepository


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="DeepWiki content to Markdown converter."
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    wiki_parser = subparsers.add_parser("wiki", help="Convert wiki site to Markdown")
    wiki_parser.add_argument("url", help="URL of the wiki site")
    wiki_parser.add_argument(
        "-o",
        "--output",
        help="Output directory path (default: current directory)",
        default=os.getcwd(),
    )

    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)

    return parser.parse_args()


async def execute_wiki_command(url: str, output_dir: str):
    """Execute wiki command."""
    
    # RSC mode: Direct Markdown extraction
    print("Using RSC (React Server Components) interception mode...")
    
    # Initialize adapters for RSC mode
    rsc_adapter = RSCAdapter()
    file_adapter = FileAdapter()
    
    # Initialize repositories for RSC mode
    rsc_repository = RSCRepository(rsc_adapter)
    file_repository = FileRepository(file_adapter)
    
    # Initialize RSC usecase
    usecase = ConvertWikiSiteToMarkdownViaRSCUsecase(
        rsc_repository,
        file_repository,
    )
    
    # Execute the RSC usecase
    await usecase.execute(url, output_dir)
        



async def run_cli():
    """Run the CLI application."""
    try:
        # Parse command line arguments
        args = parse_arguments()

        # Branch according to the command
        if args.command == "wiki":
            await execute_wiki_command(args.url, args.output)
        else:
            print("Error: Unknown command. Use 'wiki'.")
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
