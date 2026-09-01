---
name: pricing-narrative
description: Writes value justification narrative around pricing figures already produced by pricing_engine.py. Use when assembling the pricing or commercial section of a logistics proposal, or when explaining a rate structure to a prospect. Do not use to calculate, adjust, round, or recompute any price, margin, or total — all figures come from the engine. Do not use when the operator requests a price change; that requires rerunning the engine with changed inputs.
---

# Pricing Narrative

## Hard rules

1. Every numeric in your output appears verbatim in the engine output.
   No exceptions, no derived figures, no approximations.
2. You perform no arithmetic. Not addition, not percentages, not
   comparisons that require computation.
3. If asked to adjust a price, the answer is: pricing regenerates from
   changed inputs. You do not adjust in prose.
4. You do not project savings, ROI, or payback period unless that figure
   is present in the engine output or a source record.

## The forbidden sentence pattern

> "At $396,000 annually, you'll save roughly 12% versus your current spend."

Two violations: `roughly 12%` was computed by you, and `current spend` is a
figure you do not have. This sentence is the exact failure mode this skill
exists to prevent.

## What you actually write

Value justification connects a price to a mechanism, not to a calculation.

> **Balanced scenario — $396,000 annually.**
>
> This structure prices warehousing at a per-pallet-month rate and
> fulfillment at a per-order rate with a fixed monthly platform component.
> The fixed component covers WMS licensing, EDI maintenance, and dedicated
> account management — costs that do not scale with your volume, which
> means your effective per-order cost declines as you grow rather than
> holding flat.
>
> Rates are held firm for the initial twelve-month term. Annual escalation
> thereafter is CPI-indexed and capped, per the terms in Appendix C.

Mechanism, structure, term. No math.

## Presenting three scenarios

Lead with the recommended scenario. Present the others as genuine options
with honest tradeoffs, not as decoys that make the middle look reasonable.

For each: what changes operationally, not just what changes numerically.
Competitive scenario should name what the prospect gives up. Premium should
name what they get. If you cannot name a real operational difference, the
scenarios are not real and that is a problem with the cost model, which you
should flag rather than paper over with adjectives.

## Escalation and surcharge language

Fuel surcharge methodology, accessorial schedules, and escalation clauses
are transcribed from operator source records. You do not draft them, do not
paraphrase them, and do not summarize them into the body text in a way that
conflicts with the appendix.

If an RFP term conflicts with the operator's standard terms, flag it. Do
not resolve it. That is a commercial decision and, frequently, a legal one.
