#!/usr/bin/env python3
"""Deploy website/ops/ to Hostinger via FTP/SFTP.

Reads credentials from .env in repo root:
  HOSTINGER_SFTP_HOST, HOSTINGER_SFTP_USER, HOSTINGER_SFTP_PASSWORD, HOSTINGER_SFTP_PORT

Usage:
  python3 scripts/deploy-ops-portal.py
  python3 scripts/deploy-ops-portal.py --dry-run
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
LOCAL_ROOT = REPO_ROOT / "website" / "ops"
REMOTE_BASE = "public_html/ops"


def load_env() -> dict[str, str]:
    try:
        from dotenv import dotenv_values

        env = dotenv_values(REPO_ROOT / ".env")
    except ImportError:
        env = {}
        env_file = REPO_ROOT / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k] = v
    required = ["HOSTINGER_SFTP_HOST", "HOSTINGER_SFTP_USER", "HOSTINGER_SFTP_PASSWORD"]
    missing = [k for k in required if not env.get(k) or env[k].startswith("your-")]
    if missing:
        print("Missing or placeholder .env values:", ", ".join(missing))
        print("Edit .env with Hostinger FTP credentials from hPanel → Files → FTP Accounts")
        sys.exit(1)
    return env  # type: ignore


def upload_ftp(host: str, user: str, password: str, port: int, dry_run: bool) -> None:
    import ftplib

    files = [p for p in LOCAL_ROOT.rglob("*") if p.is_file()]
    if not files:
        print(f"No files in {LOCAL_ROOT}")
        sys.exit(1)

    print(f"Local:  {LOCAL_ROOT} ({len(files)} files)")
    print(f"Remote: {REMOTE_BASE}/ on {host}:{port}")
    if dry_run:
        for f in files:
            print(f"  would upload: {f.relative_to(LOCAL_ROOT)}")
        return

    ftp = ftplib.FTP()
    ftp.connect(host, port, timeout=60)
    ftp.login(user, password)
    print(f"Connected as {user} · PWD: {ftp.pwd()}")

    def cwd_mkdir(parts: list[str]) -> None:
        for part in parts:
            try:
                ftp.cwd(part)
            except ftplib.error_perm:
                ftp.mkd(part)
                ftp.cwd(part)

    def upload_file(local: Path) -> None:
        rel = local.relative_to(LOCAL_ROOT)
        parts = rel.parts
        ftp.cwd("/")
        cwd_mkdir(REMOTE_BASE.split("/"))
        if len(parts) > 1:
            cwd_mkdir(list(parts[:-1]))
        with open(local, "rb") as fh:
            ftp.storbinary(f"STOR {parts[-1]}", fh)
        print(f"  ✓ {rel.as_posix()}")

    for local in sorted(files):
        upload_file(local)

    ftp.quit()
    print(f"\nDone. Open https://{os.environ.get('HOSTINGER_DOMAIN', 'yourdomain.com')}/ops/")


def upload_sftp(host: str, user: str, password: str, port: int, dry_run: bool) -> None:
    import paramiko

    files = [p for p in LOCAL_ROOT.rglob("*") if p.is_file()]
    print(f"Local:  {LOCAL_ROOT} ({len(files)} files)")
    print(f"Remote: {REMOTE_BASE}/ on {host}:{port} (SFTP)")
    if dry_run:
        for f in files:
            print(f"  would upload: {f.relative_to(LOCAL_ROOT)}")
        return

    transport = paramiko.Transport((host, port))
    transport.connect(username=user, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)

    def ensure_remote_dir(remote_dir: str) -> None:
        parts = remote_dir.strip("/").split("/")
        path = ""
        for part in parts:
            path = f"{path}/{part}" if path else part
            try:
                sftp.stat(path)
            except FileNotFoundError:
                sftp.mkdir(path)

    for local in sorted(files):
        rel = local.relative_to(LOCAL_ROOT).as_posix()
        remote = f"{REMOTE_BASE}/{rel}".replace("\\", "/")
        ensure_remote_dir(str(Path(remote).parent).replace("\\", "/"))
        sftp.put(str(local), remote)
        print(f"  ✓ {rel}")

    sftp.close()
    transport.close()
    print(f"\nDone. Open https://{os.environ.get('HOSTINGER_DOMAIN', 'yourdomain.com')}/ops/")


def main() -> None:
    parser = argparse.ArgumentParser(description="Deploy ops portal to Hostinger")
    parser.add_argument("--dry-run", action="store_true", help="List files only")
    parser.add_argument("--sftp", action="store_true", help="Use SFTP (port 22) instead of FTP")
    args = parser.parse_args()

    if not LOCAL_ROOT.is_dir():
        print(f"Missing {LOCAL_ROOT} — run from repo root after sync")
        sys.exit(1)

    env = load_env()
    host = env["HOSTINGER_SFTP_HOST"]
    user = env["HOSTINGER_SFTP_USER"]
    password = env["HOSTINGER_SFTP_PASSWORD"]
    port = int(env.get("HOSTINGER_SFTP_PORT") or (22 if args.sftp else 21))

    os.environ.setdefault("HOSTINGER_DOMAIN", env.get("HOSTINGER_DOMAIN", ""))

    try:
        if args.sftp or port == 22:
            upload_sftp(host, user, password, port, args.dry_run)
        else:
            upload_ftp(host, user, password, port, args.dry_run)
    except Exception as ex:
        print(f"\nUpload failed: {ex}")
        print("\nTroubleshooting:")
        print("  1. Confirm FTP credentials in hPanel → Files → FTP Accounts")
        print("  2. Try SFTP: python3 scripts/deploy-ops-portal.py --sftp")
        print("  3. Or upload manually: FileZilla → host, user, pass → public_html/ops/")
        sys.exit(1)


if __name__ == "__main__":
    main()
