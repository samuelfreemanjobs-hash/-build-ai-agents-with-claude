# SaaS Factory

**AI agent-based SaaS factory** — a repeatable system for designing, scaffolding, and governing Claude-powered B2B SaaS products.

The factory encodes patterns proven in this monorepo:

| Product | Architecture | Status |
|---------|--------------|--------|
| [Freeman Intel](../freeman-intel/) | Multi-agent orchestration behind one approval UI | Design |
| [AI Proposals Agent™](../ai-proposals-agent/) | Single-agent + skills + deterministic core | Scaffold |

---

## What the factory provides

1. **Product specs** — YAML definitions validated against a JSON Schema (`products/`)
2. **Scaffold CLI** — generate a full agent SaaS tree from a spec (`saas_factory/scaffold.py`)
3. **Standard layout** — `agent/`, `skills/`, `schemas/`, `scripts/`, `backend/`, `deploy/`
4. **Shared principles** — human approval, binding facts from code not models, run logs, HALT on schema failure

---

## Quick start

```bash
cd saas-factory
pip install -e ".[dev]"

# List registered products
saas-factory list

# Show a product spec
saas-factory show ai-proposals-agent

# Validate all specs
saas-factory validate

# Scaffold a new product from an existing spec (dry run into /tmp)
saas-factory scaffold ai-proposals-agent -o /tmp --force

# Create a brand-new product spec + scaffold
saas-factory init "Invoice Chase Agent" \
  --tagline "Every chase traces." \
  --architecture single-agent \
  --icp "AR teams at mid-market manufacturers" \
  --wedge "Email-first overdue invoice follow-up" \
  --scaffold
```

---

## Factory lifecycle

```
Idea → init (spec) → scaffold (tree) → deterministic modules → skills → API → deploy
         │                │
         └─ validate ─────┘
```

See [`docs/architecture.md`](docs/architecture.md) for the full factory model.

---

## Directory layout

```
saas-factory/
├── products/           # Product specs + registry
├── schemas/            # JSON Schema for product specs
├── templates/agent-saas/  # Scaffold templates
├── saas_factory/       # Python package (CLI + scaffold engine)
├── docs/               # Factory architecture and patterns
└── tests/
```

---

## Design principles (all factory products)

1. **Outcome bundles, not agent marketplaces** — customers buy results, agents are internal roles
2. **Approve before impact** — human gate on customer-facing or high-risk actions
3. **Deterministic binding facts** — prices, compliance, matching logic live in `scripts/`, not the model
4. **Every run traces** — conformant run log per execution
5. **Fail closed** — schema violation and missing sources are HALT, not retry loops

---

## Adding a product to the registry

1. `saas-factory init "My Product" --scaffold`
2. Edit `products/<id>.yaml` — pipeline, skills, hard rules
3. Add entry to `products/registry.yaml`
4. `saas-factory validate`
