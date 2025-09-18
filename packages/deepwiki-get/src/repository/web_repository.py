#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Web repository for fetching web content using the WebAdapter.
"""

import asyncio
from src.gateway.web_adapter import WebAdapter


class WebRepository:
    """
    Repository for web operations, using WebAdapter.
    """

    def __init__(self, web_adapter: WebAdapter):
        """
        Initialize the WebRepository with a WebAdapter.

        Args:
            web_adapter: The WebAdapter to use for web operations.
        """
        self.web_adapter = web_adapter

    async def fetch_content(self, url: str) -> str:
        """
        Fetches HTML content from a URL.

        Args:
            url: The URL to fetch content from.

        Returns:
            The HTML content as a string.
        """
        return await self.web_adapter.fetch(url)
