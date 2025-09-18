#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Web adapter for fetching web pages using Playwright.
"""

import asyncio
from playwright.async_api import async_playwright


class WebAdapter:
    """
    Adapter to fetch web page content using Playwright.
    """

    async def fetch(self, url: str) -> str:
        """
        Fetches the HTML content of a web page.

        Args:
            url: The URL of the page to fetch.

        Returns:
            The HTML content of the page as a string.
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            content = ""
            try:
                print(f"Navigating to {url}...")
                await page.goto(url, wait_until="networkidle", timeout=60000)
                print(
                    "Page loaded. Waiting for potential dynamic content (e.g., 1 second)..."
                )
                await page.wait_for_timeout(1000)
                print("Retrieving page content...")
                content = await page.content()
                print("Content retrieved.")
            except Exception as e:
                print(f"Error during Playwright navigation or content retrieval: {e}")
                # Let the exception propagate to the repository layer
                raise
            finally:
                await browser.close()
            return content
