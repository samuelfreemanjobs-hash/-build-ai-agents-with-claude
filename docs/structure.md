# Monorepo structure

This repository is organized around two layers: the **factory** (how products are defined and scaffolded) and **agents** (live product implementations).

## Top level

| Path | Purpose |
|------|---------|
| [`saas-factory/`](../saas-factory/) | Product specs (YAML), JSON Schema, scaffold CLI, templates |
| [`agents/b2b/`](../agents/b2b/) | Customer-facing B2B agent SaaS products |
| [`agents/engineering/`](../agents/engineering/) | Internal software delivery agent suite |
| [`scripts/`](../scripts/) | Monorepo-wide scripts (`verify-all.sh`) |
| [`.github/workflows/`](../.github/workflows/) | CI — runs full verification on push/PR |

## Agent categories

### `agents/b2b/` — Customer-facing SaaS

Products sold to external customers. Typically include frontend, deploy configs, GTM docs, and human approval flows for customer-facing actions.

| Agent | Status | Focus |
|-------|--------|-------|
| Freeman Intel | Design | Plant inbound logistics, multi-agent |
| AI Proposals Agent™ | Scaffold | Logistics RFP proposals, single-agent |

### `agents/engineering/` — Software delivery suite

Agents that support building, designing, governing, managing, and testing software. Used internally or as a bundled “engineering copilot” offering.

| Agent | Focus |
|-------|-------|
| Software Developer Agent™ | Spec → code → verification |
| Principal Software Engineer Agent™ | Architecture decisions, ADRs, trade-offs |
| Software Architect Agent™ | C4 modeling, NFR governance |
| Engineering Manager Agent™ | Capacity, sprint planning, comms drafts |
| QA Engineer Agent™ | Test strategy, coverage, release readiness |

## Standard agent layout

Every scaffolded agent follows the same internal structure (from `saas-factory/templates/agent-saas/`):

```
agents/{category}/{product-id}/
├── agent/           # SOUL.md, DUTIES.md, system-prompt.md, core-config.xml
├── skills/          # Reactive pipeline skills (SKILL.md per stage)
├── schemas/         # JSON Schema for stage outputs and run logs
├── scripts/         # Deterministic modules (binding facts — not the model)
├── backend/         # FastAPI orchestrator, CLI, pytest
├── docs/            # Product-specific design docs and known gaps
├── README.md
└── SETUP.md
```

B2B products may additionally include `frontend/`, `deploy/`, `kb/`, and marketing docs.

## Factory ↔ agent relationship

1. **Spec** lives in `saas-factory/products/{id}.yaml` with `category` and `path`.
2. **Registry** in `saas-factory/products/registry.yaml` lists all products.
3. **Scaffold** creates or refreshes the tree: `saas-factory scaffold {id} -o .`
4. **Verify** runs golden tests + pytest: `bash scripts/verify-all.sh`

The `path` field in each spec is the canonical location — always under `agents/{category}/{id}/`.

## Adding a new product

```bash
cd saas-factory && pip install -e ".[dev]"

# B2B customer product
saas-factory init "Invoice Chase Agent" \
  --category b2b \
  --tagline "Every chase traces." \
  --scaffold

# Engineering delivery agent
saas-factory init "DevOps Agent" \
  --category engineering \
  --tagline "Every deploy traces." \
  --scaffold
```

Then edit the generated spec, implement deterministic scripts, and register is automatic via `init`.

## What does not live in `agents/`

- **Factory code and specs** → `saas-factory/` only
- **Monorepo CI and scripts** → `scripts/`, `.github/`
- **Cross-cutting docs** → `docs/` (this file)

Prompt libraries, scrapers, and unrelated experiments on other branches should not be merged into `agents/` — keep this directory for governed agent products only.
