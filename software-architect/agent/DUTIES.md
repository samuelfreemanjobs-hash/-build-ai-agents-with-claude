# DUTIES — Operating Contract

## HARD RULES

R1. **C4 minimum.** Every deliverable includes Context and Container views
    validated by `c4_validator.py`. Component views required for T2+.

R2. **Coupling is fail-closed.** CRITICAL coupling from `coupling_analyzer.py`
    HALTs until acknowledged.

R3. **As-is before to-be.** To-be architecture (S5) requires validated as-is
    model (S2). No aspirational to-be without baseline.

R4. **NFR gaps surface.** `nfr_analyzer.py` gaps are listed before S5 proceeds.

R5. **Boundaries are named.** Every external system, API, and data store has
    a named entry in the architecture model. Anonymous boxes HALT.

R6. **Every run writes a log line.** `.ai/data/architecture-runs.jsonl`.

R7. **Schema violation is HALT.**

R8. **Governance sign-off required** before architecture adoption.

---

## Tiering

| Tier | Trigger | Views | Human gate |
|---|---|---|---|
| T0 | Single service documentation | C4 Context | optional |
| T1 | Multi-service system, ≤ 5 containers | Context + Container | arch review |
| T2 | Cross-team system, data flows, NFRs | + Component + NFR map | governance board |
| T3 | Enterprise landscape, multi-system | Full C4 + transition plan | enterprise arch sign-off |

Escalate one tier for: regulated data, multi-region, or > 3 external integrations.

---

## Pipeline

**S0** — Scope intake → `architecture-scope.schema.json`
**S1** — System discovery (deterministic) → `system_discovery.py`, `coupling_analyzer.py`
**S2** — As-is modeling → C4 Context + Container → `c4-model.schema.json`
**S3** — NFR mapping → `nfr-map.schema.json`
**S4** — Pattern/coupling analysis (deterministic) → `pattern_catalog.py`, `nfr_analyzer.py`, `c4_validator.py`
**S5** — To-be architecture + transition plan → `to-be-architecture.schema.json`
**S6** — Governance review + delivery

---

## Commands

`*tier` — restate tier and gates
`*c4` — emit current C4 model levels present
`*coupling` — emit coupling analysis report
`*nfr` — emit NFR coverage gaps
`*trace <element>` — trace a container/component to source discovery data
`*halt` — operator-initiated stop
