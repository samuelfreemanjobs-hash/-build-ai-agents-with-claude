"""Parse Gmail message payloads into clean text."""

from __future__ import annotations

import base64
import re
from html import unescape
from typing import Any

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # type: ignore[misc, assignment]


def extract_body(payload: dict[str, Any]) -> tuple[str, str]:
    """Return (plain_text, html) from a Gmail message payload."""
    plain_parts: list[str] = []
    html_parts: list[str] = []

    def walk(part: dict[str, Any]) -> None:
        mime = part.get("mimeType", "")
        body = part.get("body", {})
        data = body.get("data")
        if data:
            decoded = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
            if mime == "text/plain":
                plain_parts.append(decoded)
            elif mime == "text/html":
                html_parts.append(decoded)
        for child in part.get("parts", []):
            walk(child)

    walk(payload)

    html = "\n".join(html_parts)
    plain = "\n".join(plain_parts)

    if not plain and html:
        plain = html_to_text(html)

    plain = clean_text(plain)
    return plain, html


def html_to_text(html: str) -> str:
    if BeautifulSoup is not None:
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "head"]):
            tag.decompose()
        text = soup.get_text("\n")
    else:
        text = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
        text = re.sub(r"</p>", "\n\n", text, flags=re.I)
        text = re.sub(r"<[^>]+>", "", text)
    return unescape(text)


def clean_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    # Strip common email footer noise (unsubscribe blocks)
    text = re.sub(
        r"\n(?:unsubscribe|manage preferences|view in browser).*$",
        "",
        text,
        flags=re.I | re.S,
    )
    return text.strip()


def extract_preview(text: str, *, max_chars: int = 600) -> str:
    if len(text) <= max_chars:
        return text
    cut = text[:max_chars]
    last_para = cut.rfind("\n\n")
    if last_para > max_chars // 2:
        return cut[:last_para].strip() + "\n\n[...]"
    return cut.strip() + "..."
