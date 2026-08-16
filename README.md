# Build AI Agents with Claude

Monorepo for **Claude-powered B2B agent SaaS** products and software delivery agents.

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
| **Software Developer Agent™** | Every change traces | [`software-developer-agent/`](software-developer-agent/) |
| **Principal Software Engineer Agent™** | Every decision traces | [`principal-software-engineer/`](principal-software-engineer/) |
| **Software Architect Agent™** | Every boundary traces | [`software-architect/`](software-architect/) |
| **Engineering Manager Agent™** | Every commitment traces | [`engineering-manager-agent/`](engineering-manager-agent/) |
| **QA Engineer Agent™** | Every defect traces | [`qa-engineer-agent/`](qa-engineer-agent/) |
| **Freeman Intelligence** | Revenue Systems Engineering | [`freeman-intelligence/`](freeman-intelligence/) |

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

## Quick verify (per agent)

```bash
# AI Proposals Agent
cd ai-proposals-agent && python3 scripts/run_golden_tests.py

# Software Developer Agent
cd software-developer-agent && python3 scripts/run_golden_tests.py

# Principal Software Engineer Agent
cd principal-software-engineer && python3 scripts/run_golden_tests.py

# Software Architect Agent
cd software-architect && python3 scripts/run_golden_tests.py

# Engineering Manager Agent
cd engineering-manager-agent && python3 scripts/run_golden_tests.py

# QA Engineer Agent
cd qa-engineer-agent && python3 scripts/run_golden_tests.py
```

## Structure

```
├── saas-factory/              # Product specs, scaffold CLI, templates
├── freeman-intel/             # Plant inbound logistics (design)
├── ai-proposals-agent/        # RFP proposal agent
├── software-developer-agent/  # Implementation agent
├── principal-software-engineer/ # Architecture decisions agent
├── software-architect/          # C4 modeling and governance agent
├── engineering-manager-agent/   # Team leadership and delivery planning
├── qa-engineer-agent/           # Release validation and test strategy
├── freeman-intelligence/        # WRIS + Revenue Opportunity Diagnostic
└── README.md
```
