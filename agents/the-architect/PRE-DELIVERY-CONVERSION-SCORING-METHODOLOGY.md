# Pre-Delivery Conversion Scoring Methodology

**Phase 10 enterprise quality gate for The Architect.** Internal 100-point audit performed **before** presenting final output — weak sections auto-rewritten until threshold met.

**One voice.** Scoring is invisible to reader unless requested; revision is mandatory.

**Template:** `research/PRE-DELIVERY-CONVERSION-SCORE-TEMPLATE.md`  
**Paired:** `QUALITY-RUBRIC.md` · `EDITOR-PASSES.md`

---

## Pre-Delivery Scoring in One Sentence

> **Score the draft like a hostile CRO — any category below 18/20 gets rewritten before the client sees a word.**

---

## Self-Scoring Conversion Matrix (100 Points)

Run internally after `EDITOR-PASSES.md`, before `<audit_score>` output.

| Category | Points | What you're scoring |
|---|---|---|
| **Hook & Pattern Interrupt Strength** | /20 | T1 test: scroll-stop, open loop, implied story, Caples self-interest |
| **Mechanism & Believability Clarity** | /20 | Named mechanism, reason-why, proof pyramid present, no unsupported claims |
| **Benefit Extraction ("So What?" Factor)** | /20 | Every feature → visceral outcome; Carlton So What? on all bullets |
| **Objection Handling & Risk Reversal** | /20 | Top 3 objections pre-handled; guarantee named; friction removed at CTA |
| **Visual Rhythm & Layout Eye Relief** | /20 | Subheads, white space, bullets, pull-quotes; skimmable; theatre (Carlton) |

### Scoring bands

| Score | Band | Action |
|---|---|---|
| **95–100** | Elite | Ship |
| **90–94** | Strong | Ship with minor polish if time allows |
| **80–89** | Acceptable | Rewrite lowest category before ship |
| **< 80** | Fail | Mandatory rewrite of all categories < 18/20 |

### The 18/20 rule

> **If any single category scores below 18/20 during internal evaluation, automatically rewrite that section before producing the final response.**

Do not show the user a draft that failed pre-delivery scoring. Revise first.

---

## Scoring rubric detail

### Hook & Pattern Interrupt (20 pts)

| Pts | Criteria |
|---|---|
| 0–8 | Generic, ignorable, no open loop |
| 9–14 | Clear but not scroll-stopping |
| 15–17 | Strong curiosity or identity pull |
| 18–20 | Would stop scroll, sell magazine, forward to friend |

### Mechanism & Believability (20 pts)

| Pts | Criteria |
|---|---|
| 0–8 | Claims without support; no named mechanism |
| 9–14 | Mechanism present; proof gaps |
| 15–17 | Clear mechanism + solid proof stack |
| 18–20 | Undeniable logic chain; proof pyramid complete |

### Benefit Extraction (20 pts)

| Pts | Criteria |
|---|---|
| 0–8 | Feature dump; no "So What?" |
| 9–14 | Some benefits translated |
| 15–17 | Most features → outcomes |
| 18–20 | Every line earns belief or action; visceral specificity |

### Objection Handling & Risk Reversal (20 pts)

| Pts | Criteria |
|---|---|
| 0–8 | No guarantee; CTA naked |
| 9–14 | Some objections addressed |
| 15–17 | Top objections + named guarantee |
| 18–20 | Pre-handled turbulence; risk on seller |

### Visual Rhythm & Layout (20 pts)

| Pts | Criteria |
|---|---|
| 0–8 | Wall of text; no eye relief |
| 9–14 | Readable but flat layout |
| 15–17 | Good subheads, bullets, spacing |
| 18–20 | Theatre-grade; power subheads; skimmer path clear |

---

## Output format

Wrap in `<audit_score>`:

```
## Pre-Delivery Conversion Score: 94 / 100

| Category | Score | Pass? |
|---|---|---|
| Hook & Pattern Interrupt | 19/20 | ✓ |
| Mechanism & Believability | 18/20 | ✓ |
| Benefit Extraction | 20/20 | ✓ |
| Objection Handling & Risk Reversal | 19/20 | ✓ |
| Visual Rhythm & Layout | 18/20 | ✓ |

Ship ready: YES
```

Also include `QUALITY-RUBRIC.md` dimension table (≥ 8.0 average, no dimension < 6).

---

## Workflow position

```
DRAFT → EDITOR-PASSES (0–6) → PRE-DELIVERY 100-PT SCORE → rewrite if <18 any category
→ QUALITY-RUBRIC → PHASE 10 AUDIT → SHIP
```

Max 3 revision loops total across editor + pre-delivery.

---

See also: `GALACTIC-MASTER-PROMPT.md` (Phase 10) · `ENTERPRISE-AI-OUTPUT-PROTOCOL.md`
