#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Constants used in the deepwiki-to-md application, particularly for SVG styling.
"""

# --- Constants for Styling ---
VISIBLE_TEXT_COLOR = "#202020"  # Slightly off-black
GENERIC_FONT_FAMILY = "Arial, Helvetica, sans-serif"
DEFAULT_FONT_SIZE = "14px"
FOREIGN_OBJECT_TEXT_STYLE = (
    f"color: {VISIBLE_TEXT_COLOR} !important; "
    f"font-family: {GENERIC_FONT_FAMILY} !important; "
    f"font-size: {DEFAULT_FONT_SIZE} !important; "
    f"background-color: transparent !important; "
    f"visibility: visible !important; "
    f"opacity: 1 !important; "
    f"display: inline !important; "  # Prefer inline for flexibility within foreignObject
    f"margin: 0 !important; "  # Reset margins
    f"padding: 0 !important; "  # Reset paddings
    f"border: none !important;"  # Reset borders
)
