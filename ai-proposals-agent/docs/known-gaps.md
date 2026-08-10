# Known gaps & build order

Quick reference — see [`deployment-guide.md`](deployment-guide.md) for full detail.

## Fixed in v2.1 ✅

- **LLM pricing arithmetic** → `PricingEngine` (Decimal, string JSON, halts)
- **Traceability** → run-log schema, operator console
- **Compliance gaps loud** → `ComplianceChecker`, not silent omission
- **NON_OVERRIDABLE halts** → `halts.py` frozenset (G07)

## Still open ❌

1. **G1** — PDF/DOCX RFP parsing (Textract / unstructured.io)
2. **G2** — Branded DOCX/PDF export (python-docx)
3. **Auth** — JWT / API keys / tenant isolation
4. **Job queue** — Redis; in-memory jobs today
5. **KB persistence** — Postgres schema ready, app not wired
6. **Structured LLM output** — tool-use instead of `json.loads`
7. **Analytics UI** — API stub only

## Recommended sequence

```
Week 1:  DFY sale + manual delivery (Claude + Word)
Week 2–3: G1 + G2 (whatever blocked Week 1)
Week 4–8: KB ingest + DOCX template
Month 3+: Auth, Redis, Postgres, SaaS scale (after ~10 DFY clients)
```

## Do not ship without

- [ ] DOCX export for customer delivery
- [ ] PDF ingest OR manual paste workflow documented
- [ ] Auth before public multi-tenant deploy
- [ ] DPA/TOS for NDA RFP content
