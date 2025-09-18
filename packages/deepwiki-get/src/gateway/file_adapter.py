#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File adapter for file system operations.
"""

import os


class FileAdapter:
    """
    Adapter for file system operations.
    """

    def write_file(self, filepath: str, content: str) -> None:
        """
        Writes content to a file.

        Args:
            filepath: The path to the file.
            content: The content to write.
        """
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"\n--- Content saved to {filepath} ---")
        except IOError as e:
            print(f"Error writing to file {filepath}: {e}")
            raise

    def create_directory(self, dir_path: str) -> None:
        """
        Creates a directory if it doesn't exist.

        Args:
            dir_path: The path to the directory.
        """
        try:
            os.makedirs(dir_path, exist_ok=True)
        except IOError as e:
            print(f"Error creating directory {dir_path}: {e}")
            raise

    def read_file(self, filepath: str) -> str:
        """
        Reads content from a file.

        Args:
            filepath: The path to the file.

        Returns:
            The content of the file.
        """
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()
        except IOError as e:
            print(f"Error reading file {filepath}: {e}")
            raise

    def file_exists(self, filepath: str) -> bool:
        """
        Checks if a file exists.

        Args:
            filepath: The path to the file.

        Returns:
            True if the file exists, False otherwise.
        """
        return os.path.isfile(filepath)

    def directory_exists(self, dir_path: str) -> bool:
        """
        Checks if a directory exists.

        Args:
            dir_path: The path to the directory.

        Returns:
            True if the directory exists, False otherwise.
        """
        return os.path.isdir(dir_path)
