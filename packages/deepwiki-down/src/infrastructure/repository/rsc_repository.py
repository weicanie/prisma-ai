#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
RSC repository for managing RSC-based content extraction.
"""

from typing import Dict, List, Tuple
from src.infrastructure.gateway.rsc_adapter import RSCAdapter


class RSCRepository:
    """
    Repository for RSC operations, using RSCAdapter.
    """

    def __init__(self, rsc_adapter: RSCAdapter):
        """
        Initialize the RSCRepository with an RSCAdapter.

        Args:
            rsc_adapter: The RSCAdapter to use for RSC operations.
        """
        self.rsc_adapter = rsc_adapter

    async def fetch_wiki_content(self, base_url: str) -> Tuple[List[Dict], Dict[str, str], Dict[str, Dict]]:
        """
        通过RSC请求获取Wiki内容。

        Args:
            base_url: Wiki的基础URL

        Returns:
            Tuple[List[Dict], Dict[str, str], Dict[str, Dict]]: (页面信息列表, URL到内容的映射, 所有页面的详细信息)
        """
        pages_info, content_map = await self.rsc_adapter.fetch_wiki_content_via_rsc(base_url)
        # 从适配器获取详细的页面信息
        all_pages_content = getattr(self.rsc_adapter, '_last_pages_content', {})
        return pages_info, content_map, all_pages_content
