---
name: architecture-design
description: Produces multiple architecture options with component diagrams, data flows, and trade-offs. Use at S3. Minimum 2 options required.
---

# Architecture Design

## Hard rules

1. Minimum 2 options, maximum `{config.max_options_per_design}`.
2. Each option has: name, summary, components, data flow, trade-offs, complexity.
3. Every option maps to requirement and constraint IDs.
4. Include a "do nothing" or "minimal change" option when applicable.
5. Diagrams use mermaid or structured text — not prose-only descriptions.

## Option structure

```json
{
  "option_id": "OPT-A",
  "name": "Event-driven with message queue",
  "summary": "Decouple services via async events",
  "components": [...],
  "data_flow": "Producer → Queue → Consumer → DB",
  "trade_offs": {
    "pros": ["Loose coupling", "Natural backpressure"],
    "cons": ["Eventual consistency", "Operational complexity"]
  },
  "complexity": "medium",
  "maps_to": {"requirements": ["SC-1"], "constraints": ["C-3"]}
}
```

## Anti-patterns

- Single option presented as "the architecture"
- Options that are identical except for technology choice without trade-off analysis
- Missing the minimal-change baseline option

## Output

Conform to `schemas/architecture-options.schema.json`.
