# Knowledge Base — Schema & Population

## Entity relationship (conceptual)

```
past_proposals ──► case_studies (extracted)
       │
       └──► capability_library (extracted)

compliance_templates ◄── credentials (expiry tracked)
pricing_models ◄── cost rows (halt if missing)
client_intelligence ◄── CRM sync (phase 2)
```

---

## SQL schema

```sql
-- 1. Past proposals
CREATE TABLE past_proposals (
  proposal_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name       TEXT NOT NULL,
  industry          TEXT,
  services_provided TEXT[],
  value             NUMERIC(14,2),  -- stored decimal; export as string at API boundary
  won               BOOLEAN,
  proposal_date     DATE,
  full_text         TEXT,
  key_sections      JSONB,
  embedding         VECTOR(1536),  -- optional: semantic search
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 2. Case studies
CREATE TABLE case_studies (
  case_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name       TEXT,
  industry          TEXT NOT NULL,
  challenge_tags    TEXT[],
  solution_tags     TEXT[],
  metrics           JSONB NOT NULL,  -- { "otif": "98.2%", "source_ref": "..." }
  anonymized_version TEXT,
  relevance_score   REAL,
  source_proposal_id UUID REFERENCES past_proposals(proposal_id),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 3. Capability library
CREATE TABLE capability_library (
  capability_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_category  TEXT NOT NULL,
  capability_name   TEXT NOT NULL,
  description       TEXT,
  technical_specs   JSONB,
  differentiators   TEXT[],
  implementation_time TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 4. Compliance templates
CREATE TABLE compliance_templates (
  template_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_type   TEXT NOT NULL,  -- quality, safety, sustainability, insurance
  certification_name TEXT NOT NULL,
  standard_language TEXT NOT NULL,
  certificate_number TEXT,
  expiration_date   DATE,
  source_ref        TEXT NOT NULL,  -- required for COMPLIANT status
  audit_schedule    TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 5. Pricing models
CREATE TABLE pricing_models (
  model_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type      TEXT NOT NULL,
  corridor          TEXT,             -- e.g. DET-WARREN
  unit              TEXT NOT NULL,    -- per_move, annual, per_pallet
  unit_cost         NUMERIC(14,4) NOT NULL,
  market_rate_min   NUMERIC(14,4),
  market_rate_max   NUMERIC(14,4),
  margin_competitive NUMERIC(5,2),
  margin_balanced   NUMERIC(5,2),
  margin_premium    NUMERIC(5,2),
  volume_tiers      JSONB,
  cost_row_ref      TEXT UNIQUE NOT NULL,  -- referenced by pricing engine
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 6. Client intelligence
CREATE TABLE client_intelligence (
  company_name      TEXT PRIMARY KEY,
  industry          TEXT,
  decision_makers   JSONB,
  past_interactions JSONB,
  preferences       JSONB,
  pain_points       TEXT[],
  competitor_relationships JSONB,
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_case_studies_industry ON case_studies(industry);
CREATE INDEX idx_case_studies_tags ON case_studies USING GIN(challenge_tags);
CREATE INDEX idx_pricing_service ON pricing_models(service_type, corridor);
CREATE INDEX idx_compliance_expiry ON compliance_templates(expiration_date);
```

---

## JSONB examples

### case_studies.metrics

```json
{
  "otif_pct": { "value": "98.2", "unit": "percent", "source_ref": "case_studies.ford_inbound_2024" },
  "cost_savings": { "value": "240000", "unit": "USD", "source_ref": "case_studies.ford_inbound_2024" }
}
```

### pricing_models.volume_tiers

```json
[
  { "min": 0, "max": 500, "multiplier": "1.00" },
  { "min": 501, "max": 1200, "multiplier": "0.95" },
  { "min": 1201, "max": null, "multiplier": "0.90" }
]
```

---

## Initial population

| Asset | Minimum | Target |
|-------|---------|--------|
| Past proposals | 20 | 50 |
| Case studies | 30 | 50 |
| Capability entries | 15 | 40 |
| Compliance templates | All active certs | + boilerplate |
| Pricing cost rows | All service lines you bid | Per corridor |

### Ingest workflow

1. Upload past proposal PDF → **Past Proposal Mining** (SP-KB)
2. Operator reviews extracted entries
3. Promote to KB tables with `source_ref`
4. Run compliance expiry scan

---

## KB coverage view (planned UI)

Before starting a bid, show:

| Service line | Cost row | Compliance templates | Case studies |
|--------------|----------|---------------------|--------------|
| Dedicated shuttle | ✓ | ✓ | 3 |
| ASN compliance desk | **MISSING** | GAP | 0 |

Rows with **MISSING** predict `MISSING_COST_ROW` halts.

---

## Maintenance schedule

| Frequency | Action |
|-----------|--------|
| Per proposal | Upload win/loss to `past_proposals` |
| Monthly | Refresh `pricing_models` unit costs |
| Quarterly | Review case study relevance scores |
| Annually | Audit cert expiry in `compliance_templates` |
