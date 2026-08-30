# God of Prompts — Prompt Engineering Methodology

**Status:** LOCKED — integrated into The Architect runtime  
**Full reference:** `references/god-of-prompts-complete.md` (God of Prompt + Google whitepaper)  
**Paired:** `AI-PROMPT-CONTEXT-ENGINEERING-METHODOLOGY.md` · `ENTERPRISE-AI-OUTPUT-PROTOCOL.md`

---

## One sentence

> **Systems over single prompts:** chain where output A feeds B, zone with XML, critique before ship, match token budget to task difficulty, compact state before drift.

---

## The 12 principles (Architect enforcement)

| # | Principle | Architect implementation |
|---|---|---|
| 01 | Systems over single prompts | Factory chains, self-critique loop, Revenue Intel pipeline |
| 02 | Rich persona, not job title | SYSTEM.md voice + backstory; never "you are a consultant" |
| 03 | XML zoning laws | `<context>`, `<role>`, `<constraints>`, `<variables>`, `<document>` |
| 04 | Theory of Mind | INVOCATION three layers; explicit avatar/offer/metric in every brief |
| 05 | Built-in self-critique | DRAFT → CRITIQUE → REFINE before EDIT (see AGENT.md) |
| 06 | Meta-prompting | `research/PROMPT-GENERATOR-TEMPLATE.md`; agent builder scaffold |
| 07 | Context architecture first | `context/freeman-intelligence-identity.md` + project brief.json |
| 08 | 60% Rule | Cap output at tier token budget; longer ≠ better (see table below) |
| 09 | State compaction | Every 10–15 agent turns: `architect_compact_state` |
| 10 | End-session memory | SHIP produces `session-memory.md` snippet for next run |
| 11 | Three-layer prompts | Layer 1 identity · Layer 2 session · Layer 3 task |
| 12 | Match token budget to difficulty | T1 tight · T4 room; never uniform |

---

## Reconsideration red flags

If these appear **late** in output, accuracy has peaked — regenerate with tighter constraints:

`Actually…` · `Let me reconsider…` · `I may have overcounted…` · `Wait, on reflection…`

**Architect rule:** At SCORE phase, scan for red flags. If found → REVISE with explicit word limit, not longer prompt.

---

## Token budgets by tier (60% Rule)

| Tier | Task | Target output | Max tokens (guidance) |
|---|---|---|---|
| T1 | Headlines, hooks, blurbs | 3–12 words / 1–3 lines | ~500 |
| T2 | Subject lines, ad leads, social | 40–150 words | ~1,200 |
| T3 | Sales pages, emails, squeeze | 500–3,000 words | ~4,000 |
| T4 | Chapters, courses, launches | 3,000+ words | ~8,000 |

**CoT rule:** Use step-by-step reasoning only for T3+ multi-step tasks. Never on T1/T2.

---

## Three-layer prompt structure (mandatory at INTAKE)

```
Layer 1 — Identity & persistent context:
  [Load context/freeman-intelligence-identity.md or project identity file]

Layer 2 — Session / project:
  [Project slug, offer, channel, metric, diagnostics completed]

Layer 3 — Task now:
  [One specific deliverable + format + constraints]
```

**Template:** `research/CONTEXT-THREE-LAYER-TEMPLATE.md`

---

## XML envelope (Claude-native — default for T3+)

```
<context>...</context>
<role>...</role>
<variables>...</variables>
<instructions>...</instructions>
<constraints>...</constraints>
<deliverables>...</deliverables>
```

For pasted source material, wrap in `<document>...</document>` — never mix with instructions.

**Python builder:** `the_architect.prompt_engineering.build_xml_prompt()`

---

## Chain systems (mapped to Architect workflow)

| Chain | Steps | When |
|---|---|---|
| **Self-Critique QC** | Draft → Critique → Refine | Every T3+ ship (DRAFT phase) |
| **XML Constraint** | Logic audit → XML rewrite | New agent prompts, API prompts |
| **Cognitive Empathy** | Epistemic → Alien collaborator → Audience sim | Strategy, positioning, offer design |
| **Strategic Warfare** | DNA → Feedback loops → War room | Competitive intel, GTM |
| **Memory** | Identity file → Layer fix → Session summary | Session start/end |
| **State Compactor** | JSON save point | Long runs @ turn 10–15 |

**Templates:** `research/PROMPT-SELF-CRITIQUE-CHAIN-TEMPLATE.md` · `research/PROMPT-STATE-COMPACTION-TEMPLATE.md`

---

## Google technique router (quick)

| Situation | Technique |
|---|---|
| Simple classification/extraction | Zero-shot, temp=0 |
| Specific format needed | Few-shot (3–5 examples) |
| Generic answers | Step-back prompting |
| Multi-step math/reasoning | CoT (temp=0), answer after reasoning |
| Inconsistent answers | Self-consistency (3–5 runs, majority) |
| External/current data | ReAct / tools |
| Structured anti-hallucination | JSON or XML output schema |
| Bloated simple answers | Word limit in `<constraints>` |
| Long session drift | State compactor JSON |

---

## Model selection (Architect runtime)

| Model class | Use for |
|---|---|
| Fast / Haiku-class | T1 headlines, swipe annotation, batch tagging |
| Sonnet-class | 80–90% daily factory, copy, diagnostics |
| Opus-class | Architecture, weekly launch, deep strategy |

---

## Integration with existing stack

| Existing | God of Prompts layer |
|---|---|
| `GALACTIC-MASTER-PROMPT.md` | Apex phases unchanged; XML tags extend Phase 2 output |
| `DR-SPECIALIST-PROMPT.md` | Execution engine adds CRITIQUE + token budgets |
| `ENTERPRISE-AI-OUTPUT-PROTOCOL.md` | XML tag vocabulary = zoning laws |
| `EDITOR-PASSES.md` | Pass 3 = persuasion; self-critique feeds Pass 2 |
| `QUALITY-RUBRIC.md` | SCORE scans reconsideration red flags |
| Factory prompts | `prompt_engineering.build_factory_prompt()` |
| Revenue Intel Agent | XML user envelope in `gemini-briefing.php` |

---

## Anti-patterns (instant reject)

- One mega-prompt with no layers
- "Think step by step" on a headline request
- Job-title persona without backstory
- Instructions mixed inside `<document>`
- Shipping first draft without critique pass
- Uniform 8K token budget on every task

---

See also: `references/god-of-prompts-complete.md` · `context/freeman-intelligence-identity.md` · `research/PROMPT-GENERATOR-TEMPLATE.md`
