# Golden Test Fixtures

**Status:** Manifest only — fixtures not yet populated (see **G7** in README).

## Structure

Each golden case lives in `tests/golden/<case_id>/`:

```
tests/golden/G16/
├── input.json              # RFP text, KB snapshot refs, tier override
├── expected_invariants.json # Assertions on outputs (not exact prose)
└── kb_snapshot_hash.txt    # SHA256 of frozen KB used for case
```

## Running

```bash
# Component self-tests (always run)
python3 scripts/run_golden_tests.py

# Full golden suite (when fixtures exist)
python3 scripts/run_golden_tests.py --execute-golden
```

## Case manifest

23 cases defined in `scripts/run_golden_tests.py`:

| Range | Stage | Cases |
|---|---|---|
| G01–G05 | S0 Extraction | mandatory/desirable, weights, page limit, HALTs |
| G06–G11 | S1 Compliance | fail-closed cert states, gap surfacing |
| G12–G15 | S2 Case studies | release flags, metric transcription, determinism |
| G16–G19 | S3 Pricing | HALTs, verbatim figures, refuse adjustment |
| G20–G22 | S4/S5 Assembly + QA | page limits, evaluator cap, no pricing regen |
| G23 | S6 Emit | header completeness, human review line |

## Invariant assertion style

Model-dependent cases assert **invariants**, never exact prose:

```json
{
  "must_contain_header_fields": ["RUN ID", "HUMAN REVIEW"],
  "must_not_contain": ["Global Pharma"],
  "pricing_figures_subset_of_engine": true,
  "compliance_status_from_validator_only": true,
  "untraceable_count": 0
}
```

## Populating fixtures

Fixtures require a configured operator KB. Populate reactively after the
first DFY customer engagement — see recommended build order in
`docs/deployment-guide.md`.
