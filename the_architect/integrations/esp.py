"""ESP integrations — ConvertKit and Beehiiv."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from the_architect.integrations.http import get_json


@dataclass
class EspResult:
    provider: str
    status: str
    error: str | None
    subscribers: int | None = None
    open_rate: float | None = None
    click_rate: float | None = None
    opens: int | None = None
    clicks: int | None = None
    raw: dict[str, Any] | None = None


def _pct(num: float | int | None, denom: float | int | None) -> float | None:
    if num is None or denom in (None, 0):
        return None
    return round(float(num) / float(denom), 4)


def fetch_convertkit(api_secret: str) -> EspResult:
    """Pull subscriber count and recent broadcast stats from ConvertKit v3."""
    base = "https://api.convertkit.com/v3"
    status, subs_body = get_json(
        f"{base}/subscribers",
        params={"api_secret": api_secret, "sort_order": "desc"},
    )
    if status >= 400:
        err = subs_body.get("error") or subs_body.get("message") or str(subs_body)
        return EspResult("convertkit", "error", str(err))

    total = subs_body.get("total_subscribers")
    if total is None and isinstance(subs_body.get("total_subscriptions"), int):
        total = subs_body["total_subscriptions"]

    opens = clicks = delivered = None
    open_rate = click_rate = None

    status_b, broadcasts = get_json(f"{base}/broadcasts", params={"api_secret": api_secret})
    if status_b < 400:
        items = broadcasts.get("broadcasts") or []
        if items:
            latest = items[0]
            bid = latest.get("id")
            if bid:
                status_s, stats = get_json(
                    f"{base}/broadcasts/{bid}/stats",
                    params={"api_secret": api_secret},
                )
                if status_s < 400:
                    opens = stats.get("emails_opened") or stats.get("open")
                    clicks = stats.get("emails_clicked") or stats.get("click")
                    delivered = stats.get("recipients") or stats.get("sent")
                    open_rate = _pct(opens, delivered)
                    click_rate = _pct(clicks, delivered)

    return EspResult(
        provider="convertkit",
        status="ok",
        error=None,
        subscribers=int(total) if total is not None else None,
        open_rate=open_rate,
        click_rate=click_rate,
        opens=int(opens) if opens is not None else None,
        clicks=int(clicks) if clicks is not None else None,
        raw={"subscribers_page": subs_body.get("page"), "broadcast_count": len(broadcasts.get("broadcasts") or []) if status_b < 400 else 0},
    )


def fetch_beehiiv(api_key: str, publication_id: str) -> EspResult:
    """Pull subscriber count from Beehiiv v2; opens/clicks from latest post stats."""
    headers = {"Authorization": f"Bearer {api_key}"}
    base = f"https://api.beehiiv.com/v2/publications/{publication_id}"

    status, body = get_json(f"{base}/subscriptions", headers=headers, params={"limit": "1"})
    if status >= 400:
        err = body.get("errors") or body.get("error") or body.get("message") or str(body)
        if isinstance(err, list):
            err = "; ".join(str(e) for e in err)
        return EspResult("beehiiv", "error", str(err))

    total = body.get("total_results") or body.get("total")
    if total is None and isinstance(body.get("data"), list):
        total = len(body["data"])

    opens = clicks = delivered = None
    open_rate = click_rate = None

    status_p, posts = get_json(f"{base}/posts", headers=headers, params={"limit": "1", "status": "confirmed"})
    if status_p < 400:
        post_list = posts.get("data") or []
        if post_list:
            pid = post_list[0].get("id")
            if pid:
                status_s, stats = get_json(f"{base}/posts/{pid}/stats", headers=headers)
                if status_s < 400:
                    data = stats.get("data") or stats
                    opens = data.get("unique_opens") or data.get("opens")
                    clicks = data.get("unique_clicks") or data.get("clicks")
                    delivered = data.get("recipients") or data.get("delivered")
                    open_rate = _pct(opens, delivered)
                    click_rate = _pct(clicks, delivered)

    return EspResult(
        provider="beehiiv",
        status="ok",
        error=None,
        subscribers=int(total) if total is not None else None,
        open_rate=open_rate,
        click_rate=click_rate,
        opens=int(opens) if opens is not None else None,
        clicks=int(clicks) if clicks is not None else None,
        raw={"publication_id": publication_id},
    )


def fetch_esp(config: dict[str, str | None]) -> EspResult:
    provider = (config.get("esp_provider") or "").lower()
    if provider == "convertkit":
        secret = config.get("convertkit_api_secret")
        if not secret:
            return EspResult("convertkit", "not_configured", "CONVERTKIT_API_SECRET missing")
        return fetch_convertkit(secret)
    if provider == "beehiiv":
        key = config.get("beehiiv_api_key")
        pub = config.get("beehiiv_publication_id")
        if not key or not pub:
            return EspResult("beehiiv", "not_configured", "BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID missing")
        return fetch_beehiiv(key, pub)
    return EspResult("none", "not_configured", "ESP_PROVIDER not set (convertkit|beehiiv)")
