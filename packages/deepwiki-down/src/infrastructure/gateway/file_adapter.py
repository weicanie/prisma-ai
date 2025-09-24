#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os


class FileAdapter:

    def write_file(self, filepath: str, content: str) -> None:
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"\n--- Content saved to {filepath} ---")
        except IOError as e:
            print(f"Error writing to file {filepath}: {e}")
            raise

    def create_directory(self, dir_path: str) -> None:
        try:
            os.makedirs(dir_path, exist_ok=True)
        except IOError as e:
            print(f"Error creating directory {dir_path}: {e}")
            raise
