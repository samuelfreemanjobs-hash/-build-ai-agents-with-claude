"""CLI for the AI agent SaaS factory."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml

from saas_factory.scaffold import FACTORY_ROOT, scaffold_product, slugify
from saas_factory.spec import PRODUCTS_DIR, load_product_spec, load_registry


def cmd_list(_: argparse.Namespace) -> int:
    products = load_registry()
    if not products:
        print("No products registered.")
        return 0
    print(f"{'ID':<24} {'STATUS':<12} {'ARCHITECTURE':<18} NAME")
    print("-" * 72)
    for p in products:
        print(f"{p.id:<24} {p.status:<12} {p.architecture:<18} {p.name}")
    return 0


def cmd_show(args: argparse.Namespace) -> int:
    spec_path = PRODUCTS_DIR / f"{args.product_id}.yaml"
    if not spec_path.exists():
        print(f"Product not found: {args.product_id}", file=sys.stderr)
        return 1
    spec = load_product_spec(spec_path)
    if args.json:
        print(json.dumps(spec.raw, indent=2))
    else:
        print(f"# {spec.name}")
        print(f"Tagline: {spec.tagline}")
        print(f"Architecture: {spec.architecture}")
        print(f"Status: {spec.status}")
        print(f"ICP: {spec.icp}")
        print(f"Wedge: {spec.wedge}")
        if spec.path:
            print(f"Path: {spec.path}")
        if spec.pipeline:
            print("\n## Pipeline")
            for stage in spec.pipeline:
                print(f"  - {stage['id']}: {stage['name']}")
    return 0


def cmd_scaffold(args: argparse.Namespace) -> int:
    spec_path = Path(args.spec)
    if not spec_path.is_absolute():
        candidate = PRODUCTS_DIR / spec_path
        if candidate.exists():
            spec_path = candidate
        elif (PRODUCTS_DIR / f"{spec_path}.yaml").exists():
            spec_path = PRODUCTS_DIR / f"{spec_path}.yaml"

    if not spec_path.exists():
        print(f"Spec not found: {args.spec}", file=sys.stderr)
        return 1

    spec = load_product_spec(spec_path)
    output_root = Path(args.output)
    product_dir = scaffold_product(spec, output_root, force=args.force)
    print(f"Scaffolded {spec.name} → {product_dir}")
    return 0


def cmd_init(args: argparse.Namespace) -> int:
    product_id = slugify(args.name)
    spec_path = PRODUCTS_DIR / f"{product_id}.yaml"
    if spec_path.exists() and not args.force:
        print(f"Spec already exists: {spec_path}", file=sys.stderr)
        return 1

    spec_data = {
        "id": product_id,
        "name": args.name,
        "tagline": args.tagline or "Every action traces.",
        "architecture": args.architecture,
        "icp": args.icp or "Define your ideal customer profile.",
        "wedge": args.wedge or "Define your wedge.",
        "status": "concept",
        "pipeline": [
            {"id": "S0", "name": "Intake", "mode": "agent"},
            {"id": "S1", "name": "Validate", "mode": "deterministic"},
            {"id": "S2", "name": "Draft", "mode": "agent"},
            {"id": "S3", "name": "Approve", "mode": "human"},
            {"id": "S4", "name": "Export", "mode": "deterministic"},
        ],
        "skills": [],
        "deterministic_modules": [],
        "hard_rules": [
            "Human approval before any customer-facing action.",
            "Binding facts come from deterministic modules or verified records — never from the model.",
            "Every run writes a conformant run log entry.",
            "Schema violation is HALT.",
        ],
        "bundles": [],
        "pricing_tiers": [],
    }
    spec_path.write_text(yaml.dump(spec_data, sort_keys=False), encoding="utf-8")
    print(f"Created product spec: {spec_path}")
    if args.scaffold:
        spec = load_product_spec(spec_path)
        product_dir = scaffold_product(spec, Path(args.output), force=True)
        print(f"Scaffolded → {product_dir}")
    return 0


def cmd_validate(_: argparse.Namespace) -> int:
    products = load_registry()
    errors = 0
    for p in products:
        try:
            load_product_spec(PRODUCTS_DIR / f"{p.id}.yaml")
            print(f"✓ {p.id}")
        except Exception as exc:
            print(f"✗ {p.id}: {exc}")
            errors += 1
    return 1 if errors else 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="saas-factory",
        description="AI agent-based SaaS factory — scaffold and govern agent products",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="List registered products").set_defaults(func=cmd_list)

    show = sub.add_parser("show", help="Show a product spec")
    show.add_argument("product_id")
    show.add_argument("--json", action="store_true")
    show.set_defaults(func=cmd_show)

    scaffold = sub.add_parser("scaffold", help="Scaffold a product from a spec")
    scaffold.add_argument("spec", help="Product spec file or product id")
    scaffold.add_argument(
        "-o",
        "--output",
        default=str(FACTORY_ROOT.parent),
        help="Output root directory (default: monorepo root)",
    )
    scaffold.add_argument("--force", action="store_true")
    scaffold.set_defaults(func=cmd_scaffold)

    init = sub.add_parser("init", help="Create a new product spec")
    init.add_argument("name", help="Product display name")
    init.add_argument("--tagline", default="")
    init.add_argument(
        "--architecture",
        choices=["single-agent", "multi-agent", "hybrid"],
        default="single-agent",
    )
    init.add_argument("--icp", default="")
    init.add_argument("--wedge", default="")
    init.add_argument("--scaffold", action="store_true", help="Also scaffold the product tree")
    init.add_argument("-o", "--output", default=str(FACTORY_ROOT.parent))
    init.add_argument("--force", action="store_true")
    init.set_defaults(func=cmd_init)

    sub.add_parser("validate", help="Validate all registered product specs").set_defaults(
        func=cmd_validate
    )

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
