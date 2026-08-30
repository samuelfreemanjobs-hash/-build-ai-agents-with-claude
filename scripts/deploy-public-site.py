#!/usr/bin/env python3
"""Deploy website/public/ to Hostinger (public site root).

Uploads to public_html/ — home, waitlist, rubric, cohort, api, assets.

Usage:
  python3 scripts/deploy-public-site.py
  python3 scripts/deploy-public-site.py --dry-run
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
LOCAL_ROOT = REPO_ROOT / "website" / "public"
REMOTE_BASE = "public_html"


def load_env():
    try:
        from dotenv import dotenv_values
        env = dotenv_values(REPO_ROOT / ".env")
    except ImportError:
        env = {}
        for line in (REPO_ROOT / ".env").read_text().splitlines():
            if line.strip() and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v.strip()
    required = ["HOSTINGER_SFTP_HOST", "HOSTINGER_SFTP_USER", "HOSTINGER_SFTP_PASSWORD"]
    missing = [k for k in required if not env.get(k) or str(env[k]).startswith("your-")]
    if missing:
        print("Missing .env:", ", ".join(missing))
        sys.exit(1)
    return env


def upload_ftp(host, user, password, port, dry_run):
    import ftplib

    files = [p for p in LOCAL_ROOT.rglob("*") if p.is_file()]
    print(f"Local:  {LOCAL_ROOT} ({len(files)} files)")
    print(f"Remote: {REMOTE_BASE}/ on {host}:{port}")
    if dry_run:
        for f in sorted(files):
            print(f"  would upload: {f.relative_to(LOCAL_ROOT)}")
        return

    ftp = ftplib.FTP()
    ftp.connect(host, port, timeout=60)
    ftp.login(user, password)
    print(f"Connected · PWD: {ftp.pwd()}")

    def cwd_mkdir(parts):
        for part in parts:
            try:
                ftp.cwd(part)
            except ftplib.error_perm:
                ftp.mkd(part)
                ftp.cwd(part)

    for local in sorted(files):
        rel = local.relative_to(LOCAL_ROOT)
        ftp.cwd("/")
        cwd_mkdir(REMOTE_BASE.split("/"))
        if rel.parent != Path("."):
            cwd_mkdir(list(rel.parent.parts))
        with open(local, "rb") as fh:
            ftp.storbinary(f"STOR {rel.name}", fh)
        print(f"  ✓ {rel.as_posix()}")

    ftp.quit()
    print(f"\nDone. https://{host.replace('ftp.', '') if host.startswith('ftp.') else 'freemanintelligence.com'}/")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if not LOCAL_ROOT.is_dir():
        print(f"Missing {LOCAL_ROOT}")
        sys.exit(1)
    env = load_env()
    upload_ftp(
        env["HOSTINGER_SFTP_HOST"],
        env["HOSTINGER_SFTP_USER"],
        env["HOSTINGER_SFTP_PASSWORD"],
        int(env.get("HOSTINGER_SFTP_PORT") or 21),
        args.dry_run,
    )


if __name__ == "__main__":
    main()
