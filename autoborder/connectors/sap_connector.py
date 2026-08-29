"""SAP S/4HANA read-only connector for BOM cost rollup extraction."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import yaml

from autoborder.config.settings import Settings, get_settings
from autoborder.connectors.base import ERPConnector
from autoborder.models import BOMComponent, BOMTree, CostLineItem, OriginStatus


class SAPConnector(ERPConnector):
    """
    Extract BOM cost trees from SAP S/4HANA.

    Uses PyRFC against MARA, MAST, STKO, and CSAP when credentials are configured.
    Falls back to mock sandbox data for development and design partner demos.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._mapping = self._load_table_mapping()

    def _load_table_mapping(self) -> dict[str, Any]:
        mapping_path = self.settings.config_dir / "sap_mapping.yaml"
        with mapping_path.open(encoding="utf-8") as handle:
            return yaml.safe_load(handle)["sap"]

    def health_check(self) -> dict[str, str]:
        if self.settings.sap_enabled:
            return {"status": "configured", "mode": "live", "host": self.settings.sap_ashost}
        return {"status": "ok", "mode": "mock", "source": "brake_rotor_bom.json"}

    def extract_bom(self, part_number: str, plant: str = "1000") -> BOMTree:
        if self.settings.sap_enabled:
            return self._extract_from_sap(part_number, plant)
        return self._extract_from_mock(part_number, plant)

    def _extract_from_mock(self, part_number: str, plant: str) -> BOMTree:
        mock_path = self.settings.mock_data_dir / "brake_rotor_bom.json"
        if not mock_path.exists():
            raise FileNotFoundError(f"Mock BOM data not found: {mock_path}")

        with mock_path.open(encoding="utf-8") as handle:
            payload = json.load(handle)

        if part_number != payload["root_part_number"]:
            raise ValueError(
                f"Mock sandbox only contains part {payload['root_part_number']}. "
                f"Requested: {part_number}"
            )

        tree = BOMTree.model_validate(payload)
        tree.plant = plant
        tree.extracted_at = datetime.now(UTC).isoformat()
        return tree

    def _extract_from_sap(self, part_number: str, plant: str) -> BOMTree:
        """
        Live SAP extraction via PyRFC.

        Requires SAP NW RFC SDK and pyrfc installed (`pip install autoborder-comply[sap]`).
        """
        try:
            from pyrfc import Connection  # type: ignore[import-untyped]
        except ImportError as exc:
            raise RuntimeError(
                "PyRFC not installed. Run: pip install autoborder-comply[sap]"
            ) from exc

        conn = Connection(
            ashost=self.settings.sap_ashost,
            sysnr=self.settings.sap_sysnr,
            client=self.settings.sap_client,
            user=self.settings.sap_user,
            passwd=self.settings.sap_password,
        )

        try:
            material = self._read_material_master(conn, part_number)
            bom_header = self._read_bom_header(conn, part_number, plant)
            components = self._read_bom_components(conn, part_number, plant)
            root = self._build_component_tree(conn, part_number, plant, material, components)
            return BOMTree(
                root_part_number=part_number,
                description=material.get("MAKTX", part_number),
                plant=plant,
                extraction_source="sap_s4hana",
                extracted_at=datetime.now(UTC).isoformat(),
                root=root,
                metadata={"bom_header": bom_header, "tables": list(self._mapping["tables"].values())},
            )
        finally:
            conn.close()

    def _read_material_master(self, conn: Any, part_number: str) -> dict[str, Any]:
        table = self._mapping["tables"]["material_master"]
        result = conn.call(
            "RFC_READ_TABLE",
            QUERY_TABLE=table,
            DELIMITER="|",
            FIELDS=[{"FIELDNAME": "MATNR"}, {"FIELDNAME": "MAKTX"}, {"FIELDNAME": "HERKL"}],
            OPTIONS=[{"TEXT": f"MATNR EQ '{part_number.zfill(18)}'"}],
        )
        rows = [row["WA"].split("|") for row in result.get("DATA", [])]
        if not rows:
            raise ValueError(f"Material {part_number} not found in {table}")
        return {"MATNR": rows[0][0].strip(), "MAKTX": rows[0][1].strip(), "HERKL": rows[0][2].strip()}

    def _read_bom_header(self, conn: Any, part_number: str, plant: str) -> dict[str, Any]:
        table = self._mapping["tables"]["bom_headers"]
        result = conn.call(
            "RFC_READ_TABLE",
            QUERY_TABLE=table,
            DELIMITER="|",
            FIELDS=[{"FIELDNAME": "STLNR"}, {"FIELDNAME": "WRKAN"}],
            OPTIONS=[{"TEXT": f"MATNR EQ '{part_number.zfill(18)}' AND WERKS EQ '{plant}'"}],
        )
        rows = [row["WA"].split("|") for row in result.get("DATA", [])]
        return {"STLNR": rows[0][0].strip() if rows else "", "plant": plant}

    def _read_bom_components(self, conn: Any, part_number: str, plant: str) -> list[dict[str, Any]]:
        table = self._mapping["tables"]["bom_links"]
        result = conn.call(
            "RFC_READ_TABLE",
            QUERY_TABLE=table,
            DELIMITER="|",
            FIELDS=[
                {"FIELDNAME": "IDNRK"},
                {"FIELDNAME": "MENGE"},
                {"FIELDNAME": "MEINS"},
            ],
            OPTIONS=[{"TEXT": f"MATNR EQ '{part_number.zfill(18)}' AND WERKS EQ '{plant}'"}],
        )
        components = []
        for row in result.get("DATA", []):
            cols = row["WA"].split("|")
            components.append(
                {
                    "IDNRK": cols[0].strip().lstrip("0"),
                    "MENGE": float(cols[1].strip() or 0),
                    "MEINS": cols[2].strip(),
                }
            )
        return components

    def _build_component_tree(
        self,
        conn: Any,
        part_number: str,
        plant: str,
        material: dict[str, Any],
        components: list[dict[str, Any]],
        visited: set[str] | None = None,
    ) -> BOMComponent:
        visited = visited or set()
        if part_number in visited:
            return BOMComponent(
                part_number=part_number,
                description=f"Circular reference: {part_number}",
                origin_status=OriginStatus.UNKNOWN,
            )
        visited.add(part_number)

        children: list[BOMComponent] = []
        for comp in components:
            child_number = comp["IDNRK"]
            child_material = self._read_material_master(conn, child_number)
            child_components = self._read_bom_components(conn, child_number, plant)
            child = self._build_component_tree(
                conn, child_number, plant, child_material, child_components, visited.copy()
            )
            child.quantity = comp["MENGE"]
            child.unit = comp["MEINS"]
            child.unit_cost = self._read_standard_cost(conn, child_number, plant)
            children.append(child)

        return BOMComponent(
            part_number=part_number,
            description=material.get("MAKTX", part_number),
            origin_country=material.get("HERKL"),
            origin_status=self._infer_origin_status(material.get("HERKL")),
            children=children,
            unit_cost=self._read_standard_cost(conn, part_number, plant),
        )

    def _read_standard_cost(self, conn: Any, part_number: str, plant: str) -> float:
        table = self._mapping["tables"]["costing"]
        result = conn.call(
            "RFC_READ_TABLE",
            QUERY_TABLE=table,
            DELIMITER="|",
            FIELDS=[{"FIELDNAME": "STPRS"}],
            OPTIONS=[{"TEXT": f"MATNR EQ '{part_number.zfill(18)}' AND WERKS EQ '{plant}'"}],
        )
        rows = [row["WA"].split("|") for row in result.get("DATA", [])]
        if not rows:
            return 0.0
        return float(rows[0][0].strip() or 0) / 100.0

    @staticmethod
    def _infer_origin_status(country_code: str | None) -> OriginStatus:
        if not country_code:
            return OriginStatus.UNKNOWN
        if country_code.upper() in {"US", "MX", "CA"}:
            return OriginStatus.ORIGINATING
        return OriginStatus.NON_ORIGINATING

    def export_json(self, bom: BOMTree, output_path: Path) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(bom.model_dump_json(indent=2), encoding="utf-8")
        return output_path

    @staticmethod
    def parse_cost_lines(raw: dict[str, Any]) -> list[CostLineItem]:
        return [CostLineItem.model_validate(item) for item in raw.get("cost_lines", [])]
