"""Gmail OAuth2 authentication for read-only inbox access."""

from __future__ import annotations

import json
import os
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

from the_architect.config import AGENT_ROOT

# Read-only Gmail access
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

TOKEN_PATH = AGENT_ROOT / ".gmail-token.json"
CREDENTIALS_ENV = "GOOGLE_CREDENTIALS_PATH"
DEFAULT_CREDENTIALS = AGENT_ROOT / "credentials.json"


def get_credentials_path() -> Path:
    env_path = os.environ.get(CREDENTIALS_ENV)
    if env_path:
        return Path(env_path).expanduser()
    if DEFAULT_CREDENTIALS.exists():
        return DEFAULT_CREDENTIALS
    repo_creds = Path(__file__).resolve().parent.parent.parent / "credentials.json"
    if repo_creds.exists():
        return repo_creds
    raise FileNotFoundError(
        "Google OAuth credentials not found. Download credentials.json from Google Cloud Console "
        f"and place at {DEFAULT_CREDENTIALS} or set {CREDENTIALS_ENV}. "
        "See agents/the-architect/GMAIL-INGEST.md for setup."
    )


def authenticate(*, force: bool = False) -> Credentials:
    """Return valid Gmail credentials; run browser OAuth if needed."""
    creds: Credentials | None = None

    if TOKEN_PATH.exists() and not force:
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if creds and creds.valid:
        return creds

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        _save_token(creds)
        return creds

    creds_path = get_credentials_path()
    flow = InstalledAppFlow.from_client_secrets_file(str(creds_path), SCOPES)
    creds = flow.run_local_server(port=0)
    _save_token(creds)
    return creds


def _save_token(creds: Credentials) -> None:
    TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
    TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")


def revoke_token() -> bool:
    if TOKEN_PATH.exists():
        TOKEN_PATH.unlink()
        return True
    return False
