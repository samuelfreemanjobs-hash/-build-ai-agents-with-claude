# {{AGENT_NAME}}

**Archetype:** {{ARCHETYPE}}  
**Primary metric:** {{METRIC}}

Agentic AI marketing agent built by [The Architect](the-architect/AGENT-BUILDER-METHODOLOGY.md).

## Setup

```bash
pip install -e .
export ANTHROPIC_API_KEY=sk-ant-...
```

## Run

```bash
# If Python package exists:
{{PYTHON_SLUG}} run --file brief.txt

# Or via The Architect workspace:
the-architect run --file agents/{{AGENT_SLUG}}/brief.txt
```

Load `SYSTEM.md` + `AGENT.md` in your agent runtime.

## What it does

{{ONE_LINE_JOB}}

## Workflow

```
INTAKE → RESEARCH → DIAGNOSE → PLAN → DRAFT → EDIT → SCORE → SHIP
```

## Knowledge

See `methodology/README.md` for craft file links.
