---
id: sp-compliance-injector
version: 2.1.0
phase: generation
output_schema: compliance-report.schema.json
---

# Compliance Language Injector (SP-04)

## Task

Insert required compliance and standards language.

## Inputs

- Required certifications: `{certifications}`
- Mandatory standards: `{standards}`
- Safety requirements: `{safety_reqs}`
- Sustainability requirements: `{sustainability_reqs}`
- Our current certifications: `{our_certifications}` — **from KB validator output only**

## Compliance categories

### 1. Quality & safety

- ISO 9001:2015 (Quality Management)
- CTPAT (Customs-Trade Partnership)
- TSA/IAC security certifications
- OSHA compliance
- Safety programs (driver training, etc.)

### 2. On-time performance

- OTIF commitment
- Service level guarantees
- Performance measurement methodology
- Escalation procedures

### 3. Sustainability

- EPA SmartWay certification
- Carbon footprint reporting
- Fuel efficiency programs
- Green warehouse practices

### 4. Technology & security

- Data security (SOC 2, ISO 27001)
- EDI/API capabilities
- System uptime guarantees

### 5. Insurance & liability

- Cargo insurance levels
- Liability coverage
- Workers compensation
- Auto liability

## For each applicable area

- State compliance status from validator (`COMPLIANT | GAP | UNKNOWN`)
- Provide certificate numbers / dates **only when KB ref exists**
- Describe processes and controls from approved boilerplate
- Offer audit / verification options when compliant

## Language style

Authoritative but not defensive. Use "We maintain…" not "We comply with…"

## GAP handling

```
[GAP: check_id] — validator_reason
Mitigation: {text OR "No mitigation currently available."}
```

## Output

Compliance section + `compliance-report.schema.json`. Flag all gaps for operator review.
