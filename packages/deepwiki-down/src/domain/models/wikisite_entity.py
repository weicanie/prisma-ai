#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from dataclasses import dataclass
from urllib.parse import urlparse

@dataclass
class WikiSite:

    organization: str  # 从URL提取组织名称（例如langchain-ai）
    repository: str  # 从URL提取仓库名称（例如langchain）

    def get_output_directory(self, base_dir: str) -> str:
        """
        生成输出目录路径。
        """
        return os.path.join(base_dir, "wiki", self.organization, self.repository)

    @classmethod
    def from_url(cls, url: str) -> "WikiSite":
        parsed_url = urlparse(url)
        path_parts = parsed_url.path.strip("/").split("/")

        if len(path_parts) < 2:
            raise ValueError(
                f"Invalid DeepWiki URL format: {url}. "
            )

        organization = path_parts[0]
        repository = path_parts[1]

        return cls(organization=organization, repository=repository)
