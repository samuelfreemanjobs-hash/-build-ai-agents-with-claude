#!/usr/bin/env node
/**
 * Import Gemini Spark opportunity cards into HUNTER.
 * Usage: node scripts/import-spark.js [file] [API_URL]
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '../data/gemini-spark-import.json');
const API = (process.argv[3] || process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '');
const secret = process.env.SPARK_WEBHOOK_SECRET || '';

async function importSpark() {
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cards = payload.outreachQueue || payload.opportunities || payload;
  const count = Array.isArray(cards) ? cards.length : 1;

  console.log(`⚡ Importing ${count} Spark card(s) from ${path.basename(file)} → ${API}/api/webhooks/spark\n`);

  const headers = { 'Content-Type': 'application/json' };
  if (secret) headers.Authorization = `Bearer ${secret}`;

  const res = await fetch(`${API}/api/webhooks/spark`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Import failed:', data.error || res.statusText);
    process.exit(1);
  }

  console.log(`✅ Imported: ${data.imported}`);
  console.log(`⏭  Skipped:  ${data.skipped}`);
  if (data.skippedCompanies?.length) {
    console.log(`   (${data.skippedCompanies.join(', ')})`);
  }
  if (data.errors?.length) {
    console.log(`⚠️  Errors:   ${data.errors.join('; ')}`);
  }
  data.leads?.forEach(l => {
    console.log(`   • ${l.tier} ${l.company} (${l.score}) — ${l.matched_service}`);
  });
}

importSpark().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
