# Marketing Agent Builder Methodology

**The Architect builds agents.** Design, scaffold, and deploy **agentic AI marketing agents** — copywriters, funnel architects, email sequencers, VOC researchers, launch orchestrators, content factories — using the same patterns that power The Architect runtime.

**One voice.** The builder teaches and scaffolds; each new agent gets its **own** voice spec — informed by Galactic craft, not cloned personality.

**Templates:** `research/MARKETING-AGENT-BUILD-TEMPLATE.md` · `research/MARKETING-AGENT-SCAFFOLD-MANIFEST.md`  
**Technical layer:** `AI-PROMPT-CONTEXT-ENGINEERING-METHODOLOGY.md`  
**Reference runtime:** `the_architect/` package + `agents/the-architect/`

---

## Agent Builder in One Sentence

> **Diagnose the marketing job, pick the agent archetype, architect prompts + tools + workflow gates, scaffold the repo, then ship an agent that converts — not a chatbot that chats.**

---

## What “marketing agent” means here

An **agentic** marketing agent has:

| Layer | Requirement |
|---|---|
| **Identity** | Single voice + non-negotiables (no mode switches unless explicitly multi-agent router) |
| **Workflow** | State machine with phases and ship gates |
| **Tools** | MCP or function calls for state, memory, deliverables |
| **Knowledge** | Methodology files loaded on demand (not one bloated prompt) |
| **Output contract** | Diagnostics + asset + rubric + trackable CTA |
| **Metrics** | CAC, CVR, opens, LTV — whatever the job owns |

**Not an agent:** A single system prompt with no tools, no state, no quality gate.

---

## Marketing Agent Archetypes

| Archetype | Job | Primary Galactic phases | Key methodologies |
|---|---|---|---|
| **Copy chief** | Sales pages, emails, ads | 1, 4, 7–10 | Carlton SWS, Omni-Format, Hormozi |
| **Headline smith** | T1 hooks, subject lines | 1, 7, 8 | Caples, Victor Schwab, Schwartz |
| **Funnel architect** | Funnel maps, wireframes, lifecycle | 1, 5, 9 | Funnel Architecture, List Building |
| **Email sequencer** | Welcome, launch, nurture sequences | 1, 4, 5 | Kennedy follow-up, Kern PLC |
| **VOC researcher** | Lexicon, objections, hooks | 1 | Marketing Intelligence, VOC-RESEARCH |
| **Offer engineer** | Grand Slam, pricing, stack | 1, 9 | Hormozi, Pricing Master |
| **Content factory** | Daily social, repurposing | 1, 4, 9 | Content Engine, Omni-Format |
| **Launch orchestrator** | Weekly product + 13 assets | 1–10 | Production Factory manifest |
| **Brand strategist** | Position, tribe, voice | 1, 3, 10 | Ultimate Branding, Art Direction |
| **CRO auditor** | Funnel leaks, test plans | 1, 5, 10 | Schwartz, Abraham N×V×F |
| **Kindle author** | Daily chapters, book arc | 1, 6, 8 | Business Thriller, SWS |
| **Ads scriptwriter** | VSL, Meta/TikTok scripts | 1, 4, 7 | Omni-Format F-AD |
| **Router / meta** | Classify task → delegate | 2 | AI System Design, subagent topology |

**Rule:** Start **narrow** — one archetype, one metric. Expand tools after ship gate passes in production.

**Client attraction rule:** Every built agent's `primary_metric` must be a **client attraction metric** (opt-ins, calls, CVR, applications, revenue) — not vanity engagement.

---

## The 8-Step Marketing Agent Build Pipeline

```
1. BRIEF       — Job, avatar, metric, constraints
2. ARCHETYPE   — Pick from catalog (or hybrid with router)
3. TOPOLOGY    — Single agent vs pipeline vs evaluator-optimizer
4. WORKFLOW    — Phase state machine + ship gate
5. PROMPTS     — Apex + task slices + load order
6. TOOLS       — State, memory, deliverables, domain tools
7. SCAFFOLD    — File tree + starter prompts (CLI or agent)
8. AUDIT       — Phase 10 AI + marketing ship gates
```

Save to: `projects/<slug>/` or `agents/<new-agent-slug>/`

---

## Reference Architecture (The Architect pattern)

Clone this structure for every new marketing agent:

```
agents/<agent-slug>/
├── README.md              # What it does, how to run
├── SYSTEM.md              # Voice + craft integration
├── AGENT.md               # Workflow state machine + tools policy
├── INVOCATION.md          # Brief template
├── QUALITY-RUBRIC.md      # Ship threshold (default ≥ 8.0)
├── EDITOR-PASSES.md       # Or subset for T1/T2 agents
├── methodology/           # Sliced knowledge (optional)
└── projects/              # Per-job artifacts

<python-package>/          # Optional runtime (recommended)
├── config.py              # Paths, env, prompt file list
├── prompts.py             # build_system_prompt()
├── tools.py               # MCP tools + PHASES
├── runner.py              # Claude Agent SDK
└── __main__.py            # CLI
```

