"""Amazon KDP metrics — CSV import (no public KDP API)."""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class KdpResult:
    status: str
    error: str | None
    units_sold: int | None = None
    royalties: float | None = None
    kenp_read: int | None = None
    source_file: str | None = None
    raw: dict[str, Any] | None = None


def _find_col(row: dict[str, str], *candidates: str) -> str | None:
    lower = {k.strip().lower(): v for k, v in row.items()}
    for c in candidates:
        if c.lower() in lower and lower[c.lower()] not in ("", None):
            return lower[c.lower()]
    return None


def _parse_number(val: str | None) -> float | None:
    if val is None:
        return None
    cleaned = val.strip().replace(",", "").replace("$", "").replace("£", "").replace("€", "")
    if not cleaned or cleaned == "-":
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_kdp_csv(path: Path) -> KdpResult:
    """Parse KDP sales/royalty CSV export."""
    if not path.exists():
        return KdpResult("error", f"File not found: {path}")

    units = 0
    royalties = 0.0
    kenp = 0
    rows = 0

    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return KdpResult("error", "Empty or invalid CSV")

        for row in reader:
            rows += 1
            u = _parse_number(_find_col(row, "Units Sold", "Units", "Net Units Sold", "Quantity"))
            r = _parse_number(
                _find_col(
                    row,
                    "Royalty",
                    "Royalties",
                    "Estimated Royalty",
                    "Royalty (USD)",
                    "Earnings",
                )
            )
            k = _parse_number(_find_col(row, "KENP Read", "KENP", "Kindle Edition Normalized Pages (KENP) Read"))
            if u:
                units += int(u)
            if r:
                royalties += r
            if k:
                kenp += int(k)

    if rows == 0:
        return KdpResult("error", "No data rows in CSV")

    return KdpResult(
        status="ok",
        error=None,
        units_sold=units or None,
        royalties=round(royalties, 2) if royalties else None,
        kenp_read=kenp or None,
        source_file=str(path.name),
        raw={"rows": rows},
    )


def fetch_kdp(config: dict[str, str | None]) -> KdpResult:
    csv_path = config.get("kdp_csv_path")
    if not csv_path:
        return KdpResult("not_configured", "KDP_CSV_PATH not set — export from KDP Reports and set path")
    return parse_kdp_csv(Path(csv_path))
