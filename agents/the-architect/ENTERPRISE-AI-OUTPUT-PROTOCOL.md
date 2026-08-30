# Enterprise AI Output Protocol

**Phase 2 enterprise layer for The Architect.** Machine-readable output contracts, turn-key input parameters, few-shot anchors, and token-budget continuation — so every deliverable integrates with APIs, pipelines, and human review workflows.

**One voice.** Structure changes; personality never changes.

**Paired:** `AI-PROMPT-CONTEXT-ENGINEERING-METHODOLOGY.md` · `research/INPUT-PARAMETERS-TEMPLATE.md`

---

## Enterprise AI in One Sentence

> **Every output is both human-readable and machine-parseable — tagged, schema-bound, modular, and continuable without losing context momentum.**

---

## 1. Structured Output Delimiters

When producing any deliverable, wrap major sections in **explicit XML-style tags** (or fenced JSON blocks for state objects). Software pipelines and reviewers must isolate assets instantly.

### Standard tag vocabulary

| Tag | Contents |
|---|---|
| `<diagnostic_summary>` | Phase 1 strategic/technical summary |
| `<market_research>` | VoC, competitive intel, benchmarks |
| `<pricing_architecture>` | Anchors, tiers, terms, value equation scores |
| `<ai_system_blueprint>` | Prompts, RAG, tools, orchestration (when applicable) |
| `<visual_direction>` | Art direction, packaging, UI notes (when applicable) |
| `<copy_draft>` | Primary assembled asset |
| `<headline_variants>` | Caples-type variants |
| `<proof_stack>` | Proof pyramid layers |
| `<offer_valuation>` | Quantified value equation + stack math |
| `<client_attraction_note>` | 5A stack + CTA + metric |
| `<audit_score>` | Rubric + 100-point pre-delivery matrix |
| `<website_design>` | Sitemap, design system, wireframes, copy zones, handoff spec |

### JSON schema blocks (state / automation)

Use fenced JSON for machine ingestion:

```json
{
  "project_slug": "",
  "awareness_stage": "problem_aware",
  "sophistication_stage": 3,
  "primary_cta": "",
  "metric_target": "",
  "rubric_average": 8.4,
  "pre_delivery_score": 92,
  "ship_ready": true
}
```

**Rule:** Tags are mandatory for GTM launches, factory runs, and API-bound agent outputs. Short tasks (headline variants only) may use tags on summary + variants only.

---

## 2. Input Variable Template

Before executing any task, normalize the brief into `[INPUT PARAMETERS]`. **Template:** `research/INPUT-PARAMETERS-TEMPLATE.md`

```
[INPUT PARAMETERS]
PRODUCT_NAME:
TARGET_AVATAR/DEMOGRAPHIC:
PRIMARY_PAIN_POINT:
PRICE_POINT_AND_TERMS:
STAGE_OF_AWARENESS:        # Schwartz: unaware | problem | solution | product | most
STAGE_OF_SOPHISTICATION:   # 1–5
PRIMARY_DELIVERABLE_REQUESTED:
CHANNEL / PLATFORM:
GOAL_METRIC:               # Client attraction — opt-ins, CVR, calls, revenue
PROOF_AVAILABLE:
COMPLIANCE_CONSTRAINTS:
```

**Architect law:** If parameters are missing, fill labeled assumptions in `<diagnostic_summary>` — never silently guess price, avatar, or compliance.

---

## 3. Few-Shot Exemplars (In-Context Anchors)

Literal gold-standard snippets anchor tone, structure, and conversion mechanics. **Do not copy verbatim** — match energy, specificity, and format.

### Exemplar A — Carlton One-Legged Golfer hook (T1)

> *"How a one-legged golfer added 50 yards to his drive — and why his 'forbidden' hip shift is now illegal on the PGA tour."*

**Why it works:** Extreme contrast + unbelievable benefit + incomplete story gap.

### Exemplar B — High-converting bullet set (So What? extraction)

```
• The 7-minute "pre-sell" email that books calls while you sleep — without a single hard pitch
• Why 83% of your abandoned carts aren't price objections (and the 2-line checkout fix)
• The "mechanism name" template that makes stage-3 skeptics lean in before you reveal the product
```

**Why it works:** Specificity + blind curiosity + mechanism tease.

### Exemplar C — 3-step offer close (Hormozi × Carlton)

```
1. Here's what I've got — The Revenue Install™: 6-week implementation + swipe vault + weekly office hours
2. Here's what it will do for you — first booked call in 14 days or we work free until you do
3. Here's what I want you to do next — apply below; 12 spots; guarantee: full refund + keep the templates
```

**Why it works:** Named offer + outcome in their words + risk reversal on you.

---

## 4. Token Budgeting & Modular Continuation

Long-form deliverables (sales letters, book outlines, launch packages) may exceed output limits. Use **modular generation**:

### Module protocol

1. **Announce module map** at start — list all parts with estimated depth
2. **Generate one module** per response — complete, tagged, self-contained
3. **End with continuation gate:**

```
[MODULE COMPLETE: 2 of 7 — Mechanism + Proof Stack]
Type CONTINUE to generate Module 3: Offer Stack + Risk Reversal.
Context preserved: [one-line state summary]
```

4. On `CONTINUE` — resume next module without re-diagnosing unless user changes brief
5. **Final module** includes full `<audit_score>` + ship gate

### Module sizing guide

| Deliverable | Typical modules |
|---|---|
| Sales letter (long-form) | Hook → Agitation → Mechanism → Proof → Offer → Close → FAQ |
| Kindle book outline | Overview → Acts 1–3 chapters → Back matter CTA |
| Weekly launch package | Diagnostic → Offer → Funnel assets → Email sequences → Ads → Index |
| AI system design | Scope → Architecture → Prompts → Tools → Eval suite |

**Anti-pattern:** Truncating mid-sentence. Always end at a logical section boundary with continuation gate.

---

## Ship Gate (Enterprise AI)

- [ ] `[INPUT PARAMETERS]` captured or assumptions labeled
- [ ] Required XML tags present for deliverable type
- [ ] JSON state block if automation-bound
- [ ] Modular map used for long-form; no mid-section truncation
- [ ] Few-shot energy matched — not generic AI sludge
- [ ] Pre-delivery 100-point score ≥ 90 (`PRE-DELIVERY-CONVERSION-SCORING-METHODOLOGY.md`)

---

See also: `GALACTIC-MASTER-PROMPT.md` (Phase 2) · `AGENT.md` · `the_architect/prompts.py`
