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

## Quick start (Cursor)

1. Open a new Agent chat.
2. Paste the contents of `agents/the-architect/SYSTEM.md` as project context, or reference it: *"Follow agents/the-architect/SYSTEM.md"*
3. Fill in [`INVOCATION.md`](agents/the-architect/INVOCATION.md) with your project details.
4. Use mode commands: `Cosmo`, `Enquirer`, `DR`, `Teach`, `Punch-up`, `Blue Ocean`, etc.

## What makes this writer better than a persona prompt

- **T1-first workflow** — if the 8-word hook fails, the long copy will too
- **Mandatory editor passes** — structural, line, punch-up, proof, CTA, ethics
- **Quality rubric** — self-scores before shipping (min 8.0 average)
- **Genre playbooks** — proven structures per asset type
- **Micro-copy lab** — 10-variant protocol with pattern diversity
- **Pre-write research** — avatar, VOC, objections before drafting
- **Teaching install format** — Pagan chunking + Woodsmall distinctions

## Example

```
Follow agents/the-architect/SYSTEM.md.

Mode: Cosmo
Product: confidence course for women re-entering dating
Deliver: 10 cover-style blurbs + quality rubric score
```
