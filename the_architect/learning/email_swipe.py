"""Annotate Kennedy/Kern emails and build swipe files."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

from the_architect.config import AGENT_ROOT
from the_architect.gmail.client import EmailMessage

SWIPES_DIR = AGENT_ROOT / "swipes" / "kennedy-kern"

# Kennedy email psychology patterns
KENNEDY_PATTERNS: list[tuple[str, re.Pattern[str], str, str]] = [
    (
        "Kennedy-PAS",
        re.compile(r"\b(problem|struggle|frustrat|fail|losing|bleeding|costing you)\b", re.I),
        "Problem-agitate opening — names pain before solution",
        "[Pain statement] → [agitate stakes] → [offer as relief]",
    ),
    (
        "Kennedy-Urgency",
        re.compile(r"\b(deadline|expires?|last chance|tonight|midnight|closing|final|hurry)\b", re.I),
        "Hard deadline creates action pressure",
        "[Time limit] + [consequence of missing] + [CTA]",
    ),
    (
        "Kennedy-Proof",
        re.compile(r"\b(\$[\d,]+|\d+%|testimonial|case study|results?|clients?|students?)\b", re.I),
        "Proof stacking — numbers and social evidence",
        "[Specific result] + [who achieved it] + [implication for reader]",
    ),
    (
        "Kennedy-Story",
        re.compile(r"\b(yesterday|last week|I was|she was|he was|one of my|true story)\b", re.I),
        "Story lead — scene before pitch",
        "[Specific moment] + [conflict] + [lesson tease]",
    ),
    (
        "Kennedy-Offer",
        re.compile(r"\b(bonus|guarantee|free|included|value|worth \$|stack)\b", re.I),
        "Irresistible offer architecture — value stack",
        "[Core offer] + [bonuses] + [guarantee] + [price anchor]",
    ),
    (
        "Kennedy-Contrarian",
        re.compile(r"\b(no b\.?s\.?|myth|wrong|lie|gurus?|they don'?t want you to)\b", re.I),
        "Anti-establishment contrarian frame",
        "[Common belief challenged] + [why insiders hide truth]",
    ),
    (
        "Kennedy-CTA",
        re.compile(r"\b(click here|call now|register|reserve|order|reply|go to)\b", re.I),
        "Direct, unambiguous call to action",
        "[Single action] + [what happens next] + [urgency]",
    ),
    (
        "Kennedy-PS",
        re.compile(r"\b(p\.?s\.?|p\.?p\.?s\.?)\b", re.I),
        "P.S. second hook — often strongest urgency or proof",
        "[P.S.] + [new urgency or objection killer]",
    ),
]

# Kern email psychology patterns
KERN_PATTERNS: list[tuple[str, re.Pattern[str], str, str]] = [
    (
        "Kern-Conversation",
        re.compile(r"\b(hey|so |look,|here'?s the thing|real talk|honestly|btw)\b", re.I),
        "Peer conversational tone — across the table, not podium",
        "[Casual opener] + [direct address] + [one idea]",
    ),
    (
        "Kern-ResultsFirst",
        re.compile(r"\b(free|watch this|I put together|here'?s a|no charge|gift|download)\b", re.I),
        "Results in Advance — value before ask",
        "[Deliver value] → [demonstrate capability] → [soft offer]",
    ),
    (
        "Kern-Identity",
        re.compile(r"\b(who you|becoming|type of person|identity|really are|version of you)\b", re.I),
        "Core Identity — speak to who they're becoming",
        "[Identity label] + [behavior gap] + [transformation]",
    ),
    (
        "Kern-Story",
        re.compile(r"\b(crazy thing|funny story|happened to me|I remember|years ago)\b", re.I),
        "Personal story — vulnerability builds trust",
        "[Personal anecdote] + [unexpected turn] + [lesson]",
    ),
    (
        "Kern-FuturePace",
        re.compile(r"\b(imagine|picture this|what if|by next|you'?ll be able to)\b", re.I),
        "Future pacing — reader experiences outcome before buying",
        "[Sensory future scene] + [emotional payoff]",
    ),
    (
        "Kern-SoftSell",
        re.compile(r"\b(no pressure|when you'?re ready|if it makes sense|up to you|no obligation)\b", re.I),
        "Low-pressure close — paradoxically increases trust",
        "[Offer] + [permission to decline] + [door stays open]",
    ),
    (
        "Kern-PatternInterrupt",
        re.compile(r"\b(wait|stop|before you|don'?t do|mistake|warning)\b", re.I),
        "Pattern interrupt — breaks autopilot scroll",
        "[Stop command] + [unexpected claim]",
    ),
    (
        "Kern-Mechanism",
        re.compile(r"\b(the reason|because|how this works|the secret is|distinction)\b", re.I),
        "Mechanism reveal — why this works when other things failed",
        "[Failed alternatives] + [one distinction] + [why it changes everything]",
    ),
]

OPENING_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("Question open", re.compile(r"^(do you|are you|what if|have you|why do)", re.I)),
    ("Story open", re.compile(r"^(yesterday|last |I was|so I|one of)", re.I)),
    ("Direct open", re.compile(r"^(here'?s|this is|I want to|quick)", re.I)),
    ("Contrarian open", re.compile(r"^(wrong|myth|stop|don'?t|never)", re.I)),
    ("News open", re.compile(r"^(new|announcing|breaking|just released)", re.I)),
]


def annotate_email(email: EmailMessage) -> dict[str, Any]:
    text = f"{email.subject}\n\n{email.body_plain}"
    master = email.master

    pattern_sets = KENNEDY_PATTERNS if master == "kennedy" else KERN_PATTERNS
    if master == "unknown":
        pattern_sets = KENNEDY_PATTERNS + KERN_PATTERNS

    patterns: list[str] = []
    why_parts: list[str] = []
    structural_move = ""

    for name, regex, why, move in pattern_sets:
        if regex.search(text):
            patterns.append(name)
            why_parts.append(why)
            if not structural_move:
                structural_move = move

    first_line = email.body_plain.split("\n")[0].strip() if email.body_plain else email.subject
    opening_type = "Statement open"
    for open_name, open_re in OPENING_PATTERNS:
        if open_re.search(first_line):
            opening_type = open_name
            break

    if not patterns:
        patterns = [f"{master.title()}-Email" if master != "unknown" else "Email"]
        why_parts = ["Direct-response email structure"]
        structural_move = "[Hook] + [belief shift] + [CTA]"

    word_count = len(email.body_plain.split())

    return {
        "id": email.id,
        "master": master,
        "subject": email.subject,
        "from": f"{email.from_name} <{email.from_address}>",
        "date": email.date,
        "opening_type": opening_type,
        "patterns": patterns[:6],
        "why_it_works": why_parts[0] if why_parts else "DR email psychology",
        "structural_move": structural_move,
        "word_count": word_count,
        "body_preview": email.body_preview,
        "subject_only_hook": _analyze_subject(email.subject),
    }


def _analyze_subject(subject: str) -> dict[str, str]:
    s = subject.lower()
    traits: list[str] = []
    if "?" in subject:
        traits.append("question")
    if re.search(r"\b(free|new|secret|warning|urgent)\b", s):
        traits.append("curiosity-trigger")
    if re.search(r"\$|\d+%", s):
        traits.append("specificity")
    if re.search(r"\b(you|your)\b", s):
        traits.append("direct-address")
    if re.search(r"^re:", s):
        traits.append("thread-continuity")
    return {"traits": ", ".join(traits) if traits else "straight-benefit"}


def build_swipe_files(emails: list[EmailMessage], *, output_dir: Path | None = None) -> dict[str, Any]:
    out = output_dir or SWIPES_DIR
    out.mkdir(parents=True, exist_ok=True)

    annotated = [annotate_email(e) for e in emails]
    kennedy = [a for a in annotated if a["master"] == "kennedy"]
    kern = [a for a in annotated if a["master"] == "kern"]
    unknown = [a for a in annotated if a["master"] == "unknown"]

    raw_path = out / "raw.json"
    raw_path.write_text(
        json.dumps(
            {
                "ingested_at": _utc_now(),
                "total": len(annotated),
                "kennedy_count": len(kennedy),
                "kern_count": len(kern),
                "unknown_count": len(unknown),
                "emails": annotated,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    swipe_md = _build_swipe_markdown(annotated, kennedy, kern)
    (out / "KENNEDY-KERN-EMAIL-SWIPE.md").write_text(swipe_md, encoding="utf-8")

    patterns_md = _build_patterns_summary(annotated)
    (out / "EMAIL-PATTERNS-LEARNED.md").write_text(patterns_md, encoding="utf-8")

    # Feed top patterns into persistent memory
    _sync_to_memory(annotated)

    return {
        "total": len(annotated),
        "kennedy": len(kennedy),
        "kern": len(kern),
        "unknown": len(unknown),
        "output_dir": str(out.relative_to(AGENT_ROOT.parent.parent)),
        "files": [
            "raw.json",
            "KENNEDY-KERN-EMAIL-SWIPE.md",
            "EMAIL-PATTERNS-LEARNED.md",
        ],
    }


def _build_swipe_markdown(
    all_emails: list[dict[str, Any]],
    kennedy: list[dict[str, Any]],
    kern: list[dict[str, Any]],
) -> str:
    lines = [
        "# Kennedy & Kern Email Swipe File",
        "",
        "One-time Gmail ingestion. **Structure and psychology only — never plagiarize.**",
        "",
        f"**Total emails:** {len(all_emails)} | **Kennedy:** {len(kennedy)} | **Kern:** {len(kern)}",
        "",
        "## How to use",
        "",
        "1. Filter by master (Kennedy vs Kern) or pattern tag.",
        "2. Study **subject line** + **opening type** + **structural move**.",
        "3. Extract the mechanism — write original copy in The Architect voice.",
        "",
        "## Tag legend",
        "",
        "| Tag family | Patterns |",
        "|---|---|",
        "| **Kennedy** | PAS, Urgency, Proof, Story, Offer, Contrarian, CTA, PS |",
        "| **Kern** | Conversation, ResultsFirst, Identity, Story, FuturePace, SoftSell, PatternInterrupt, Mechanism |",
        "",
        "---",
        "",
    ]

    for section_name, section_emails in [("Dan Kennedy", kennedy), ("Frank Kern", kern)]:
        lines.append(f"## {section_name} ({len(section_emails)} emails)\n")
        for i, e in enumerate(section_emails, 1):
            patterns = " + ".join(e["patterns"][:4])
            lines.extend(
                [
                    f"### {section_name[:1]}-{i:03d}: {e['subject']}",
                    f"**Date:** {e['date']} | **From:** {e['from']}",
                    f"**Tags:** GEN-E | PT-{patterns}",
                    f"**Opening:** {e['opening_type']} | **Words:** {e['word_count']}",
                    f"**Subject traits:** {e['subject_only_hook']['traits']}",
                    f"**Why it works:** {e['why_it_works']}",
                    f"**Structural move:** `{e['structural_move']}`",
                    "",
                    "**Subject (hook):**",
                    f"> {e['subject']}",
                    "",
                    "**Opening preview:**",
                    "```",
                    e["body_preview"][:800],
                    "```",
                    "",
                    "---",
                    "",
                ]
            )

    return "\n".join(lines)


def _build_patterns_summary(annotated: list[dict[str, Any]]) -> str:
    pattern_counts: Counter[str] = Counter()
    opening_counts: Counter[str] = Counter()
    subject_traits: Counter[str] = Counter()

    for e in annotated:
        for p in e["patterns"]:
            pattern_counts[p] += 1
        opening_counts[e["opening_type"]] += 1
        for trait in e["subject_only_hook"]["traits"].split(", "):
            if trait:
                subject_traits[trait] += 1

    lines = [
        "# Email Marketing Patterns — Kennedy & Kern Corpus",
        "",
        f"Learned from **{len(annotated)}** inbox emails. Use as craft reference.",
        "",
        "## Pattern frequency",
        "",
        "| Pattern | Count | Master |",
        "|---|---|---|",
    ]

    for pattern, count in pattern_counts.most_common():
        master = "Kennedy" if pattern.startswith("Kennedy") else "Kern" if pattern.startswith("Kern") else "Both"
        lines.append(f"| {pattern} | {count} | {master} |")

    lines.extend(["", "## Opening types", "", "| Opening | Count |", "|---|---|"])
    for opening, count in opening_counts.most_common():
        lines.append(f"| {opening} | {count} |")

    lines.extend(["", "## Subject line traits", "", "| Trait | Count |", "|---|---|"])
    for trait, count in subject_traits.most_common():
        lines.append(f"| {trait} | {count} |")

    lines.extend(
        [
            "",
            "## Kennedy psychology (from corpus)",
            "",
            "- **PAS default** — problem named in subject or first line, agitated, then offer",
            "- **Deadline discipline** — real or campaign deadlines in body and P.S.",
            "- **Proof stacking** — dollars, percentages, client counts before CTA",
            "- **No B.S. contrarian** — anti-guru, anti-fluff positioning",
            "- **P.S. is a second ad** — urgency, bonus, or objection killer",
            "",
            "## Kern psychology (from corpus)",
            "",
            "- **Conversational peer** — Hey, here's the thing, real talk",
            "- **Results in Advance** — free content/tool before pitch",
            "- **Core Identity** — who you're becoming, not fear-based only",
            "- **Soft sell close** — no pressure increases trust and reply rate",
            "- **Future pacing** — imagine/picture before mechanism",
            "",
            "## Cross-master lessons for The Architect",
            "",
            "1. **Subject = headline** — Kennedy: direct benefit/urgency; Kern: curiosity + casual",
            "2. **First line earns the second** — story or pattern interrupt beats throat-clearing",
            "3. **One email, one job** — teach, proof, or sell — rarely all three equally",
            "4. **P.S. matters** — treat as mandatory second hook in long emails",
            "5. **Voice differs, structure overlaps** — both use story, proof, mechanism, CTA",
            "",
        ]
    )

    return "\n".join(lines)


def _sync_to_memory(annotated: list[dict[str, Any]]) -> None:
    """Push email subject lines into Architect memory as learnings."""
    try:
        from the_architect.memory.store import MemoryStore

        store = MemoryStore()
        swipes = [
            {
                "headline": e["subject"],
                "patterns": e["patterns"],
                "why_it_works": e["why_it_works"],
                "structural_move": e["structural_move"],
                "source": f"email_{e['master']}",
            }
            for e in annotated
            if e["subject"] and len(e["subject"]) > 10
        ]
        store.record_swipes(source="kennedy_kern_email", swipes=swipes)
    except Exception:
        pass  # memory sync is best-effort


def _utc_now() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()
