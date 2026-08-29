# VOC Research Mode

Voice-of-Customer research protocol for The Architect. Run **before** drafting any sales asset.

After VOC extraction, run Kennedy's 10 Questions (`KENNEDY-METHODOLOGY.md`, `research/KENNEDY-10Q-TEMPLATE.md`). For strategy and offer assets, run Abraham's three-lever scan (`ABRAHAM-METHODOLOGY.md`, `research/ABRAHAM-LEVERS-TEMPLATE.md`). For ads and sales copy, run Cialdini's principles audit (`CIALDINI-METHODOLOGY.md`, `research/CIALDINI-PRINCIPLES-TEMPLATE.md`). For headlines and display ads, run Caples headline test sheet (`CAPLES-METHODOLOGY.md`, `research/CAPLES-HEADLINE-TEST-TEMPLATE.md`). For long-form and product copy, run Sugarman trigger audit (`SUGARMAN-METHODOLOGY.md`, `research/SUGARMAN-TRIGGER-AUDIT-TEMPLATE.md`).

**Output:** Avatar brief + VOC lexicon + objection map + hook seeds (no full copy unless requested)

---

## When to Run

- New project or niche
- Offer repositioning
- Copy underperforming (CTR, conversion, bounce)
- User says "I don't know my audience"
- Before `DR`, `Teach`, or any T3/T4 asset

**Rule:** No long-form copy until VOC research is complete or assumptions are stated explicitly.

---

## Research Workflow

### Phase 1 — Source Gathering

Collect language from real humans. Priority order:

| Priority | Source | What to extract |
|---|---|---|
| 1 | **Customer interviews / support tickets** | Exact phrases, pain descriptions, wins |
| 2 | **Sales call recordings / DMs** | Objections, hesitations, "I wish..." |
| 3 | **Amazon reviews** (competitor products, 1★ and 5★) | Pain language, delight language, complaints |
| 4 | **Reddit / Facebook groups / forums** | Unfiltered problems, slang, skepticism |
| 5 | **YouTube comments** (competitor videos) | Questions, pushback, aha moments |
| 6 | **Survey data** (if available) | Quantified priorities |
| 7 | **Competitor copy** | Exhausted claims (what NOT to say) |

**If user provides no sources:** Ask for 2–3 of the above, OR run web research if tools available, OR state assumptions clearly and flag for validation.

**Minimum viable research:** 20+ verbatim phrases across pain, desire, and objection.

---

### Phase 2 — Extraction Categories

For each source, tag phrases into buckets:

#### Pain Language
- What hurts right now? (symptoms)
- What have they tried? (failed solutions)
- What does a bad day look like? (scenes)

#### Desire Language
- What do they want? (surface)
- Who do they want to become? (identity)
- What would they brag about? (status)

#### Objection Language
- Why they didn't buy / churned
- "I would if..." conditionals
- Skepticism phrases ("sounds like...", "scam", "doesn't work for me")

#### Trigger Moments
- What happened right before they searched?
- Life events, seasons, deadlines

#### Awareness Signals
- Do they name the problem? (problem-aware)
- Do they name solutions? (solution-aware)
- Do they name competitors? (product-aware)

---

### Phase 3 — Synthesis

Produce these deliverables:

#### 1. Avatar Snapshot (1 paragraph)
Demographics + psychographics + current state + desired state. Write in third person.

#### 2. VOC Lexicon
Table of **exact phrases** to use in copy (not paraphrased):

| Phrase (verbatim) | Bucket | Use in |
|---|---|---|
| | pain / desire / objection | headline / lead / bullet / FAQ |

**Minimum 15 phrases.** Mark top 5 "golden phrases" — most emotional, most specific.

#### 3. Awareness Level
Single label + evidence:

| Level | Evidence |
|---|---|
| Unaware | Doesn't name problem; describes symptoms |
| Problem-aware | Names problem; not solutions |
| Solution-aware | Compares approaches; skeptical |
| Product-aware | Knows you/competitors; needs deal/proof |
| Most aware | Ready to buy; needs push |

#### 4. Objection Map
Top 5 objections using template from `OBJECTIONS.md`. Use **their words** for the objection column.

#### 5. Competitive Noise
- Claims everyone makes (exhausted — avoid or reframe)
- Gaps no one addresses (Blue Ocean seeds)

#### 6. Hook Seeds (T1)
10 micro-hooks derived from VOC (not generic). Pull from:
- Golden phrases
- Trigger moments
- Contrarian angles from failed solutions
- Identity desires

#### 7. Assumptions & Gaps
- What we don't know yet
- Recommended validation (survey question, ad test, interview prompt)

---

## Research Prompts (for user or AI web research)

### Amazon Review Mining
Search: `[competitor product name] reviews`
Extract:
- 5 most common 1★ complaints (verbatim)
- 5 most common 5★ delights (verbatim)
- Repeated words across reviews

### Reddit / Forum Mining
Search: `[problem] reddit` or `site:reddit.com [niche] [pain]`
Extract:
- Post titles (hook gold)
- Top comment phrases
- Recurring frustrations

### Interview Questions (if user can ask customers)
1. What was happening in your life when you started looking for [solution]?
2. What had you already tried?
3. What almost stopped you from buying?
4. What would you tell someone in your old situation?
5. What surprised you after you started?

---

## Output Format

```markdown
# VOC Research: [Project / Niche]
Date: [date]
Sources: [list]

## Avatar Snapshot
[paragraph]

## Awareness Level: [U/P/S/Pr/M]
Evidence: [bullets]

## VOC Lexicon

| Phrase | Bucket | Use in |
|---|---|---|
| ... | ... | ... |

**Golden phrases (top 5):**
1. ...
2. ...

## Objection Map
[table from OBJECTIONS.md template]

## Competitive Noise
**Exhausted claims:** ...
**Blue Ocean gaps:** ...

## Hook Seeds (T1)
1. ...
2. ...
[10 total]

## Assumptions & Gaps
- ...
```

Save project-specific output to: `agents/the-architect/research/[project-slug]-voc.md`

---

## VOC → Copy Integration Rules

1. **Headlines:** Pull from golden phrases or hook seeds — adapt, don't invent.
2. **Leads:** Open with a trigger moment or pain scene from lexicon.
3. **Bullets:** Use desire language verbatim where possible.
4. **FAQ:** Use objection phrases as section headers (quoted).
5. **CTA:** Identity language from desire bucket.

**Banned:** Generic copy that could apply to any niche. If no VOC phrase appears in the first 100 words, rewrite.

---

## Quick VOC (15-minute version)

When time is limited:

1. User pastes 5–10 customer quotes, reviews, or DMs
2. Extract lexicon (min 10 phrases)
3. Top 3 objections
4. Awareness level
5. 5 hook seeds

State: *"Quick VOC — validate before scaling spend."*

When research is complete, write the asset in The Architect voice — same author for hooks and body.
