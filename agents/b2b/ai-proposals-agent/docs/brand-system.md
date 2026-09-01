# AI Proposals Agent™ — Brand System

## Mark

The logo is a **ledger rule** that runs horizontally until it meets a **vertical trace line**, which descends to a **filled node**.

**Meaning:** Every line item connects to something checkable — the product's core guarantee as a glyph.

### Variants

| Variant | Use |
|---------|-----|
| Primary two-tone | App header, marketing |
| Contained badge | Favicon, app icon |
| Single-color mono | Print, emboss |
| Inverse | Light surfaces, document headers |

### Scale integrity

Test at 16 → 64px. The **filled node** is the only solid element; it stays legible at small sizes. Below 16px, use mono variant only.

### Misuse rules

1. Do not stretch non-uniformly  
2. Do not rotate the mark  
3. Do not recolor outside palette  
4. **Do not pair the mark with a certification seal** — implies third-party accreditation the product does not have  

---

## Wordmark

```
PROPOSALS          (paper / off-white)
AGENT              (slate)
™

Tagline: EVERY NUMBER TRACES   (cyan, small caps, wide tracking)
```

- **PROPOSALS** — `letter-spacing: 0.12em`  
- **AGENT** — mono face, `letter-spacing: 0.18em`  
- Tagline sits beneath lockup, 10–11px equivalent  

---

## Color semantics (non-negotiable)

These colors encode **state**, not decoration.

| Token | Hex | Meaning | Never use for |
|-------|-----|---------|---------------|
| `--cyan-trace` | `#22D3EE` | Provenance, trace links | Nav accents, decoration |
| `--green-compliant` | `#34D399` | Validator returned COMPLIANT | Generic success toasts |
| `--rose-gap` | `#FB7185` | Gap, halt, missing evidence | Warnings unrelated to compliance |
| `--amber-gate` | `#FBBF24` | Human review gate | Progress bars |
| `--slate-paper` | `#E2E8F0` | Primary text on dark |
| `--slate-muted` | `#64748B` | Secondary text |
| `--bg-deep` | `#0F172A` | Console background |

**Breaking color semantics breaks operator trust.** Document this in onboarding.

---

## Art direction

**Provenance lattice** — converging node graph resolving to a single terminal node. Same concept as the mark at composition scale.

Use for:
- Cover art on exported proposals  
- Section breaks in long documents  
- Empty states in console  

---

## Document header (print / PDF)

```
[Mark]  AI Proposals Agent™          Run: run_2026-08-10_001
        EVERY NUMBER TRACES          Scenario: Balanced
─────────────────────────────────────────────────────────────
⚠ HUMAN REVIEW REQUIRED — No generative authority on pricing
```

Amber banner is **non-dismissable** in digital surfaces.

---

## Tagline coupling (deliberate)

> **EVERY NUMBER TRACES**

This tagline is accurate because the run-log schema enforces traceability on `COMPLETED`.  

If a future feature emits model-authored figures without trace refs, **update the tagline before shipping** — the brand promise and schema must stay coupled.

---

## Typography

| Role | Face | Weight |
|------|------|--------|
| UI / wordmark AGENT | `JetBrains Mono`, `IBM Plex Mono`, monospace | 500 |
| Headings | `Inter`, system-ui | 600 |
| Body | `Inter`, system-ui | 400 |
| Trace refs | Monospace | 400 |

---

## UI application checklist

- [ ] Binding numerics: dotted cyan underline, clickable  
- [ ] No editable price fields anywhere  
- [ ] Compliance gaps: rose background + reason + mitigation or italic grey fallback  
- [ ] QA score shows **minimum** dimension with drag indicator  
- [ ] Halt state: dedicated tab, not error toast  
- [ ] Review banner: no dismiss control  

See live reference: [`../ui/operator-console/index.html`](../ui/operator-console/index.html)
