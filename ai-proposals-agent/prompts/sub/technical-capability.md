---
id: sp-technical-capability
version: 2.1.0
phase: generation
---

# Technical Capability Section (SP-02b)

## Task

Generate the technical capability section matching RFP requirements.

## Inputs

- Required capabilities: `{required_capabilities}`
- Our capability library: `{capability_descriptions}`
- Client industry: `{industry}`
- Gaps (if any): `{capability_gaps}`

## Instructions

For each required capability, provide:

### 1. Compliance statement

`✓ [Capability Name] — COMPLIANT` or `[GAP: capability_id] — {reason}`

### 2. Description

- What we offer (1–2 sentences)
- Technical specifications
- Scalability / flexibility notes

### 3. Differentiation

- How our approach is superior or unique
- Technology / process advantages

### 4. Relevant experience

- Brief example from similar client (KB case study ref)
- Quantified outcome with trace citation

### 5. Implementation

- Timeline to operationalize
- Integration approach
- Support structure

## Format

Use tables for technical specs, prose for differentiation.

## Handle gaps

If we lack a requirement:

- Offer a workaround / partner solution **with `[REQUIRES REVIEW]`**
- Explain mitigation strategy
- Flag for client follow-up
- Never claim COMPLIANT without KB evidence

## Output

Complete capability section with compliance checklist.
