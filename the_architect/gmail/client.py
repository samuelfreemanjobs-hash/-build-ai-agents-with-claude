"""Fetch Gmail messages for Kennedy/Kern swipe ingestion."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any

from googleapiclient.discovery import build

from the_architect.gmail.auth import authenticate
from the_architect.gmail.parser import extract_body, extract_preview

# Gmail search: inbox only, Kennedy + Kern senders
DEFAULT_QUERY = (
    "in:inbox ("
    'from:magneticmarketing.com OR from:gkic.com OR from:nobsinnercircle.com OR '
    "from:dankennedy.com OR from:glazerkennedy.com OR from:kennedyinnercircle.com OR "
    'from:"dan kennedy" OR from:frankkern.com OR from:masscontrol.com OR '
    'from:"frank kern" OR from:kernenterprises.com OR from:automatedinsights.com'
    ")"
)

KENNEDY_DOMAINS = (
    "magneticmarketing",
    "gkic",
    "nobsinnercircle",
    "dankennedy",
    "glazerkennedy",
    "kennedyinnercircle",
    "dan kennedy",
    "dankennedy",
)

KERN_DOMAINS = (
    "frankkern",
    "masscontrol",
    "frank kern",
    "kernenterprises",
    "automatedinsights",
)


@dataclass
class EmailMessage:
    id: str
    thread_id: str
    subject: str
    from_address: str
    from_name: str
    date: str
    body_plain: str
    body_preview: str
    master: str  # "kennedy" | "kern" | "unknown"
    labels: list[str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def classify_master(from_address: str, from_name: str) -> str:
    blob = f"{from_address} {from_name}".lower()
    kennedy_hits = sum(1 for d in KENNEDY_DOMAINS if d in blob)
    kern_hits = sum(1 for d in KERN_DOMAINS if d in blob)
    if kennedy_hits > kern_hits:
        return "kennedy"
    if kern_hits > kennedy_hits:
        return "kern"
    if "kennedy" in blob:
        return "kennedy"
    if "kern" in blob:
        return "kern"
    return "unknown"


def parse_from_header(header: str) -> tuple[str, str]:
    """Return (name, email) from From header."""
    header = header.strip()
    if "<" in header and ">" in header:
        name = header.split("<")[0].strip().strip('"')
        email = header.split("<")[1].split(">")[0].strip()
        return name, email
    return "", header


def fetch_messages(
    *,
    query: str = DEFAULT_QUERY,
    max_results: int | None = None,
    force_auth: bool = False,
) -> list[EmailMessage]:
    creds = authenticate(force=force_auth)
    service = build("gmail", "v1", credentials=creds, cache_discovery=False)

    messages: list[EmailMessage] = []
    page_token: str | None = None

    while True:
        list_kwargs: dict[str, Any] = {
            "userId": "me",
            "q": query,
            "maxResults": 100,
        }
        if page_token:
            list_kwargs["pageToken"] = page_token

        result = service.users().messages().list(**list_kwargs).execute()
        msg_refs = result.get("messages", [])

        if not msg_refs:
            break

        for ref in msg_refs:
            if max_results and len(messages) >= max_results:
                return messages

            msg = (
                service.users()
                .messages()
                .get(userId="me", id=ref["id"], format="full")
                .execute()
            )
            parsed = _parse_message(msg)
            if parsed:
                messages.append(parsed)

        page_token = result.get("nextPageToken")
        if not page_token:
            break

    return messages


def count_messages(*, query: str = DEFAULT_QUERY) -> int:
    creds = authenticate()
    service = build("gmail", "v1", credentials=creds, cache_discovery=False)
    result = service.users().messages().list(userId="me", q=query, maxResults=1).execute()
    return int(result.get("resultSizeEstimate", 0))


def _parse_message(msg: dict[str, Any]) -> EmailMessage | None:
    headers = {h["name"].lower(): h["value"] for h in msg.get("payload", {}).get("headers", [])}
    subject = headers.get("subject", "(no subject)")
    from_raw = headers.get("from", "")
    from_name, from_address = parse_from_header(from_raw)
    date_ms = int(msg.get("internalDate", 0))
    date_str = datetime.fromtimestamp(date_ms / 1000, tz=timezone.utc).strftime("%Y-%m-%d")

    plain, _ = extract_body(msg.get("payload", {}))
    if not plain and not subject:
        return None

    master = classify_master(from_address, from_name)

    return EmailMessage(
        id=msg["id"],
        thread_id=msg.get("threadId", ""),
        subject=subject.strip(),
        from_address=from_address,
        from_name=from_name,
        date=date_str,
        body_plain=plain,
        body_preview=extract_preview(plain),
        master=master,
        labels=msg.get("labelIds", []),
    )
