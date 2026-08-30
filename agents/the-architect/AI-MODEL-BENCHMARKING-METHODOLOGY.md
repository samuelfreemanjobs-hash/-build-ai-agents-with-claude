# AI Model Benchmarking & Evaluation Methodology

**Technical QA layer for The Architect.** Benchmark prompts to compare LLM output quality across Claude, GPT, Gemini, and others for specific direct-response tasks.

**One voice.** Evaluation measures craft adherence, not generic helpfulness.

**Template:** `research/AI-MODEL-BENCHMARK-TEMPLATE.md`  
**Paired:** `AI-PROMPT-CONTEXT-ENGINEERING-METHODOLOGY.md` · `QUALITY-RUBRIC.md` · `PRE-DELIVERY-CONVERSION-SCORING-METHODOLOGY.md`

---

## Model Benchmarking in One Sentence

> **Test the same brief on every model with the same rubric — then route each task type to the model that ships conversion-grade output fastest.**

---

## Benchmark Task Categories

| Task ID | Task type | Success criteria |
|---|---|---|
| **T-HOOK** | 10 headline variants | Caples diversity + T1 strength |
| **T-DIAG** | Schwartz diagnostic JSON | Structure + accuracy |
| **T-SALES** | Long-form sales letter section | Voice + proof + CTA |
| **T-EMAIL** | 5-email soap opera | Slippery slide + single CTA |
| **T-OFFER** | Grand Slam stack math | Value equation + 10× ratio |
| **T-FUNNEL** | Funnel map + micro-copy | MECE stages + friction audit |
| **T-AGENT** | System prompt + tools spec | Constraints + output contract |
| **T-WEB** | Website wireframe + copy zones | IA + design system + CTA map |
| **T-COMPLY** | Compliance rewrite | Policy pass + conversion retained |

---

## Benchmark Protocol

```
1. GOLDEN BRIEF    — Fixed test brief per task ID (store in template)
2. MODELS          — Claude / GPT / Gemini / (others)
3. PROMPT          — Identical system + user prompt per model
4. RUN             — 3 runs per model (check consistency)
5. SCORE           — QUALITY-RUBRIC + pre-delivery 100-pt where applicable
6. RANK            — Weighted score by task priority
7. ROUTE           — Document model → task mapping
```

### Scoring weights (DR tasks)

| Dimension | Weight |
|---|---|
| Voice consistency | 25% |
| Conversion mechanics | 25% |
| Structure compliance | 20% |
| Specificity / proof | 15% |
| Speed / token cost | 15% |

---

## Model routing matrix (example — update per benchmark)

| Task | Primary | Fallback | Notes |
|---|---|---|---|
| Long-form copy | Higher capability model | — | Voice consistency critical |
| Headlines (volume) | Fast model | Higher for final pick | Generate 10, human/agent curate |
| JSON diagnostics | Reasoning-strong | — | Schema adherence |
| Code / automation tags | Code-optimized | — | Merge tag syntax |
| Multimodal prompts | Vision-capable if needed | — | Image brief generation |

**Architect runtime:** `the_architect` defaults to configured API model; benchmark informs recommendations in deliverables.

---

## Eval Suite Maintenance

- [ ] Golden briefs versioned in `research/AI-MODEL-BENCHMARK-TEMPLATE.md`
- [ ] Re-benchmark when models update (quarterly)
- [ ] Track regression on voice drift
- [ ] Document winner per task in project insights (`architect_record_insight`)

---

See also: `ENTERPRISE-AI-OUTPUT-PROTOCOL.md` · `AGENT-BUILDER-METHODOLOGY.md`
