"""Production factory state — books, launches, content calendar."""

from __future__ import annotations

import json
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from the_architect.config import FACTORY_DIR, ensure_projects_dir, slugify

DEFAULT_CONFIG: dict[str, Any] = {
    "schedule": {
        "chapters_per_day_min": 1,
        "products_per_week": 1,
        "content_posts_per_day": 3,
        "daily_production_utc": "07:00",
        "weekly_launch_day": "monday",
    },
    "platforms": ["x", "linkedin", "email"],
}

DEFAULT_STATE: dict[str, Any] = {
    "version": 1,
    "active_book": None,
    "active_launch": None,
    "queue": {"books": [], "launches": []},
    "history": {"chapters": [], "launches": [], "content_batches": []},
}


def _utc_today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def ensure_factory_dirs() -> Path:
    FACTORY_DIR.mkdir(parents=True, exist_ok=True)
    ensure_projects_dir()
    return FACTORY_DIR


def config_path() -> Path:
    return FACTORY_DIR / "config.json"


def state_path() -> Path:
    return FACTORY_DIR / "state.json"


def load_config() -> dict[str, Any]:
    ensure_factory_dirs()
    path = config_path()
    if not path.exists():
        path.write_text(json.dumps(DEFAULT_CONFIG, indent=2), encoding="utf-8")
        return dict(DEFAULT_CONFIG)
    return json.loads(path.read_text(encoding="utf-8"))


def load_state() -> dict[str, Any]:
    ensure_factory_dirs()
    path = state_path()
    if not path.exists():
        save_state(dict(DEFAULT_STATE))
        return dict(DEFAULT_STATE)
    return json.loads(path.read_text(encoding="utf-8"))


def save_state(state: dict[str, Any]) -> None:
    ensure_factory_dirs()
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    state_path().write_text(json.dumps(state, indent=2), encoding="utf-8")


def register_book(
    *,
    title: str,
    brief: str,
    total_chapters: int,
    outline_file: str = "outline.md",
) -> dict[str, Any]:
    """Register active Kindle/book project for daily chapter production."""
    slug = slugify(title)
    state = load_state()
    book = {
        "project_slug": slug,
        "title": title,
        "brief": brief,
        "total_chapters": total_chapters,
        "chapters_completed": 0,
        "next_chapter": 1,
        "outline_file": outline_file,
        "last_chapter_date": None,
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }
    state["active_book"] = book
    state["queue"].setdefault("books", []).append({"slug": slug, "title": title, "registered_at": book["registered_at"]})
    save_state(state)
    return book


def register_launch(
    *,
    title: str,
    brief: str,
    price_point: str = "",
    launch_type: str = "info_product",
) -> dict[str, Any]:
    """Register weekly product launch for factory pipeline."""
    slug = slugify(title)
    state = load_state()
    launch = {
        "project_slug": slug,
        "title": title,
        "brief": brief,
        "price_point": price_point,
        "launch_type": launch_type,
        "week_of": _utc_today(),
        "phase": "INTAKE",
        "asset_checklist": _default_launch_checklist(),
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }
    state["active_launch"] = launch
    state["queue"].setdefault("launches", []).append(
        {"slug": slug, "title": title, "week_of": launch["week_of"], "registered_at": launch["registered_at"]}
    )
    save_state(state)
    return launch


def _default_launch_checklist() -> dict[str, bool]:
    return {item: False for item in LAUNCH_ASSET_MANIFEST}


def mark_chapter_complete(chapter_number: int, *, filename: str) -> dict[str, Any]:
    state = load_state()
    book = state.get("active_book")
    if not book:
        raise ValueError("No active book registered")

    today = _utc_today()
    book["chapters_completed"] = max(book.get("chapters_completed", 0), chapter_number)
    book["next_chapter"] = chapter_number + 1
    book["last_chapter_date"] = today

    state["history"].setdefault("chapters", []).append(
        {
            "project_slug": book["project_slug"],
            "chapter": chapter_number,
            "filename": filename,
            "date": today,
        }
    )
    state["active_book"] = book
    save_state(state)
    return book


def mark_launch_asset(asset_key: str) -> dict[str, Any]:
    state = load_state()
    launch = state.get("active_launch")
    if not launch:
        raise ValueError("No active launch registered")
    checklist = launch.setdefault("asset_checklist", _default_launch_checklist())
    if asset_key in checklist:
        checklist[asset_key] = True
    launch["asset_checklist"] = checklist
    state["active_launch"] = launch
    save_state(state)
    return launch


def complete_launch() -> dict[str, Any]:
    state = load_state()
    launch = state.get("active_launch")
    if not launch:
        raise ValueError("No active launch registered")
    launch["completed_at"] = datetime.now(timezone.utc).isoformat()
    state["history"].setdefault("launches", []).append(launch)
    state["active_launch"] = None
    save_state(state)
    return launch


def needs_chapter_today() -> tuple[bool, dict[str, Any] | None]:
    """True if active book exists and today's chapter quota not met."""
    config = load_config()
    min_chapters = int(config.get("schedule", {}).get("chapters_per_day_min", 1))
    state = load_state()
    book = state.get("active_book")
    if not book:
        return False, None
    if book.get("next_chapter", 1) > book.get("total_chapters", 0):
        return False, book  # book complete

    today = _utc_today()
    chapters_today = sum(
        1
        for h in state.get("history", {}).get("chapters", [])
        if h.get("date") == today and h.get("project_slug") == book.get("project_slug")
    )
    return chapters_today < min_chapters, book


def needs_content_today() -> tuple[bool, dict[str, Any] | None]:
    config = load_config()
    posts_per_day = int(config.get("schedule", {}).get("content_posts_per_day", 3))
    state = load_state()
    launch = state.get("active_launch")
    if not launch:
        return False, None

    today = _utc_today()
    batches_today = sum(
        1
        for b in state.get("history", {}).get("content_batches", [])
        if b.get("date") == today and b.get("project_slug") == launch.get("project_slug")
    )
    return batches_today < 1, launch  # at least one content batch per day during active launch


def record_content_batch(project_slug: str, *, count: int, platform: str = "multi") -> None:
    state = load_state()
    state["history"].setdefault("content_batches", []).append(
        {
            "project_slug": project_slug,
            "date": _utc_today(),
            "count": count,
            "platform": platform,
        }
    )
    save_state(state)


def factory_status() -> dict[str, Any]:
    config = load_config()
    state = load_state()
    need_chapter, book = needs_chapter_today()
    need_content, launch = needs_content_today()

    launch_progress = None
    if launch:
        checklist = launch.get("asset_checklist", {})
        done = sum(1 for v in checklist.values() if v)
        total = len(checklist) or 1
        launch_progress = {"done": done, "total": total, "percent": round(100 * done / total, 1)}

    return {
        "config": config,
        "active_book": state.get("active_book"),
        "active_launch": state.get("active_launch"),
        "needs_chapter_today": need_chapter,
        "needs_content_today": need_content,
        "launch_progress": launch_progress,
        "history_counts": {
            "chapters": len(state.get("history", {}).get("chapters", [])),
            "launches": len(state.get("history", {}).get("launches", [])),
            "content_batches": len(state.get("history", {}).get("content_batches", [])),
        },
    }


LAUNCH_ASSET_MANIFEST = [
    "executive_diagnostic",
    "grand_slam_offer",
    "info_product_architecture",
    "lead_magnet",
    "squeeze_page",
    "sales_page",
    "welcome_email_sequence",
    "launch_email_sequence",
    "headline_variants",
    "social_content_batch",
    "ad_scripts",
    "content_calendar_7day",
    "funnel_map",
]
