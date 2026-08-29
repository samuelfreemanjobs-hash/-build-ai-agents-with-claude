# Build AI Agents with Claude

Agent library for high-performance AI copywriters, marketers, and business writers.

## The Architect

Elite direct-response copywriter + Cosmopolitan cover blurb ghostwriter + National Enquirer headline writer + Pagan/Woodsmall-style teacher + marketing systems architect.

**Location:** [`agents/the-architect/`](agents/the-architect/)

| File | Purpose |
|---|---|
| [`SYSTEM.md`](agents/the-architect/SYSTEM.md) | Core system prompt (load this in your agent) |
| [`INVOCATION.md`](agents/the-architect/INVOCATION.md) | Project brief template — fill and paste per session |
| [`EDITOR-PASSES.md`](agents/the-architect/EDITOR-PASSES.md) | 6-pass revision protocol (never ship first drafts) |
| [`QUALITY-RUBRIC.md`](agents/the-architect/QUALITY-RUBRIC.md) | Self-scoring rubric before delivery |
| [`CRAFT-PLAYBOOKS.md`](agents/the-architect/CRAFT-PLAYBOOKS.md) | Genre structures (email, sales page, VSL, book, ads) |
| [`MICRO-COPY-LAB.md`](agents/the-architect/MICRO-COPY-LAB.md) | Cosmo + Enquirer pattern library |
| [`SWIPE-FILE.md`](agents/the-architect/SWIPE-FILE.md) | Annotated copy examples (structure, not plagiarism) |
| [`OBJECTIONS.md`](agents/the-architect/OBJECTIONS.md) | Objection library + rebuttal frames |
| [`VOC-RESEARCH.md`](agents/the-architect/VOC-RESEARCH.md) | Voice-of-customer research protocol |
| [`HALBERT-METHODOLOGY.md`](agents/the-architect/HALBERT-METHODOLOGY.md) | Gary Halbert: starving crowd, A-Pile, AIDA, offers |
| [`KERN-METHODOLOGY.md`](agents/the-architect/KERN-METHODOLOGY.md) | Frank Kern: Results in Advance, IBB, funnels, Core Identity |
| [`HOPKINS-METHODOLOGY.md`](agents/the-architect/HOPKINS-METHODOLOGY.md) | Claude Hopkins: scientific advertising, reason-why, specificity, testing |
| [`KENNEDY-METHODOLOGY.md`](agents/the-architect/KENNEDY-METHODOLOGY.md) | Dan Kennedy: Magnetic Marketing, PAS, 10 Questions, offers |
| [`ABRAHAM-METHODOLOGY.md`](agents/the-architect/ABRAHAM-METHODOLOGY.md) | Jay Abraham: Preeminence, N×V×F growth, Parthenon, risk reversal |
| [`CIALDINI-METHODOLOGY.md`](agents/the-architect/CIALDINI-METHODOLOGY.md) | Robert Cialdini: seven principles, pre-suasion, ethical influence |
| [`CAPLES-METHODOLOGY.md`](agents/the-architect/CAPLES-METHODOLOGY.md) | John Caples: tested headlines, story ads, before/after, split-run testing |
| [`SUGARMAN-METHODOLOGY.md`](agents/the-architect/SUGARMAN-METHODOLOGY.md) | Joe Sugarman: slippery slide, 31 triggers, emotion→logic, mail-order craft |
| [`research/KENNEDY-10Q-TEMPLATE.md`](agents/the-architect/research/KENNEDY-10Q-TEMPLATE.md) | Pre-copy diagnostic template |
| [`research/ABRAHAM-LEVERS-TEMPLATE.md`](agents/the-architect/research/ABRAHAM-LEVERS-TEMPLATE.md) | Three-lever and offer scan template |
| [`research/CIALDINI-PRINCIPLES-TEMPLATE.md`](agents/the-architect/research/CIALDINI-PRINCIPLES-TEMPLATE.md) | Seven-principle and pre-suasion audit template |
| [`research/CAPLES-HEADLINE-TEST-TEMPLATE.md`](agents/the-architect/research/CAPLES-HEADLINE-TEST-TEMPLATE.md) | 10 headline variants + split-test plan |
| [`research/SUGARMAN-TRIGGER-AUDIT-TEMPLATE.md`](agents/the-architect/research/SUGARMAN-TRIGGER-AUDIT-TEMPLATE.md) | Slippery slide + psychological trigger audit |
| [`HALBERT-NEWSLETTER-INDEX.md`](agents/the-architect/HALBERT-NEWSLETTER-INDEX.md) | Newsletter archive index by topic |
| [`research/VOC-LEXICON-TEMPLATE.md`](agents/the-architect/research/VOC-LEXICON-TEMPLATE.md) | Save per-project VOC output |

## Quick start (Cursor)

1. Open Agent chat.
2. *"You are The Architect. One voice. Follow agents/the-architect/SYSTEM.md"*
3. Fill in [`INVOCATION.md`](agents/the-architect/INVOCATION.md) with your project.
4. Same voice for headlines, sales pages, emails, books — no mode switching.

## What makes this writer different

- **One author voice** — Cosmo hooks, Enquirer drama, Halbert discipline, Kern psychology, Kennedy PAS, Abraham preeminence, Cialdini persuasion, Caples headlines, Sugarman slide — same person throughout
- **8-word test first** — if the hook fails short, the long copy will too
- **Mandatory editor passes** — structural, line, punch-up, proof, CTA, ethics
- **Quality rubric** — self-scores before shipping (min 8.0 average)
- **Genre playbooks** — proven structures per asset type
- **Micro-copy lab** — 10-variant protocol with pattern diversity
- **VOC research mode** — mine real customer language before writing
- **Swipe file** — annotated examples; extract structure, not words
- **Kennedy direct response** — PAS, 10 Questions, Magnetic Marketing triad, irresistible offers, follow-up systems
- **Cialdini persuasion** — seven principles, pre-suasion, ethical proof/scarcity, principle stacking for ads and copy
- **Caples tested advertising** — headline-first discipline, story hooks, before/after, long copy, split-run testing
- **Sugarman slippery slide** — momentum copy, 31 triggers, emotion→logic, seeds of curiosity, product/mail-order craft
- **Objection library** — pre-built rebuttals + placement guide
- **Teaching install format** — Pagan chunking + Woodsmall distinctions

## Recommended workflow

```
1. VOC        → lexicon + objections + hook seeds
2. DR/Teach   → full asset using VOC phrases
3. Punch-up   → editor passes + rubric score
```

## Example

```
You are The Architect. One voice. Follow agents/the-architect/SYSTEM.md.

Write a sales page for my confidence course.
Avatar: women 38–52, re-entering dating after divorce.
[paste 5 customer reviews]
```
