#!/usr/bin/env node
/**
 * Validate all HUNTER OS services and integrations.
 * Usage: node scripts/health-check.js [API_URL]
 */
const API = process.argv[2] || process.env.HUNTER_API_URL || 'http://localhost:3001/api';

const checks = [];

async function check(name, fn) {
  try {
    const result = await fn();
    checks.push({ name, status: 'ok', ...result });
    console.log(`  ✅ ${name}`);
  } catch (e) {
    checks.push({ name, status: 'fail', error: e.message });
    console.log(`  ❌ ${name}: ${e.message}`);
  }
}

async function run() {
  console.log(`\n🔍 HUNTER Health Check — ${API}\n`);

  await check('API Online', async () => {
    const res = await fetch(`${API}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { detail: `storage: ${data.services?.storage || (data.services?.supabase ? 'supabase' : 'unknown')}` };
  });

  await check('Service Catalog', async () => {
    const res = await fetch(`${API}/services`);
    const data = await res.json();
    if (!data.services?.length) throw new Error('No services');
    return { detail: `${data.services.length} services` };
  });

  await check('Leads API', async () => {
    const res = await fetch(`${API}/leads`);
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    return { detail: `${data.length} leads` };
  });

  await check('Analytics', async () => {
    const res = await fetch(`${API}/analytics`);
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    return { detail: `pipeline $${(data.pipelineValue / 1000).toFixed(0)}K` };
  });

  await check('Operator Briefing', async () => {
    const res = await fetch(`${API}/operator/daily`);
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    return { detail: `health ${data.metrics?.score}/100` };
  });

  await check('Scoring Engine', async () => {
    const res = await fetch(`${API}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: 'Health Check Test Co', industry: 'CNC Machining', location: 'Detroit, MI' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { detail: `score ${data.score} (${data.tier})` };
  });

  const healthRes = await fetch(`${API}/health`).then(r => r.json()).catch(() => ({}));
  const svc = healthRes.services || {};

  console.log('\n📋 Service Status:');
  const storageLabel = svc.storage === 'local-fallback'
    ? `📁 Local JSON (Supabase misconfigured — ${svc.leadCount ?? '?'} leads in data/)`
    : svc.supabase
      ? `✅ Supabase (${svc.leadCount ?? '?'} leads)`
      : svc.storage === 'local'
        ? `📁 Local JSON (${svc.leadCount ?? '?'} leads)`
        : '❌ Not configured';
  console.log(`  Storage:  ${storageLabel}`);
  if (svc.supabaseIssues?.length) {
    console.log('  Supabase: ⚠️  ' + svc.supabaseIssues[0]);
  }
  console.log(`  Gemini:   ${svc.gemini ? '✅ Connected' : '⚠️  Not set (fallback scoring active)'}`);
  console.log(`  Resend:   ${svc.resend ? '✅ Connected' : '⚠️  Not set (outreach disabled)'}`);
  console.log(`  Slack:    ${svc.slack ? '✅ Connected' : '⚠️  Not set (alerts disabled)'}`);

  const failed = checks.filter(c => c.status === 'fail').length;
  console.log(`\n${failed === 0 ? '✅ All checks passed' : `⚠️  ${failed} check(s) failed`}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
