---
name: system-context
description: Interprets deterministic system analysis to map services, dependencies, data flows, and hotspots. Use at S1 after system_analyzer.py and dependency_mapper.py run.
---

# System Context

## Hard rules

1. Report only what scripts returned. Do not invent services or dependencies.
2. Identify coupling points and single points of failure.
3. Flag data stores and their consistency models.
4. Note observability gaps (missing metrics, logging, tracing).

## Analysis focus

- **Service map:** components, boundaries, communication patterns
- **Dependency chains:** direct and transitive, with direction
- **Data flows:** read/write paths, consistency requirements
- **Hotspots:** high-traffic endpoints, large tables, known bottlenecks
- **Operational state:** deployment model, CI/CD, monitoring coverage

## Output

Structured context referencing analyzer fields. Flag gaps requiring operator input.
