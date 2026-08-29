"""Parse uploaded BOM files into BOMTree models."""

from __future__ import annotations

import json
from typing import Any

from autoborder.models import BOMTree


class BOMParser:
    """Accept AutoBorder JSON BOM exports and SAP-style flat BOM uploads."""

    def parse_json(self, raw: str | bytes) -> BOMTree:
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")
        payload = json.loads(raw)
        return self._normalize(payload)

    def _normalize(self, payload: dict[str, Any]) -> BOMTree:
        if "root" in payload:
            return BOMTree.model_validate(payload)

        if "components" in payload:
            return self._from_flat(payload)

        raise ValueError(
            "Unsupported BOM format. Upload AutoBorder JSON export or flat BOM with 'components' array."
        )

    def _from_flat(self, payload: dict[str, Any]) -> BOMTree:
        """Convert flat parent/child BOM rows into nested BOMTree."""
        from autoborder.models import BOMComponent, OriginStatus

        components = payload["components"]
        by_part: dict[str, BOMComponent] = {}

        for row in components:
            status_raw = str(row.get("origin_status", "unknown")).lower()
            try:
                origin_status = OriginStatus(status_raw)
            except ValueError:
                origin_status = OriginStatus.UNKNOWN

            by_part[row["part_number"]] = BOMComponent(
                part_number=row["part_number"],
                description=row.get("description", row["part_number"]),
                quantity=float(row.get("quantity", 1)),
                unit=row.get("unit", "EA"),
                unit_cost=float(row.get("unit_cost", 0)),
                origin_country=row.get("origin_country"),
                origin_status=origin_status,
                originating_content_pct=row.get("originating_content_pct"),
            )

        root_number = payload.get("root_part_number") or components[0]["part_number"]
        children_map: dict[str, list[str]] = {}
        for row in components:
            parent = row.get("parent_part_number")
            if parent:
                children_map.setdefault(parent, []).append(row["part_number"])

        def attach(part_number: str) -> BOMComponent:
            node = by_part[part_number]
            node.children = [attach(child) for child in children_map.get(part_number, [])]
            return node

        return BOMTree(
            root_part_number=root_number,
            description=payload.get("description", by_part[root_number].description),
            extraction_source="upload",
            root=attach(root_number),
        )
