"""Scaffold new agent SaaS products from factory templates."""

from __future__ import annotations

import re
import shutil
from pathlib import Path
from string import Template

from saas_factory.spec import ProductSpec

FACTORY_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_ROOT = FACTORY_ROOT / "templates" / "agent-saas"


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def package_name(product_id: str) -> str:
    return product_id.replace("-", "_")


def render_template(content: str, context: dict[str, str]) -> str:
    return Template(content).safe_substitute(context)


def build_context(spec: ProductSpec, output_dir: Path) -> dict[str, str]:
    pkg = package_name(spec.id)
    return {
        "product_id": spec.id,
        "product_name": spec.name,
        "product_tagline": spec.tagline,
        "package_name": pkg,
        "architecture": spec.architecture,
        "icp": spec.icp,
        "wedge": spec.wedge,
        "status": spec.status,
        "output_dir": str(output_dir),
        "pipeline_stages": "\n".join(
            f"| {stage['id']} | {stage['name']} | {stage.get('mode', 'agent')} |"
            for stage in spec.pipeline
        ),
        "skills_list": "\n".join(f"- `{skill}`" for skill in spec.skills) or "- _(none yet)_",
        "hard_rules_list": "\n".join(
            f"R{i + 1}. {rule}" for i, rule in enumerate(spec.hard_rules)
        )
        or "R1. Human approval before any customer-facing action.",
        "deterministic_modules_list": "\n".join(
            f"- `{mod}`" for mod in spec.deterministic_modules
        )
        or "- _(add deterministic modules as binding facts emerge)_",
    }


def scaffold_product(
    spec: ProductSpec,
    output_root: Path,
    *,
    force: bool = False,
) -> Path:
    """Copy template tree and render .tpl files into a new product directory."""
    if not TEMPLATE_ROOT.is_dir():
        raise FileNotFoundError(f"Template root missing: {TEMPLATE_ROOT}")

    product_dir = output_root / spec.id
    if product_dir.exists() and not force:
        raise FileExistsError(
            f"Product directory already exists: {product_dir}. Use --force to overwrite."
        )
    if product_dir.exists():
        shutil.rmtree(product_dir)

    context = build_context(spec, product_dir)

    for src in TEMPLATE_ROOT.rglob("*"):
        rel = src.relative_to(TEMPLATE_ROOT)
        if src.is_dir():
            continue

        rel_str = str(rel)
        for key, value in context.items():
            rel_str = rel_str.replace(f"${{{key}}}", value)
            rel_str = rel_str.replace(f"${key}", value)

        if rel_str.endswith(".tpl"):
            dest_rel = Path(rel_str[:-4])
        else:
            dest_rel = Path(rel_str)

        dest = product_dir / dest_rel
        dest.parent.mkdir(parents=True, exist_ok=True)

        if src.suffix == ".tpl":
            rendered = render_template(src.read_text(encoding="utf-8"), context)
            dest.write_text(rendered, encoding="utf-8")
        else:
            shutil.copy2(src, dest)

    _write_skills(product_dir, spec)
    _write_schemas_stub(product_dir)
    return product_dir


def _write_skills(product_dir: Path, spec: ProductSpec) -> None:
    skills_dir = product_dir / "skills"
    for skill in spec.skills:
        skill_dir = skills_dir / skill
        skill_dir.mkdir(parents=True, exist_ok=True)
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            skill_file.write_text(
                f"# {skill.replace('-', ' ').title()}\n\n"
                f"Reactive skill for **{spec.name}**.\n\n"
                "## Trigger\n\n"
                "_(Define when this skill loads.)_\n\n"
                "## Inputs\n\n"
                "_(Schema references.)_\n\n"
                "## Outputs\n\n"
                "_(Schema references.)_\n",
                encoding="utf-8",
            )


def _write_schemas_stub(product_dir: Path) -> None:
    run_log = product_dir / "schemas" / "run-log.schema.json"
    if run_log.exists():
        return
    run_log.parent.mkdir(parents=True, exist_ok=True)
    run_log.write_text(
        """{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "run-log.schema.json",
  "title": "RunLog",
  "type": "object",
  "required": ["run_id", "product_id", "status", "started_at"],
  "properties": {
    "run_id": { "type": "string" },
    "product_id": { "type": "string" },
    "status": { "type": "string", "enum": ["running", "completed", "halted", "failed"] },
    "started_at": { "type": "string", "format": "date-time" },
    "completed_at": { "type": "string", "format": "date-time" },
    "stages": { "type": "array", "items": { "type": "object" } },
    "halts": { "type": "array", "items": { "type": "string" } }
  }
}
""",
        encoding="utf-8",
    )
