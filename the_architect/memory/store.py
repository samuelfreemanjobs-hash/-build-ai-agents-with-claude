"""JSON-backed persistent memory for headline learnings and agent recall."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from the_architect.config import AGENT_ROOT

MEMORY_DIR = AGENT_ROOT / "memory"
LEARNINGS_DIR = MEMORY_DIR / "learnings"
INDEX_PATH = MEMORY_DIR / "index.json"
PATTERNS_PATH = MEMORY_DIR / "patterns.json"
DIGEST_PATH = MEMORY_DIR / "digest.md"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _headline_hash(text: str) -> str:
    normalized = " ".join(text.lower().split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]


class MemoryStore:
    """Read/write Architect memory: swipes, patterns, daily learnings."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = root or MEMORY_DIR
        self.learnings_dir = self.root / "learnings"
        self.index_path = self.root / "index.json"
        self.patterns_path = self.root / "patterns.json"
        self.digest_path = self.root / "digest.md"

    def ensure_dirs(self) -> None:
        self.learnings_dir.mkdir(parents=True, exist_ok=True)
        if not self.index_path.exists():
            self._write_index(
                {
                    "version": 1,
                    "created_at": _utc_now(),
                    "total_swipes": 0,
                    "total_runs": 0,
                    "sources": {},
                    "seen_hashes": [],
                }
            )
        if not self.patterns_path.exists():
            self.patterns_path.write_text(
                json.dumps({"patterns": {}, "updated_at": _utc_now()}, indent=2),
                encoding="utf-8",
            )
        if not self.digest_path.exists():
            self.digest_path.write_text(
                "# The Architect — Headline Learning Digest\n\n"
                "Auto-updated by daily swipe learning. Extract **structure**, never plagiarize.\n\n",
                encoding="utf-8",
            )

    def _read_index(self) -> dict[str, Any]:
        self.ensure_dirs()
        return json.loads(self.index_path.read_text(encoding="utf-8"))

    def _write_index(self, data: dict[str, Any]) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        data["updated_at"] = _utc_now()
        self.index_path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def _read_patterns(self) -> dict[str, Any]:
        self.ensure_dirs()
        return json.loads(self.patterns_path.read_text(encoding="utf-8"))

    def _write_patterns(self, data: dict[str, Any]) -> None:
        data["updated_at"] = _utc_now()
        self.patterns_path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def is_seen(self, headline: str) -> bool:
        h = _headline_hash(headline)
        index = self._read_index()
        return h in index.get("seen_hashes", [])

    def record_swipes(
        self,
        *,
        source: str,
        swipes: list[dict[str, Any]],
        run_date: str | None = None,
    ) -> dict[str, Any]:
        """Store annotated swipes; dedupe by headline hash."""
        self.ensure_dirs()
        run_date = run_date or _today()
        index = self._read_index()
        seen: set[str] = set(index.get("seen_hashes", []))
        new_swipes: list[dict[str, Any]] = []

        for swipe in swipes:
            headline = swipe.get("headline", "").strip()
            if not headline or len(headline) < 12:
                continue
            h = _headline_hash(headline)
            if h in seen:
                continue
            seen.add(h)
            entry = {
                **swipe,
                "hash": h,
                "source": source,
                "learned_at": _utc_now(),
            }
            new_swipes.append(entry)

        if not new_swipes:
            return {"added": 0, "source": source, "run_date": run_date}

        daily_path = self.learnings_dir / f"{run_date}.json"
        daily: dict[str, Any]
        if daily_path.exists():
            daily = json.loads(daily_path.read_text(encoding="utf-8"))
        else:
            daily = {"date": run_date, "runs": [], "swipes": []}

        daily["swipes"].extend(new_swipes)
        daily_path.write_text(json.dumps(daily, indent=2), encoding="utf-8")

        index["seen_hashes"] = sorted(seen)
        index["total_swipes"] = index.get("total_swipes", 0) + len(new_swipes)
        sources = index.setdefault("sources", {})
        sources[source] = sources.get(source, 0) + len(new_swipes)
        self._write_index(index)

        self._update_patterns(new_swipes)
        self._append_digest(run_date, source, new_swipes)

        return {"added": len(new_swipes), "source": source, "run_date": run_date}

    def record_run(self, summary: dict[str, Any]) -> None:
        """Append metadata for a daily learning run."""
        self.ensure_dirs()
        run_date = summary.get("date") or _today()
        daily_path = self.learnings_dir / f"{run_date}.json"
        daily: dict[str, Any]
        if daily_path.exists():
            daily = json.loads(daily_path.read_text(encoding="utf-8"))
        else:
            daily = {"date": run_date, "runs": [], "swipes": []}

        daily["runs"].append({**summary, "recorded_at": _utc_now()})
        daily_path.write_text(json.dumps(daily, indent=2), encoding="utf-8")

        index = self._read_index()
        index["total_runs"] = index.get("total_runs", 0) + 1
        index["last_run"] = summary
        self._write_index(index)

    def _update_patterns(self, swipes: list[dict[str, Any]]) -> None:
        data = self._read_patterns()
        patterns: dict[str, list[dict[str, str]]] = data.setdefault("patterns", {})

        for swipe in swipes:
            for tag in swipe.get("patterns", []):
                bucket = patterns.setdefault(tag, [])
                bucket.append(
                    {
                        "headline": swipe["headline"],
                        "structural_move": swipe.get("structural_move", ""),
                        "source": swipe.get("source", ""),
                    }
                )
                if len(bucket) > 50:
                    patterns[tag] = bucket[-50:]

        self._write_patterns(data)

    def _append_digest(self, run_date: str, source: str, swipes: list[dict[str, Any]]) -> None:
        lines = [f"\n## {run_date} — {source} ({len(swipes)} new)\n"]
        for s in swipes[:15]:
            patterns = ", ".join(s.get("patterns", []))
            lines.append(f"### {s['headline']}\n")
            lines.append(f"- **Patterns:** {patterns}\n")
            if s.get("why_it_works"):
                lines.append(f"- **Why:** {s['why_it_works']}\n")
            if s.get("structural_move"):
                lines.append(f"- **Move:** `{s['structural_move']}`\n")
            lines.append("")

        with self.digest_path.open("a", encoding="utf-8") as f:
            f.write("\n".join(lines))

    def get_recent_swipes(self, *, limit: int = 30, source: str | None = None) -> list[dict[str, Any]]:
        self.ensure_dirs()
        files = sorted(self.learnings_dir.glob("*.json"), reverse=True)
        results: list[dict[str, Any]] = []

        for path in files:
            daily = json.loads(path.read_text(encoding="utf-8"))
            for swipe in reversed(daily.get("swipes", [])):
                if source and swipe.get("source") != source:
                    continue
                results.append(swipe)
                if len(results) >= limit:
                    return results
        return results

    def get_context_for_prompt(self, *, limit: int = 20) -> str:
        """Compact memory block injected into agent system prompt."""
        self.ensure_dirs()
        recent = self.get_recent_swipes(limit=limit)
        if not recent:
            return ""

        lines = [
            "## Recent headline learnings (from daily swipe file)\n",
            "Use for **structure and psychology** — never copy verbatim.\n",
        ]
        for s in recent:
            patterns = ", ".join(s.get("patterns", [])[:3])
            lines.append(f"- [{s.get('source', '?')}] {s['headline']}")
            if patterns:
                lines.append(f"  Patterns: {patterns} | Move: {s.get('structural_move', '—')}")
        return "\n".join(lines)

    def get_stats(self) -> dict[str, Any]:
        index = self._read_index()
        return {
            "total_swipes": index.get("total_swipes", 0),
            "total_runs": index.get("total_runs", 0),
            "sources": index.get("sources", {}),
            "last_run": index.get("last_run"),
            "digest_path": str(self.digest_path.relative_to(AGENT_ROOT.parent.parent)),
        }

    def record_insight(self, *, category: str, insight: str, project_slug: str | None = None) -> None:
        """Store a craft insight from a completed project (continuous improvement)."""
        self.ensure_dirs()
        insights_path = self.root / "insights.jsonl"
        entry = {
            "category": category,
            "insight": insight,
            "project_slug": project_slug,
            "recorded_at": _utc_now(),
        }
        with insights_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
