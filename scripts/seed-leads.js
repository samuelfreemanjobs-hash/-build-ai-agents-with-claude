#!/usr/bin/env node
/**
 * Seed 10 manufacturing leads into HUNTER OS.
 * Usage: node scripts/seed-leads.js [API_URL]
 */
const fs = require('fs');
const path = require('path');

const API = process.argv[2] || process.env.HUNTER_API_URL || 'http://localhost:3001/api';
const seeds = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/seed-leads.json'), 'utf8'));

async function seed() {
  console.log(`🌱 Seeding ${seeds.length} leads to ${API}...\n`);
  let created = 0, skipped = 0, errors = 0;

  const existingRes = await fetch(`${API}/leads`).catch(() => null);
  const existing = existingRes?.ok ? await existingRes.json() : [];
  const existingNames = new Set(existing.map(l => l.company?.toLowerCase()));

  for (const seed of seeds) {
    if (existingNames.has(seed.company.toLowerCase())) {
      console.log(`  ⏭  ${seed.company} (already exists)`);
      skipped++;
      continue;
    }

    try {
      const res = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seed)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const tier = data.tier || '?';
      const score = data.score || '?';
      console.log(`  ✅ ${data.company} — ${score} (${tier})`);
      created++;
    } catch (e) {
      console.log(`  ❌ ${seed.company}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Done: ${created} created, ${skipped} skipped, ${errors} errors`);
  process.exit(errors > 0 ? 1 : 0);
}

seed();
