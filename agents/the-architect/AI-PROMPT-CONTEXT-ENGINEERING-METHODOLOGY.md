# AI Prompt & Context Engineering Methodology

**Phase 2 technical layer for The Architect.** Elite prompt engineering, context density optimization, RAG/memory design, agentic workflow orchestration, and AI deployment guardrails.

**One voice.** Technical precision in system design; the same author voice in user-facing agent outputs.

**Template:** `research/AI-SYSTEM-DESIGN-TEMPLATE.md`

---

## AI Engineering in One Sentence

> **Engineer context like revenue — every token must earn its place, every constraint must be unambiguous, and every agent workflow must have gates, tools, and fallbacks before it touches a user.**

---

## The Four Technical Disciplines (Phase 2)

```
2A  Elite Prompt Engineering
2B  Context Engineering
2C  AI System Design & Orchestration
2D  AI Engineering & Deployment
```

---

## 2A — Elite Prompt Engineering

### System prompt architecture

| Component | Spec |
|---|---|
| **Identity** | Role, voice, non-negotiables — one paragraph max at apex |
| **Load order** | Which knowledge files inject when |
| **Behavioral constraints** | Never fabricate proof; always diagnose before draft |
| **Edge-case guards** | Thin brief, missing API key, compliance stops |
| **Output contract** | Format, sections, scoring requirements |

### Few-shot & chain-of-thought

| Technique | Use when |
|---|---|
| **Few-shot examples** | Format-sensitive outputs (JSON, rubric tables, headline variants) |
| **Chain-of-thought** | Multi-step reasoning (diagnostics, offer stack math, funnel mapping) |
| **Structured output** | JSON schema, markdown headers, required section checklist |

**Anti-pattern:** Bloated prompts with duplicate rules across layers — compress into load order.

---

## 2B — Context Engineering

### Token economy

| Rule | Implementation |
|---|---|
| **Signal-to-noise** | Cut redundant methodology; link to files instead of pasting |
| **Compression** | Tables > prose for diagnostics; bullets > paragraphs for constraints |
| **Hierarchy** | H1/H2 headers, key-value blocks, JSON for machine-parseable state |
| **Dynamic injection** | Load only task-relevant methodology (task router) |

### RAG & dynamic memory design

| Layer | Content |
|---|---|
| **System rules** | Apex prompt + ship gates |
| **Task context** | Brief, phase, diagnostics completed |
| **Retrieval corpus** | Swipe files, VOC, methodology slices |
| **Session memory** | Project state, prior deliverables, insights |

**Architect runtime pattern:** `GALACTIC-MASTER-PROMPT.md` → `DR-SPECIALIST` → `SYSTEM` → `AGENT` + `architect_get_memory`.

### Context window strategy

1. Apex identity + current phase constraints (always)
2. Task-specific methodology slice (on demand)
3. Project brief + diagnostics (per job)
4. Recent memory / swipes (top-k relevant)

---

## 2C — AI System Design & Orchestration

### Agentic topology patterns

| Pattern | Structure | Best for |
|---|---|---|
| **Sequential pipeline** | INTAKE → RESEARCH → … → SHIP | Copy projects (`AGENT.md`) |
| **Evaluator-optimizer** | Draft → score → revise (max 3 loops) | Quality-gated output |
| **Router** | Classify task → load methodology slice | Multi-skill agent |
| **Parallel gather** | VOC + competitive + metrics simultaneously | Phase 1 intelligence |

### Tool-use & API protocols

| Standard | Detail |
|---|---|
| **Crisp tool definitions** | Name, description, parameters, return shape |
| **Idempotent reads** | `get_context`, `list_knowledge` safe to repeat |
| **State mutations** | `set_phase`, `save_deliverable` logged to project folder |
| **Fallbacks** | Missing proof → `[PROOF NEEDED]`; thin brief → labeled assumptions |
| **Human gates** | `architect_ship_gate` before SHIP |

**Framework link:** `FRAMEWORK-WORKFLOW-ENGINE.md` — agent phases = workflow phases.

---

## 2D — AI Engineering & Deployment

### Model selection matrix

| Task type | Priority | Typical need |
|---|---|---|
| Long-form copy | Quality, voice consistency | Higher capability |
| Diagnostics / JSON | Structure, reasoning | CoT + schema |
| Headline variants | Speed, volume | Fast iteration |
| Embeddings / RAG | Retrieval quality | Dedicated embed model |

### Validation & guardrails

| Guardrail | Implementation |
|---|---|
| **Structured output** | JSON schema for `brief.json`, `state.json` |
| **Rubric enforcement** | ≥ 8.0 average, no dimension < 6 |
| **Editor passes** | 6 mandatory passes before ship |
| **Eval suites** | Test prompts against golden briefs |
| **Compliance hard stop** | No ship until constraint satisfied |

---

## Prompt Design Checklist (Ship Gate — Phase 10)

- [ ] Role + constraints unambiguous
- [ ] Output format specified
- [ ] Edge cases handled (thin brief, missing data)
- [ ] Token budget reasonable — no duplicate rules
- [ ] Tool definitions crisp with fallbacks
- [ ] Revision loop cap documented (max 3)
- [ ] Quality gate terminal (rubric + ship gate)

---

## Workflow

```
1. SCOPE      — What does the AI system do? Input/output contract
2. ARCHITECT  — Topology (pipeline / router / evaluator)
3. PROMPT     — Apex + task slices + few-shot if needed
4. CONTEXT    — RAG corpus + memory + load order
5. TOOLS      — Functions, state, gates
6. VALIDATE   — Eval cases + guardrails
7. DEPLOY     — Document invoke + monitor metrics
```

---

See also: `FRAMEWORK-WORKFLOW-ENGINE.md`, `AGENT.md`, `GALACTIC-MASTER-PROMPT.md` (Phase 2), `AGENT-BUILDER-METHODOLOGY.md`, `the_architect/tools.py`
