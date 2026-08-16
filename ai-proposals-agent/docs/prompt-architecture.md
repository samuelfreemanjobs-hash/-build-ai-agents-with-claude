# Prompt Architecture — Index

All prompts live under [`../prompts/`](../prompts/). v2.1 merges the original generative workflow with traceability constraints.

## Layering

```
Master System Prompt (always on)
    └── Phase sub-prompt (one active)
            └── Structured context (intake, KB, engine, compliance)
                    └── Output schema constraint
```

## Prompt catalog

| ID | File | Phase | Output |
|----|------|-------|--------|
| master-system | [`master-system.md`](../prompts/master-system.md) | all | — |
| orchestrator | [`orchestrator.md`](../prompts/orchestrator.md) | control | run phases |
| sp-rfp-analysis | [`sub/rfp-analysis.md`](../prompts/sub/rfp-analysis.md) | intake | rfp-intake.schema.json |
| sp-past-proposal-mining | [`sub/past-proposal-mining.md`](../prompts/sub/past-proposal-mining.md) | kb_ingest | kb entries |
| sp-executive-summary | [`sub/executive-summary.md`](../prompts/sub/executive-summary.md) | generation | markdown |
| sp-technical-capability | [`sub/technical-capability.md`](../prompts/sub/technical-capability.md) | generation | markdown |
| sp-case-study | [`sub/case-study-selector.md`](../prompts/sub/case-study-selector.md) | generation | markdown |
| sp-compliance-injector | [`sub/compliance-injector.md`](../prompts/sub/compliance-injector.md) | generation | compliance-report |
| sp-pricing-narrative | [`sub/pricing-narrative.md`](../prompts/sub/pricing-narrative.md) | pricing | markdown (no math) |
| sp-quality-assurance | [`sub/quality-assurance.md`](../prompts/sub/quality-assurance.md) | qa | qa_scores |

## Pricing: engine vs prompt

| v1 (original) | v2.1 (current) |
|---------------|----------------|
| "Pricing Optimizer Prompt" calculates scenarios | **Pricing Engine** calculates; SP-03 narrates only |
| LLM sets margin % | Margins in `pricing_models` table |
| JSON numbers for money | Decimal strings in schema |

## Anti-patterns

See [`complete-system-design.md`](complete-system-design.md#v1--v21-migration-notes).

## Versioning

Semver in YAML frontmatter. `package.sh` validates all `prompts/*.md` and `prompts/sub/*.md`.
