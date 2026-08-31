---
name: adr-authoring
description: Writes Architecture Decision Records for significant design choices. Use at S5 after evaluation completes.
---

# ADR Authoring

## Hard rules

1. One ADR per significant decision (technology choice, pattern adoption, boundary change).
2. Format: Context, Decision, Consequences, Alternatives Considered.
3. Reference evaluation scores and risk register.
4. Status: proposed | accepted | deprecated | superseded.
5. Maximum `{config.max_adr_entries}` ADRs per run.

## ADR template

```markdown
# ADR-{n}: {title}

## Status
Proposed

## Context
{Why this decision is needed — link to problem brief}

## Decision
{What we decided and why, referencing evaluation scores}

## Consequences
### Positive
- ...

### Negative
- ...

## Alternatives Considered
- **{Option B}:** Rejected because {reason with score reference}
```

## Output

ADR entries conforming to `schemas/adr.schema.json`.
