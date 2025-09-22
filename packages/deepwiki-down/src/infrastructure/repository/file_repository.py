#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

from src.infrastructure.gateway.file_adapter import FileAdapter


class FileRepository:
    """
    Repository for file system operations, using FileAdapter.
    """

    def __init__(self, file_adapter: FileAdapter):
        """
        Initialize the FileRepository with a FileAdapter.

        Args:
            file_adapter: The FileAdapter to use for file system operations.
        """
        self.file_adapter = file_adapter

    def save_markdown(self, content: str, filepath: str) -> None:
        """
        Saves markdown content to a file.

        Args:
            content: The markdown content to save.
            filepath: The path to the file.
        """
        self.file_adapter.write_file(filepath, content)

    def create_directory(self, dir_path: str) -> None:
        """
        Creates a directory if it doesn't exist.

        Args:
            dir_path: The path to the directory.
        """
        self.file_adapter.create_directory(dir_path)

    def ensure_directory(self, dir_path: str) -> str:
        """
        Ensures that the specified directory exists.
        Creates it if it doesn't exist.

        Args:
            dir_path: The path to the directory.

        Returns:
            The directory path.
        """
        abs_path = os.path.abspath(dir_path)
        self.create_directory(abs_path)
        return abs_path