**Load order (apex pattern):**

```
APEX.md → OPERATIONS.md → SYSTEM.md → AGENT.md → [memory]
```

The Architect uses: `GALACTIC-MASTER-PROMPT.md` → `DR-SPECIALIST-PROMPT.md` → `SYSTEM.md` → `AGENT.md`.

---

## Prompt architecture for marketing agents

### Apex layer (short)

- Identity in one paragraph
- First principles (3–6 bullets)
- “One voice. No modes.” (unless router agent)
- Output contract reference

### Operations layer

- Execution engine (INTAKE → … → SHIP)
- Task → diagnostics router
- Methodology file map

### System layer

- Voice DNA table
- Craft integration (which masters inform structure)
- Ship gate checklist

### Agent layer

- State machine phases
- Tool usage policy
- Stop conditions (rubric, revision cap)

**Token discipline:** Link to methodology files; never paste entire Schwartz + Carlton into apex.

---

## Tool design standards

| Tool | Purpose | Pattern name |
|---|---|---|
| `init_project` | Brief + state.json | `architect_init_project` |
| `set_phase` | Workflow advance | `architect_set_phase` |
| `get_context` | Brief + state + next step | `architect_get_context` |
| `save_deliverable` | Write artifact + metadata | `architect_save_deliverable` |
| `ship_gate` | Rubric + checklist | `architect_ship_gate` |
| `get_memory` | Swipes / insights | `architect_get_memory` |
| Domain tools | e.g. `fetch_voc`, `score_headline` | Add only when needed |

**Guardrails:**

- Read-only tools auto-approved; writes go through deliverable saver
- Max 3 revision loops
- `[PROOF NEEDED]` never fabricated
- Compliance hard stop

---

## Multi-agent marketing topologies

| Topology | When | Example |
|---|---|---|
| **Single agent** | One job, one voice | Headline smith |
| **Sequential pipeline** | Handoffs with artifacts | VOC → Copy chief |
| **Evaluator-optimizer** | Quality-critical output | Draft → rubric → revise |
| **Router** | Many task types | Meta marketing orchestrator |

**Subagent rule (from AGENT.md):** Subagents are **phase workers**, not personality modes. Same voice DNA unless archetype explicitly differs (e.g. researcher writes notes, not final copy).

---

## Scaffold vs full build

| Mode | CLI | API | Output |
|---|---|---|---|
| **Scaffold** | `build-agent scaffold` | No | File tree + starter markdown |
| **Full build** | `build-agent run` | Yes | Scaffold + agent-written methodology + tools spec |

Scaffold is instant. Full build uses Galactic Phase 2 + Agent Builder prompts.

---

## Marketing agent ship gate

- [ ] Archetype + metric defined
- [ ] Workflow phases documented in AGENT.md
- [ ] Apex load order ≤ 4 files
- [ ] Tools: init, phase, context, save, ship_gate minimum
- [ ] INVOCATION.md brief captures avatar, offer, metric
- [ ] Rubric ≥ 8.0 on sample task
- [ ] Trackable CTA in copy-producing agents
- [ ] README: install + run instructions
- [ ] **Primary metric = client attraction** (leads, calls, CVR — not vanity)
- [ ] Phase 10 AI audit if prompt/system heavy

---

## Integration with Production Factory

| Factory job | Agent to build |
|---|---|
| Daily chapters | Kindle author agent |
| Weekly launch | Launch orchestrator agent |
| Daily content | Content factory agent |
| Client delivery | Copy chief / funnel architect |

Register built agents under `agents/<slug>/`. Optional: separate Python package per agent in monorepo.

---

## Invoke examples

**Scaffold only:**

```bash
the-architect build-agent scaffold \
  --name "Email Sequencer" \
  --archetype email_sequencer \
  --metric "sequence completion rate"
```

**Full agentic build:**

```bash
the-architect build-agent run \
  --name "Funnel Architect" \
  --archetype funnel_architect \
  --brief "B2B SaaS trial-to-paid funnel. Metric: trial CVR."
```

**Natural language (via Architect):**

```
Build an agentic AI marketing agent for daily LinkedIn authority posts.
Archetype: content_factory. Include SYSTEM, AGENT, tools spec, and CLI scaffold.
```

---

See also: `AI-PROMPT-CONTEXT-ENGINEERING-METHODOLOGY.md`, `FRAMEWORK-WORKFLOW-ENGINE.md`, `PRODUCTION-FACTORY.md`, `agents/_template/`
