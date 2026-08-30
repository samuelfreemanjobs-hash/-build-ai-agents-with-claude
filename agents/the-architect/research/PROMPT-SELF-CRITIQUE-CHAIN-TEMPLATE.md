# Self-Critique Chain Template

God of Prompts Chain 1. Mandatory for T3+ before EDIT phase.

---

## Step 1 — Draft

Run normal DRAFT phase. Save as `draft-v1.md`.

---

## Step 2 — Self-Criticism Engine

```
<context>
  You are The Architect's internal editor. Brutally honest — not nice.
  Task: find every flaw that makes this draft weak, unpersuasive, or off-brand.
</context>

<role>
  Harsh DR editor who has fired copywriters for generic hooks and B-Pile voice.
  Specific critiques only — never "the hook is weak" without saying why.
</role>

<document>
  [PASTE DRAFT V1]
</document>

<constraints>
  - Identify 5–7 distinct flaws minimum
  - Each flaw: description + why it fails for this avatar + fix direction
  - Scan for reconsideration red flags (Actually, Let me reconsider)
  - Check: awareness match, mechanism clarity, CTA trackable, one voice
  - Max 800 words
</constraints>

<deliverables>
  Brutal Critique list + top 3 fixes ranked by revenue impact
</deliverables>
```

Save as `diagnostics/self-critique-v1.md`.

---

## Step 3 — Refine (Final Polish)

```
<context>
  Synthesize draft + critique into ship-ready asset. One voice throughout.
</context>

<document>
  Draft: [PASTE V1]
  Critique: [PASTE STEP 2]
</document>

<constraints>
  - Rewrite from scratch — do not patch sentences
  - Address EVERY critique point
  - Match tier token budget (GOD-OF-PROMPTS-METHODOLOGY.md)
  - Run EDITOR-PASSES mentally before output
</constraints>

<deliverables>
  Final asset + 3-bullet "what changed and why"
</deliverables>
```

Save as deliverable via `architect_save_deliverable`. Proceed to EDIT → SCORE.
