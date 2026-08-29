#!/bin/bash
# HUNTER OS — One-command setup
set -e

echo "🚀 HUNTER Intelligence OS — Setup"
echo "=================================="

# 1. Dependencies
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# 2. Environment
if [ ! -f .env ]; then
  echo "📝 Creating .env from template..."
  cp .env.example .env
  echo "   ⚠️  Edit .env with your API keys before production use"
else
  echo "✅ .env exists"
fi

# 3. Data directory
mkdir -p data
echo "✅ data/ directory ready"

# 4. Validate n8n workflows
echo "🔍 Validating n8n workflows..."
for f in n8n/*.json; do
  python3 -m json.tool "$f" > /dev/null && echo "   ✅ $(basename $f)" || echo "   ❌ $(basename $f) INVALID"
done

# 5. Start server in background if not running
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "🌐 Starting server..."
  node server.js &
  sleep 2
fi

# 6. Health check
echo ""
node scripts/health-check.js

# 7. Seed leads
echo "🌱 Seeding 10 manufacturing leads..."
curl -s -X POST http://localhost:3001/api/seed | python3 -m json.tool 2>/dev/null || node scripts/seed-leads.js

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "Open these URLs:"
echo "  Landing:   http://localhost:3001/"
echo "  Operator:  http://localhost:3001/operator.html"
echo "  CRM:       http://localhost:3001/hunter_crm.html"
echo ""
echo "Next steps:"
echo "  1. Edit .env with Supabase, Gemini, Resend, Slack keys"
echo "  2. Run supabase/migration-full.sql in Supabase SQL Editor"
echo "  3. Set BOOKING_URL in .env (Cal.com or Calendly)"
echo "  4. Import n8n/*.json workflows"
echo "  5. Send outreach from content/outreach-batch-001.md"
echo "  6. Post LinkedIn content from content/linkedin-post-001.md"
echo ""
