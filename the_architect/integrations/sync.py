"""Merge external sources into ops portal JSON files."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from the_architect.config import REPO_ROOT, get_integration_config
from the_architect.integrations.esp import EspResult, fetch_esp
from the_architect.integrations.kdp import KdpResult, fetch_kdp
from the_architect.integrations.stripe_revenue import StripeResult, fetch_stripe_from_config


OPS_DATA = REPO_ROOT / "website" / "ops" / "data"
INTEGRATIONS_FILE = OPS_DATA / "integrations.json"
METRICS_FILE = OPS_DATA / "ops-metrics.json"


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _load_json(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def _write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _esp_payload(result: EspResult) -> dict[str, Any]:
    return {
        "provider": result.provider,
        "status": result.status,
        "error": result.error,
        "last_sync": _now_iso() if result.status == "ok" else None,
        "metrics": {
            "subscribers": result.subscribers,
            "open_rate": result.open_rate,
            "click_rate": result.click_rate,
            "opens": result.opens,
            "clicks": result.clicks,
        },
    }


def _kdp_payload(result: KdpResult) -> dict[str, Any]:
    return {
        "status": result.status,
        "error": result.error,
        "last_sync": _now_iso() if result.status == "ok" else None,
        "source_file": result.source_file,
        "metrics": {
            "units_sold": result.units_sold,
            "royalties": result.royalties,
            "kenp_read": result.kenp_read,
        },
    }


def _stripe_payload(result: StripeResult) -> dict[str, Any]:
    return {
        "status": result.status,
        "error": result.error,
        "last_sync": _now_iso() if result.status == "ok" else None,
        "metrics": {
            "backend_total": result.backend_total,
            "month_revenue": result.month_revenue,
            "transaction_count": result.transaction_count,
            "currency": result.currency,
        },
    }


def merge_into_metrics(metrics: dict[str, Any], integrations: dict[str, Any]) -> dict[str, Any]:
    """Apply live integration values into ops-metrics actuals and revenue."""
    sources = integrations.get("sources") or {}
    actuals = metrics.setdefault("actuals", {})
    revenue = metrics.setdefault("revenue", {})
    auto = metrics.setdefault("auto_synced", {})

    esp = sources.get("esp") or {}
    esp_m = esp.get("metrics") or {}
    if esp.get("status") == "ok":
        if esp_m.get("subscribers") is not None:
            actuals["subscribers"] = esp_m["subscribers"]
            auto["subscribers"] = "esp"
        if esp_m.get("open_rate") is not None:
            actuals["email_open_rate"] = round(esp_m["open_rate"] * 100, 2)
            auto["email_open_rate"] = "esp"
        if esp_m.get("click_rate") is not None:
            actuals["email_click_rate"] = round(esp_m["click_rate"] * 100, 2)
            auto["email_click_rate"] = "esp"

    kdp = sources.get("kdp") or {}
    kdp_m = kdp.get("metrics") or {}
    if kdp.get("status") == "ok":
        if kdp_m.get("units_sold") is not None:
            actuals["kindle_units"] = kdp_m["units_sold"]
            auto["kindle_units"] = "kdp"
        if kdp_m.get("royalties") is not None:
            revenue["kindle_royalties"] = kdp_m["royalties"]
            auto["kindle_royalties"] = "kdp"

    stripe = sources.get("stripe") or {}
    stripe_m = stripe.get("metrics") or {}
    if stripe.get("status") == "ok":
        if stripe_m.get("backend_total") is not None:
            revenue["backend_total"] = stripe_m["backend_total"]
            auto["backend_total"] = "stripe"
            kindle = revenue.get("kindle_royalties") or 0
            backend = stripe_m["backend_total"] or 0
            total = kindle + backend + (revenue.get("consulting") or 0)
            if total > 0:
                actuals["backend_revenue_pct"] = round((backend / total) * 100, 1)
                auto["backend_revenue_pct"] = "stripe"

    metrics["integrations_updated"] = integrations.get("updated")
    metrics["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return metrics


def sync_all(*, triggered_by: str = "local", dry_run: bool = False) -> dict[str, Any]:
    config = get_integration_config()
    esp_result = fetch_esp(config)
    kdp_result = fetch_kdp(config)
    month = config.get("metrics_month")
    stripe_result = fetch_stripe_from_config(config, month=month)

    integrations = _load_json(
        INTEGRATIONS_FILE,
        {
            "version": 1,
            "updated": None,
            "sources": {},
            "sync_log": [],
        },
    )

    integrations["updated"] = _now_iso()
    integrations["sources"] = {
        "esp": _esp_payload(esp_result),
        "kdp": _kdp_payload(kdp_result),
        "stripe": _stripe_payload(stripe_result),
    }
    integrations.setdefault("sync_log", []).append(
        {
            "at": integrations["updated"],
            "triggered_by": triggered_by,
            "ok": all(
                r.status in ("ok", "not_configured")
                for r in (esp_result, kdp_result, stripe_result)
            ),
        }
    )
    integrations["sync_log"] = integrations["sync_log"][-30:]

    metrics = _load_json(METRICS_FILE, {"version": 1, "actuals": {}, "targets": {}, "revenue": {}})
    metrics = merge_into_metrics(metrics, integrations)

    summary = {
        "updated": integrations["updated"],
        "esp": esp_result.status,
        "kdp": kdp_result.status,
        "stripe": stripe_result.status,
        "dry_run": dry_run,
    }

    if not dry_run:
        _write_json(INTEGRATIONS_FILE, integrations)
        _write_json(METRICS_FILE, metrics)

    return summary
