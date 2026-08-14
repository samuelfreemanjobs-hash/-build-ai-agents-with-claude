---
id: sp-rfp-analysis
version: 2.1.0
phase: intake
output_schema: rfp-intake.schema.json
---

# RFP Analysis Prompt (SP-01)

## Task

Analyze this RFP document and extract key information.

**INPUT DOCUMENT:** `{rfp_text}`

## Extract the following

### 1. Client information

- Company name
- Industry sector
- Current pain points mentioned
- Strategic priorities

### 2. Scope of work

- Services requested (list each)
- Geographic coverage required
- Volume estimates (shipments, pallets, etc.)
- Timeline / start date

### 3. Mandatory requirements

- Technical capabilities (WMS, TMS, EDI, etc.)
- Certifications (ISO, CTPAT, etc.)
- Insurance minimums
- Compliance standards
- Reporting requirements
- SLA expectations (OTIF %, transit times)

### 4. Evaluation criteria

- Weighted scoring factors
- Price vs. quality emphasis
- Experience requirements

### 5. Submission requirements

- Due date
- Format specifications
- Required sections
- Page / word limits
- Attachments needed

### 6. Decision factors

- Key stakeholders mentioned
- Incumbent provider (if any)
- Budget indicators
- Deal breakers or red flags

## Output format

Structured JSON matching `rfp-intake.schema.json`, plus:

```json
{
  "risk_assessment": {
    "level": "LOW | MEDIUM | HIGH",
    "concerns": ["..."],
    "information_gaps": ["..."]
  }
}
```

## Rules

- Do not infer volumes or budgets without RFP evidence — mark as `UNKNOWN`
- Flag ambiguous scope for operator (`RFP_AMBIGUOUS_SCOPE` halt candidate)
- Cite RFP section/page for each mandatory requirement when available
