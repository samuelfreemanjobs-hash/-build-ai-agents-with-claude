# $product_name

$product_tagline

**Status:** $status  
**Architecture:** $architecture  
**ICP:** $icp  
**Wedge:** $wedge

Scaffolded by the [SaaS Factory]($factory_relative_path/).

---

## Core safety property

The model has **no generative authority over binding facts.**

| Binding fact | Source |
|---|---|
| _(define per product)_ | `scripts/` deterministic modules |
| Narrative, structure | Model (Claude) |

---

## Pipeline

| Stage | Name | Mode |
|---|---|---|
$pipeline_stages

---

## Skills

$skills_list

---

## Deterministic modules

$deterministic_modules_list

---

## Hard rules

$hard_rules_list

---

## Quick start

```bash
cd backend && pip install -e ".[dev]" && pytest
python scripts/run_golden_tests.py   # add golden tests as modules land
```
