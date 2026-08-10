# Known gaps & build order

Quick reference — see [`deployment-guide.md`](deployment-guide.md) and
[`../README.md`](../README.md) for full detail.

## Fixed in v2.1 ✅

- **LLM pricing arithmetic** → `scripts/pricing_engine.py` + `backend/` PricingEngine
- **Traceability** → run-log schema, observability contract, operator console
- **Compliance gaps loud** → `compliance_validator.py`, not silent omission
- **NON_OVERRIDABLE halts** → deterministic gates in scripts + `halts.py`
- **Architecture rationale** → ADR-001, token economics gate, escalation triggers

## Still open ❌

| ID | Gap |
|---|---|
| G1 | PDF/DOCX RFP parsing (Textract / unstructured.io) |
| G2 | Branded DOCX/PDF export (python-docx) |
| G3 | KB unpopulated — requires customer ingest |
| G4 | Auth — JWT / API keys / tenant isolation |
| G5 | Job queue — Redis; in-memory jobs in API today |
| G6 | Structured LLM output — tool-use instead of `json.loads` |
| G7 | Golden fixtures manifested in `run_golden_tests.py`, not populated |
| G8 | NDA retention TTLs in config, not enforced |

## Recommended sequence

```
Week 1:  DFY sale + manual delivery (Claude + Word)
Week 2–3: G1 + G2 (whatever blocked Week 1)
Week 4–8: KB ingest + DOCX template
Month 3+: Auth, Redis, Postgres, SaaS scale (after ~10 DFY clients)
```

## Do not ship without

- [ ] DOCX export for customer delivery (G2)
- [ ] PDF ingest OR manual paste workflow documented (G1)
- [ ] Auth before public multi-tenant deploy (G4)
- [ ] DPA/TOS for NDA RFP content (G8)
- [ ] `python3 scripts/run_golden_tests.py` GREEN

## Verify before deploy

```bash
python3 scripts/run_golden_tests.py
python3 scripts/token_economics.py
cd backend && python3 -m pytest tests/ -v
```
