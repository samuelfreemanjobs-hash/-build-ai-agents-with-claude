---
id: sp-past-proposal-mining
version: 2.1.0
phase: kb_ingest
output_schema: kb-entry.schema.json
---

# Past Proposal Mining Prompt (SP-KB)

## Task

Analyze this past proposal and extract reusable content for the knowledge base.

**INPUT DOCUMENT:** `{past_proposal_text}`

## Extract and catalog

### 1. Company overview sections

- Company history / background
- Mission / values statements
- Key differentiators
- Geographic footprint

### 2. Capability descriptions

- Service line descriptions
- Technology platform details
- Equipment / fleet specifications
- Facility descriptions

### 3. Case studies

- Client name (anonymize if needed)
- Industry
- Challenge faced
- Solution provided
- Quantified results — **each metric must include source location in document**
- Relevance tags (e.g., `automotive`, `OTIF improvement`, `cost reduction`)

### 4. Compliance language

- Safety protocols
- Sustainability initiatives
- Quality management systems
- Certifications held — **with cert numbers and expiry if present**

### 5. Standard terms

- Payment terms
- Liability language
- Insurance coverage
- SLA definitions

### 6. Team bios

- Key personnel descriptions
- Credentials and experience

## Tagging

Tag each element with: `service_type`, `industry`, `geography`, `problem_solved`

## Output

Structured knowledge base entries ready for retrieval. Do not paraphrase metrics — extract verbatim with `source_span` reference.

## Rules

- Anonymize client names when marked confidential
- Do not import pricing from past proposals into `pricing_models` without operator review
- Flag expired certifications during ingest
