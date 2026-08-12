# Build AI Agents with Claude

Monorepo for **Claude-powered B2B agent SaaS** products targeting the Metro Detroit logistics corridor.

## SaaS Factory

This repo includes an [**AI agent-based SaaS factory**](saas-factory/) — a repeatable system for defining, scaffolding, and governing agent SaaS products:

```bash
cd saas-factory && pip install -e ".[dev]"
saas-factory list
saas-factory init "My Agent Product" --scaffold
```

See [`saas-factory/README.md`](saas-factory/README.md) for the full factory docs.

## Products

| Product | Tagline | Path |
|---------|---------|------|
| **Freeman Intel** | Plant inbound readiness before the truck arrives | [`freeman-intel/`](freeman-intel/) |
| **AI Proposals Agent™** | Every number traces | [`ai-proposals-agent/`](ai-proposals-agent/) |

## Shared principles

1. Human approval on high-impact actions
2. Binding facts from deterministic code — not the model
3. Email / document-first — no TMS API required to start
4. Outcome bundles, not agent marketplaces
5. Every run traces to a source or script output

## Quick verify (AI Proposals Agent)

```bash
cd ai-proposals-agent
python3 scripts/run_golden_tests.py
```

## Structure

```
├── saas-factory/        # Product specs, scaffold CLI, templates
├── freeman-intel/       # Plant inbound logistics (design)
├── ai-proposals-agent/  # RFP proposal agent (scaffold + deterministic core)
└── README.md
```
