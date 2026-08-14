"""SaaS factory tests."""

from __future__ import annotations

from pathlib import Path

import pytest

from saas_factory.scaffold import scaffold_product
from saas_factory.spec import load_product_spec, load_registry


def test_registry_loads():
    products = load_registry()
    assert len(products) >= 2
    ids = {p.id for p in products}
    assert "freeman-intel" in ids
    assert "ai-proposals-agent" in ids


def test_scaffold_creates_product_tree(tmp_path: Path):
    spec = load_product_spec(
        Path(__file__).resolve().parent.parent / "products" / "ai-proposals-agent.yaml"
    )
    product_dir = scaffold_product(spec, tmp_path, force=True)
    assert product_dir.is_dir()
    assert (product_dir / "README.md").exists()
    assert (product_dir / "agent" / "DUTIES.md").exists()
    assert (product_dir / "backend" / "ai_proposals_agent" / "cli.py").exists()
    readme = (product_dir / "README.md").read_text(encoding="utf-8")
    assert "Every number traces" in readme
