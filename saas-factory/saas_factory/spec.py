"""Product specification loading and validation."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import jsonschema
import yaml

FACTORY_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = FACTORY_ROOT / "schemas" / "product-spec.schema.json"
PRODUCTS_DIR = FACTORY_ROOT / "products"


@dataclass
class ProductSpec:
    """Validated product definition for the SaaS factory."""

    id: str
    name: str
    tagline: str
    architecture: str
    icp: str
    wedge: str
    status: str
    path: str | None = None
    category: str | None = None
    pipeline: list[dict[str, Any]] = field(default_factory=list)
    skills: list[str] = field(default_factory=list)
    deterministic_modules: list[str] = field(default_factory=list)
    bundles: list[dict[str, Any]] = field(default_factory=list)
    pricing_tiers: list[dict[str, Any]] = field(default_factory=list)
    hard_rules: list[str] = field(default_factory=list)
    raw: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ProductSpec:
        return cls(
            id=data["id"],
            name=data["name"],
            tagline=data.get("tagline", ""),
            architecture=data.get("architecture", "single-agent"),
            icp=data.get("icp", ""),
            wedge=data.get("wedge", ""),
            status=data.get("status", "concept"),
            path=data.get("path"),
            category=data.get("category"),
            pipeline=data.get("pipeline", []),
            skills=data.get("skills", []),
            deterministic_modules=data.get("deterministic_modules", []),
            bundles=data.get("bundles", []),
            pricing_tiers=data.get("pricing_tiers", []),
            hard_rules=data.get("hard_rules", []),
            raw=data,
        )


def load_schema() -> dict[str, Any]:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def load_product_spec(path: Path) -> ProductSpec:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"Invalid product spec: {path}")
    jsonschema.validate(instance=data, schema=load_schema())
    return ProductSpec.from_dict(data)


def load_registry() -> list[ProductSpec]:
    registry_path = PRODUCTS_DIR / "registry.yaml"
    registry = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
    products: list[ProductSpec] = []
    for entry in registry.get("products", []):
        spec_path = PRODUCTS_DIR / entry["spec"]
        products.append(load_product_spec(spec_path))
    return products
