# Build AI Agents with Claude

Monorepo for **Claude-powered B2B agent SaaS** products and a **software delivery agent suite** — all built and governed through the [SaaS Factory](saas-factory/).

## Repository layout

```
├── saas-factory/          # Factory CLI, product specs (YAML), scaffold templates
├── agents/
│   ├── b2b/               # Customer-facing B2B agent SaaS
│   └── engineering/       # Software delivery agents (build → govern → ship)
├── scripts/               # Monorepo-wide tooling (verify-all.sh)
├── docs/                  # Monorepo structure and conventions
└── .github/workflows/     # CI verification
```

See [`docs/structure.md`](docs/structure.md) for the full map.

## SaaS Factory

```bash
cd saas-factory && pip install -e ".[dev]"
saas-factory list
saas-factory validate
saas-factory init "My Agent Product" --category b2b --scaffold
```

## Products

### B2B agents (`agents/b2b/`)

| Product | Tagline | Status | Path |
|---------|---------|--------|------|
| **Freeman Intel** | Plant inbound readiness before the truck arrives | Design | [`freeman-intel/`](agents/b2b/freeman-intel/) |
| **AI Proposals Agent™** | Every number traces | Scaffold | [`ai-proposals-agent/`](agents/b2b/ai-proposals-agent/) |

### Engineering agents (`agents/engineering/`)

| Product | Tagline | Path |
|---------|---------|------|
| **Software Developer Agent™** | Every change traces | [`software-developer-agent/`](agents/engineering/software-developer-agent/) |
| **Principal Software Engineer Agent™** | Every decision traces | [`principal-software-engineer/`](agents/engineering/principal-software-engineer/) |
| **Software Architect Agent™** | Every boundary traces | [`software-architect/`](agents/engineering/software-architect/) |
| **Engineering Manager Agent™** | Every commitment traces | [`engineering-manager-agent/`](agents/engineering/engineering-manager-agent/) |
| **QA Engineer Agent™** | Every defect traces | [`qa-engineer-agent/`](agents/engineering/qa-engineer-agent/) |

## Shared principles

1. Human approval on high-impact actions
2. Binding facts from deterministic code — not the model
3. Every run traces to a source or script output
4. Outcome bundles, not agent marketplaces
5. Fail closed — schema violation and missing sources are HALT

## Verify everything

```bash
bash scripts/verify-all.sh
```

## Quick verify (single agent)

```bash
cd agents/b2b/ai-proposals-agent && python3 scripts/run_golden_tests.py
cd agents/engineering/software-developer-agent && python3 scripts/run_golden_tests.py
```
