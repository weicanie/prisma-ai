#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Markdown adapter for converting HTML to Markdown using markdownify.
"""

from markdownify import markdownify as markdownify_func


class MarkdownAdapter:
    """
    Adapter for converting HTML to Markdown using markdownify.
    """

    def convert_html_to_markdown(self, html_str: str) -> str:
        """
        Converts HTML to Markdown.

        Args:
            html_str: HTML content as a string.

        Returns:
            The converted Markdown content.
        """
        return markdownify_func(html_str, heading_style="atx", strip=["button"])
