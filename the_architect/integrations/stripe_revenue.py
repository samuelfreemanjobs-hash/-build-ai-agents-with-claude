"""Stripe revenue for backend checkout."""

from __future__ import annotations

import base64
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from the_architect.integrations.http import get_json


@dataclass
class StripeResult:
    status: str
    error: str | None
    backend_total: float | None = None
    month_revenue: float | None = None
    transaction_count: int | None = None
    currency: str | None = None
    raw: dict[str, Any] | None = None


def _stripe_headers(secret_key: str) -> dict[str, str]:
    token = base64.b64encode(f"{secret_key}:".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def fetch_stripe(secret_key: str, *, month: str | None = None) -> StripeResult:
    """
    Sum successful charges for the current calendar month (UTC).
    month format: YYYY-MM
    """
    now = datetime.now(timezone.utc)
    if month:
        year, mon = map(int, month.split("-"))
        start = datetime(year, mon, 1, tzinfo=timezone.utc)
    else:
        start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    if start.month == 12:
        end = datetime(start.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(start.year, start.month + 1, 1, tzinfo=timezone.utc)

    params = {
        "limit": "100",
        "created[gte]": str(int(start.timestamp())),
        "created[lt]": str(int(end.timestamp())),
    }
    headers = _stripe_headers(secret_key)

    total_cents = 0
    count = 0
    currency = "usd"
    has_more = True
    starting_after = None

    while has_more:
        q = dict(params)
        if starting_after:
            q["starting_after"] = starting_after
        status, body = get_json("https://api.stripe.com/v1/charges", headers=headers, params=q)
        if status >= 400:
            err = body.get("error", {})
            msg = err.get("message") if isinstance(err, dict) else str(body)
            return StripeResult("error", msg or str(body))

        for charge in body.get("data") or []:
            if not charge.get("paid") or charge.get("refunded"):
                continue
            amount = charge.get("amount") or 0
            total_cents += amount
            count += 1
            currency = charge.get("currency") or currency

        has_more = body.get("has_more", False)
        data = body.get("data") or []
        starting_after = data[-1]["id"] if has_more and data else None

    revenue = round(total_cents / 100.0, 2)
    return StripeResult(
        status="ok",
        error=None,
        backend_total=revenue,
        month_revenue=revenue,
        transaction_count=count,
        currency=currency,
        raw={"month": month or start.strftime("%Y-%m"), "charge_count": count},
    )


def fetch_stripe_from_config(config: dict[str, str | None], *, month: str | None = None) -> StripeResult:
    key = config.get("stripe_secret_key")
    if not key:
        return StripeResult("not_configured", "STRIPE_SECRET_KEY missing")
    return fetch_stripe(key, month=month)
