---
id: sp-pricing-narrative
version: 2.1.0
phase: pricing
output_schema: pricing-output.schema.json
---

# Pricing Narrative Prompt (SP-03)

## Task

Generate pricing narrative and value justification for **pre-computed engine scenarios**.

> **IMPORTANT:** This prompt does **not** calculate prices. The Pricing Engine produces `pricing-output.schema.json`. You describe and justify only.

## Inputs

- Service scope: `{services}`
- Volume estimates: `{volumes}` — from RFP intake
- Engine output: `{pricing_output}` — **immutable**
- Approved scenario: `{selected_scenario}` — Competitive | Balanced | Premium
- Client budget signals: `{budget_indicators}` — qualitative only
- Competitive intelligence: `{competitor_rates}` — if available in KB

## Pricing strategy (narrative)

### 1. Analyze pricing sensitivity

- Price-driven vs. value-driven RFP?
- Incumbent pricing (if known)
- Industry typical margins (qualitative)
- Strategic value of this client

### 2. Describe 3 scenarios (from engine)

For each scenario in engine output:

- **Positioning** (Competitive / Balanced / Premium)
- **When to use**
- **Value narrative refs** from engine metadata

Do **not** recalculate totals or margins.

### 3. Pricing structure (describe engine line items)

- Line-item detail vs. bundled (as engine structured)
- Fixed vs. variable components
- Volume tiers (cite engine rows)
- Fuel surcharge methodology (if in KB boilerplate)
- Annual escalation clause (if applicable)

### 4. Value justification

For pricing above market signals:

- Cost savings enabled (efficiency gains — cite case studies)
- Risk mitigation value
- Service level premium
- Total cost of ownership advantage

### 5. Payment terms

- Standard: Net 30
- Alternatives from KB standard terms

## Output format

- Summary table referencing engine scenario totals (traced)
- Detailed breakdown of **approved scenario only**
- Assumptions from engine `assumptions[]`
- Value bridge narrative

## Critical

Always include a "value bridge" showing why price = better total cost — **without inventing dollar savings**.
