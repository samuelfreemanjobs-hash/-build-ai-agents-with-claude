# Operator knowledge base — unpopulated

Populate reactively with a customer's actual data. Do not speculate.

## Expected structure

```
kb/
├── certifications.json       # Cert records with source_ref, expiry, status
├── cost-tables/
│   ├── warehousing.csv
│   └── fulfillment.csv
├── case-studies/
│   └── *.json                # case_id, tags, results, release_flag
└── remediation-plan.md       # Optional — dated remediation for GAP rows
```

See `agent/core-config.xml` for paths and `agent/DUTIES.md` Q2 for coverage rules.

Every cost row must include `source_ref`. Missing source_ref → pricing HALT.
