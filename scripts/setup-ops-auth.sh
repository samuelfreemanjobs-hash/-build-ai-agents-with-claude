#!/usr/bin/env bash
# Generate .htpasswd + .htaccess for ops portal password protection
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPS="$ROOT/website/ops"

echo "Freeman Intelligence — Ops portal password setup"
echo ""

read -rp "FTP/hPanel username (e.g. u123456789): " HPANEL_USER
read -rp "Domain folder name [freemanintelligence.com]: " DOMAIN
DOMAIN="${DOMAIN:-freemanintelligence.com}"

# Hostinger typical path — confirm in hPanel File Manager (parent of public_html)
HTPASSWD="/home/${HPANEL_USER}/domains/${DOMAIN}/.htpasswd"

read -rp "Login username for ops portal [samuel]: " AUTH_USER
AUTH_USER="${AUTH_USER:-samuel}"

echo ""
echo "Enter password for '$AUTH_USER' (will not echo):"
htpasswd -c "$OPS/.htpasswd" "$AUTH_USER" 2>/dev/null || {
  echo "htpasswd not found. Install: sudo apt install apache2-utils"
  echo "Or create manually at: https://hostinger.com/tutorials/password-protect-website"
  exit 1
}

cat > "$OPS/.htaccess" << EOF
# Freeman Intelligence internal ops — DO NOT commit .htpasswd
AuthType Basic
AuthName "Freeman Intelligence Ops"
AuthUserFile ${HTPASSWD}
Require valid-user

<IfModule mod_headers.c>
  Header set X-Robots-Tag "noindex, nofollow"
</IfModule>
EOF

echo ""
echo "Created:"
echo "  website/ops/.htpasswd  → upload OUTSIDE public_html"
echo "  website/ops/.htaccess  → upload WITH ops folder"
echo ""
echo "Hostinger upload:"
echo "  1. Upload .htpasswd to: ${HTPASSWD}"
echo "     (same folder as public_html — NOT inside public_html/ops/)"
echo "  2. Upload .htaccess to: public_html/ops/.htaccess"
echo "  3. Upload rest of website/ops/ to public_html/ops/"
echo ""
echo "Easier alternative: hPanel → Advanced → Directory Privacy → /ops/"
