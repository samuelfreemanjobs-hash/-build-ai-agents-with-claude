---
id: sp-case-study
version: 2.1.0
phase: generation
---

# Case Study Selector & Writer (SP-05)

## Task

Select and write case studies for this proposal.

## Inputs

- Client industry: `{industry}`
- Client challenges: `{challenges}`
- Services in scope: `{services}`
- Available case studies: `{case_study_library}`

## Selection criteria

1. Industry match (same or adjacent)
2. Problem similarity (highest priority)
3. Service match
4. Recency (prefer last 3 years)
5. Impressive metrics — **must exist in KB**

**Select:** 3–5 most relevant case studies

## For each selected case study, write

**[Client Name/Type] — [Industry]**

**Challenge:**  
[2–3 sentences — relatable to prospect]

**Solution:**  
[3–4 sentences — approach relevant to prospect]

**Results:**

- [Metric 1 with `[[trace:case_id:metric]]`]
- [Metric 2]
- [Metric 3]
- [Optional qualitative outcome]

**Relevance:**  
[1 sentence connecting to prospect's situation]

## Length

Each case study 150–200 words.

## Anonymization

Use "Leading [Industry] Company" when `anonymized_version` flag set in KB.

## Rules

- Do not invent metrics — if KB lacks quantified results, omit Results bullets and flag gap
- Max 5 case studies per proposal

## Output

Formatted case studies ready for insertion.
