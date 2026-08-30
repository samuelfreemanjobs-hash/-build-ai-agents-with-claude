# Marketing AI Agents

This directory holds **agentic AI marketing agents** — built by The Architect or scaffolded from `_template/`.

## The Architect (apex)

[`the-architect/`](the-architect/) — Galactic v3 omni-strategic agent. Reference implementation.

## Build a new agent

```bash
# List archetypes
the-architect build-agent archetypes

# Scaffold file tree (instant, no API)
the-architect build-agent scaffold "Email Sequencer" \
  --archetype email_sequencer \
  --metric "welcome sequence completion rate"

# Full agentic build (API required)
the-architect build-agent run "Funnel Architect" \
  --archetype funnel_architect \
  --brief "B2B SaaS trial-to-paid. Maps funnels + email lifecycle." \
  --metric "trial conversion rate"
```

See [`the-architect/AGENT-BUILDER-METHODOLOGY.md`](the-architect/AGENT-BUILDER-METHODOLOGY.md).

## Template

[`_template/`](_template/) — starter SYSTEM.md, AGENT.md, INVOCATION.md for new agents.

## Structure per agent

```
agents/<slug>/
├── README.md
├── SYSTEM.md          # Voice + craft
├── AGENT.md           # Workflow + tools
├── INVOCATION.md      # Operator brief
├── methodology/       # Slices + links to Architect stack
└── projects/          # Job artifacts
```

Each agent should have **one voice**, a **workflow state machine**, **tools**, and a **ship gate** (rubric ≥ 8.0).
