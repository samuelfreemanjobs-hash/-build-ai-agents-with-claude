#!/usr/bin/env python3
"""Deploy website/public/ to Hostinger (public site root).

Uploads to public_html/ — home, waitlist, rubric, cohort, api, assets.

Usage:
  python3 scripts/deploy-public-site.py
  python3 scripts/deploy-public-site.py --sftp
  python3 scripts/deploy-public-site.py --dry-run
"""

from __future__ import annotations

import argparse
import os
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
    print(f"Remote: {REMOTE_BASE}/ on {host}:{port} (FTP)")
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
    domain = os.environ.get("HOSTINGER_DOMAIN") or (
        host.replace("ftp.", "") if host.startswith("ftp.") else "freemanintelligence.com"
    )
    print(f"\nDone. https://{domain}/")


def upload_sftp(host, user, password, port, dry_run):
    import paramiko

    files = [p for p in LOCAL_ROOT.rglob("*") if p.is_file()]
    print(f"Local:  {LOCAL_ROOT} ({len(files)} files)")
    print(f"Remote: {REMOTE_BASE}/ on {host}:{port} (SFTP)")
    if dry_run:
        for f in sorted(files):
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
    domain = os.environ.get("HOSTINGER_DOMAIN") or (
        host.replace("ftp.", "") if host.startswith("ftp.") else "freemanintelligence.com"
    )
    print(f"\nDone. https://{domain}/")


def main():
    parser = argparse.ArgumentParser(description="Deploy public site to Hostinger")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--sftp", action="store_true", help="Use SFTP (port 22) instead of FTP")
    args = parser.parse_args()
    if not LOCAL_ROOT.is_dir():
        print(f"Missing {LOCAL_ROOT}")
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
        print("  1. Confirm credentials in hPanel → Files → FTP Accounts")
        print("  2. Try SFTP: python3 scripts/deploy-public-site.py --sftp")
        print("  3. Or upload manually via File Manager → public_html/")
        sys.exit(1)


if __name__ == "__main__":
    main()
