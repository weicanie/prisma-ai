#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File repository for file system operations using the FileAdapter.
"""

import os
from typing import Optional

from src.gateway.file_adapter import FileAdapter


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

    def read_file(self, filepath: str) -> str:
        """
        Reads content from a file.

        Args:
            filepath: The path to the file.

        Returns:
            The content of the file.
        """
        return self.file_adapter.read_file(filepath)

    def file_exists(self, filepath: str) -> bool:
        """
        Checks if a file exists.

        Args:
            filepath: The path to the file.

        Returns:
            True if the file exists, False otherwise.
        """
        return self.file_adapter.file_exists(filepath)

    def ensure_output_directory(self, filepath: str) -> str:
        """
        Ensures that the directory for the output file exists.
        Creates it if it doesn't exist.

        Args:
            filepath: The path to the file.

        Returns:
            The directory path.
        """
        dir_path = os.path.dirname(os.path.abspath(filepath))
        self.create_directory(dir_path)
        return dir_path

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
