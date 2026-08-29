"""Rule-based headline annotation — patterns without LLM cost."""

from __future__ import annotations

import re
from typing import Any


PATTERN_RULES: list[tuple[str, re.Pattern[str], str, str]] = [
    (
        "Cosmo",
        re.compile(r"\b(you|your|women|men|girls?|guys?|smart|sexy|dating|relationship)\b", re.I),
        "Identity + relationship stakes",
        "[Identity] + [behavior/mistake] + [stakes]",
    ),
    (
        "Enq",
        re.compile(r"\b(insider|secret|shocking|revealed|truth|split|scandal|exposed|real reason)\b", re.I),
        "Insider authority + hidden truth + open loop",
        "[Authority] + [shocking claim] + [negation of obvious]",
    ),
    (
        "Buzzhead",
        re.compile(r"\b(\d+|literally|actually|already|can't stop|obsessed|right now|RN)\b", re.I),
        "Curiosity gap + emotional exaggeration + FOMO",
        "[Number/list] + [hyperbolic qualifier] + [timely hook]",
    ),
    (
        "Caples",
        re.compile(r"\b(they laughed|they grinned|how to|do you make|mistakes?|when I)\b", re.I),
        "Story reversal or direct question implicating reader",
        "[Social scene] + [but/when] + [payoff tease]",
    ),
    (
        "Proof",
        re.compile(r"\$[\d,]+|\b\d+%\b|\b\d+ (days?|hours?|minutes?|weeks?|months?)\b", re.I),
        "Specific numbers create credibility and mechanism curiosity",
        "[Specific number] + [disproportionate outcome]",
    ),
    (
        "Contrarian",
        re.compile(r"\b(wrong|myth|lie|nobody|everyone thinks|actually|truth is)\b", re.I),
        "Pattern interrupt against conventional wisdom",
        "[Common belief] + [contrarian reframe]",
    ),
    (
        "Listicle",
        re.compile(r"^\d+\s+|\b\d+ (ways|things|reasons|signs|secrets|tips|mistakes)\b", re.I),
        "Numbered promise of organized, digestible value",
        "[Number] + [things/ways] + [outcome]",
    ),
    (
        "Story",
        re.compile(r"\b(when I|she |he |I was|one day|last night|at \d)\b", re.I),
        "Narrative scene pulls reader into moment",
        "[Scene] + [tension] + [open loop]",
    ),
    (
        "SalesLetter",
        re.compile(
            r"\b(free|guarantee|discover|breakthrough|new|announcing|introducing|limited)\b", re.I
        ),
        "Direct-response offer architecture",
        "[News/benefit] + [mechanism] + [risk reversal or urgency]",
    ),
    (
        "Question",
        re.compile(r"\?|^(do you|are you|what if|why do|how do|can you)\b", re.I),
        "Question engages self-diagnosis",
        "[Question] + [implied gap in reader knowledge]",
    ),
]


def annotate_headline(headline: str, source: str) -> dict[str, Any]:
    """Return annotation dict for a headline."""
    patterns: list[str] = []
    why_parts: list[str] = []
    structural_move = ""

    for name, regex, why, move in PATTERN_RULES:
        if regex.search(headline):
            patterns.append(name)
            why_parts.append(why)
            if not structural_move:
                structural_move = move

    if not patterns:
        patterns = ["Hook"]
        why_parts = ["Opens curiosity loop with concrete specificity"]
        structural_move = "[Specific claim] + [open loop]"

    source_tag = {
        "buzzfeed": "Buzzhead",
        "cosmopolitan": "Cosmo",
        "national_enquirer": "Enq",
        "proven_headlines": "Caples",
        "salesletters": "SalesLetter",
    }.get(source, source)

    if source_tag not in patterns:
        patterns.insert(0, source_tag)

    return {
        "headline": headline.strip(),
        "patterns": patterns[:5],
        "why_it_works": why_parts[0] if why_parts else "Creates unresolved tension",
        "structural_move": structural_move,
        "awareness": _guess_awareness(headline),
        "genre": "H",
    }


def _guess_awareness(headline: str) -> str:
    lower = headline.lower()
    if re.search(r"\b(my|our|this (course|program|book|system))\b", lower):
        return "Pr"
    if re.search(r"\b(how to|guide|tips|ways to|mistakes)\b", lower):
        return "S"
    if re.search(r"\b(why you|struggle|pain|afraid|wrong about)\b", lower):
        return "P"
    if re.search(r"\b(secret|shocking|insider|nobody knows)\b", lower):
        return "U"
    return "P"
