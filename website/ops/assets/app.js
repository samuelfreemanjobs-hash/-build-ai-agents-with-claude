/* Freeman Intelligence — Internal Ops Portal */
const DATA = {};
let charts = {};
let editingTaskId = null;

const VIEWS = {
  dashboard: { title: 'Command Center', subtitle: 'Factory · KPIs · funnel health' },
  tasks: { title: 'Task Board', subtitle: 'Marketing & ops execution' },
  analytics: { title: 'Marketing Analytics', subtitle: 'Targets · funnel · revenue' },
  calendar: { title: '12-Month Calendar', subtitle: 'LAUNCH · PRODUCE · OPEN · CAPSTONE' },
  pipeline: { title: 'Product Pipeline', subtitle: 'Catalog · ascension paths' },
  systems: { title: 'Business Systems', subtitle: 'Methodologies · templates · laws' },
};

async function loadJSON(path) {
  const r = await fetch(`data/${path}?t=${Date.now()}`);
  if (!r.ok) throw new Error(`Failed ${path}`);
  return r.json();
}

async function loadAll() {
  const files = [
    'state.json', 'business-plan.json', 'marketing-operations-plan.json',
    'product-catalog.json', 'published-catalog.json', 'ascension-ladder.json',
    'ops-tasks.json', 'ops-metrics.json', 'systems-index.json',
  ];
  await Promise.all(files.map(async (f) => { DATA[f.replace('.json', '').replace(/-/g, '_')] = await loadJSON(f); }));
  // normalize keys
  DATA.state = DATA.state || await loadJSON('state.json');
  DATA.business_plan = await loadJSON('business-plan.json');
  DATA.marketing_ops = await loadJSON('marketing-operations-plan.json');
  DATA.products = await loadJSON('product-catalog.json');
  DATA.published = await loadJSON('published-catalog.json');
  DATA.ascension = await loadJSON('ascension-ladder.json');
  DATA.tasks = await loadJSON('ops-tasks.json');
  DATA.metrics = await loadJSON('ops-metrics.json');
  DATA.systems = await loadJSON('systems-index.json');
}

function pct(actual, target) {
  if (actual == null || !target) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}

function fmt(n) {
  if (n == null) return '—';
  return typeof n === 'number' ? n.toLocaleString() : n;
}

/* ── Dashboard ── */
function renderDashboard() {
  const m = DATA.metrics;
  const bp = DATA.business_plan;
  const mo = DATA.marketing_ops;
  const st = DATA.state;
  const book = st.active_book;

  document.getElementById('currentMonthBadge').textContent = `${bp.current_month_label} · ${bp.mode}`;
  document.getElementById('activeProductBadge').textContent = bp.active_product_id || '—';

  const kpis = [
    { label: 'Subscribers', actual: m.actuals.subscribers, target: m.targets.subscribers },
    { label: 'Waitlist', actual: m.actuals.waitlist, target: m.targets.waitlist },
    { label: 'Chapters', actual: book?.chapters_completed ?? m.actuals.chapters_shipped, target: m.targets.chapters_shipped },
    { label: 'Kindle units', actual: m.actuals.kindle_units, target: m.targets.kindle_units },
    { label: 'Cohort seats', actual: m.actuals.cohort_seats, target: m.targets.cohort_seats },
    { label: 'Tests run', actual: m.actuals.tests_run, target: m.targets.tests_run },
  ];

  document.getElementById('kpiGrid').innerHTML = kpis.map(k => `
    <div class="kpi">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${fmt(k.actual)}</div>
      <div class="kpi-target">Target: ${fmt(k.target)}</div>
      <div class="kpi-bar"><div class="kpi-bar-fill" style="width:${pct(k.actual, k.target)}%"></div></div>
    </div>`).join('');

  const chPct = book ? Math.round((book.chapters_completed / book.total_chapters) * 100) : 0;
  document.getElementById('factoryPanel').innerHTML = book ? `
    <div class="progress-ring">
      <div class="progress-circle" style="--pct:${chPct}%" data-label="${chPct}%"></div>
      <div>
        <strong>${book.title}</strong><br>
        <span style="color:var(--muted);font-size:0.85rem">${book.product_id} · Ch ${book.chapters_completed}/${book.total_chapters}</span><br>
        <span style="color:var(--muted);font-size:0.8rem">Next: Chapter ${book.next_chapter}</span>
      </div>
    </div>` : '<p>No active book</p>';

  const month = mo.months?.find(x => x.month === mo.current_month);
  document.getElementById('monthFocusPanel').innerHTML = month ? `
    <p><strong>Marketing:</strong> ${month.marketing_focus?.replace(/_/g, ' ')}</p>
    <p style="margin-top:0.5rem"><strong>Operations:</strong> ${month.ops_focus?.replace(/_/g, ' ')}</p>
    <p style="margin-top:0.5rem"><strong>Free line:</strong> ${month.free_line?.replace(/_/g, ' ') || '—'}</p>
    <p style="margin-top:0.5rem"><strong>Plan status:</strong> <span class="badge badge-gold">${month.plan_status}</span></p>` : '';

  const rhythm = mo.weekly_rhythm || {};
  document.getElementById('weeklyRhythmPanel').innerHTML = Object.entries(rhythm).map(([w, v]) => `
    <div class="rhythm-week">
      <span class="rhythm-label">${w}</span>
      <span>M: ${v.marketing?.replace(/_/g, ' ')}</span>
      <span>O: ${v.operations?.replace(/_/g, ' ')}</span>
    </div>`).join('');

  const stages = m.funnel_stages || {};
  document.getElementById('funnelHealthPanel').innerHTML = Object.entries(stages).map(([name, s]) => `
    <div class="funnel-score">
      <span>${name}</span>
      <div class="score-dots">${[1,2,3,4,5].map(i => `<span class="score-dot ${i <= (s.score||0) ? 'active' : ''}"></span>`).join('')}</div>
      <span style="color:var(--muted);font-size:0.75rem">${s.notes || ''}</span>
    </div>`).join('');

  const ladder = DATA.ascension.stages || [];
  document.getElementById('ascensionLadder').innerHTML = ladder.map((s, i) =>
    `${i ? '<span class="ladder-arrow">→</span>' : ''}<span class="ladder-step">${s.name}</span>`
  ).join('');
}

/* ── Tasks ── */
function renderTasks() {
  const filter = document.getElementById('taskFilterDomain').value;
  const cols = DATA.tasks.columns || ['backlog', 'this_week', 'in_progress', 'done'];
  const labels = { backlog: 'Backlog', this_week: 'This Week', in_progress: 'In Progress', done: 'Done' };
  let tasks = DATA.tasks.tasks || [];
  if (filter) tasks = tasks.filter(t => t.domain === filter);

  document.getElementById('kanban').innerHTML = cols.map(col => `
    <div class="kanban-col" data-col="${col}">
      <h3>${labels[col] || col} (${tasks.filter(t => t.column === col).length})</h3>
      ${tasks.filter(t => t.column === col).map(t => taskCardHTML(t)).join('')}
    </div>`).join('');

  document.querySelectorAll('.kanban-col').forEach(colEl => {
    colEl.addEventListener('dragover', e => e.preventDefault());
    colEl.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const task = DATA.tasks.tasks.find(t => t.id === id);
      if (task) { task.column = colEl.dataset.col; renderTasks(); }
    });
  });

  document.querySelectorAll('.task-card').forEach(card => {
    card.draggable = true;
    card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', card.dataset.id));
    card.addEventListener('dblclick', () => openTaskDialog(card.dataset.id));
  });
}

function taskCardHTML(t) {
  return `<div class="task-card" data-id="${t.id}">
    <div class="priority priority-${t.priority}">${t.priority}</div>
    <div>${t.title}</div>
    <div class="task-meta">${t.domain} · due ${t.due || '—'} ${t.product_id ? '· ' + t.product_id : ''}</div>
  </div>`;
}

function openTaskDialog(id) {
  editingTaskId = id;
  const form = document.getElementById('taskForm');
  const t = id ? DATA.tasks.tasks.find(x => x.id === id) : null;
  document.getElementById('taskDialogTitle').textContent = t ? 'Edit Task' : 'Add Task';
  form.title.value = t?.title || '';
  form.domain.value = t?.domain || 'marketing';
  form.priority.value = t?.priority || 'medium';
  form.due.value = t?.due || '';
  form.column.value = t?.column || 'backlog';
  document.getElementById('taskDialog').showModal();
}

document.getElementById('btnAddTask')?.addEventListener('click', () => { editingTaskId = null; openTaskDialog(null); });
document.getElementById('btnCancelTask')?.addEventListener('click', () => document.getElementById('taskDialog').close());

document.getElementById('taskForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (editingTaskId) {
    const t = DATA.tasks.tasks.find(x => x.id === editingTaskId);
    Object.assign(t, { title: f.title.value, domain: f.domain.value, priority: f.priority.value, due: f.due.value, column: f.column.value });
  } else {
    DATA.tasks.tasks.push({
      id: 't' + Date.now(),
      title: f.title.value,
      domain: f.domain.value,
      priority: f.priority.value,
      due: f.due.value,
      column: f.column.value,
      month: 'M1',
    });
  }
  document.getElementById('taskDialog').close();
  renderTasks();
});

document.getElementById('taskFilterDomain')?.addEventListener('change', renderTasks);

async function saveJSON(endpoint, payload) {
  const storageKey = `fi-ops-${endpoint}`;
  try {
    const r = await fetch(`api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    const body = await r.json().catch(() => ({}));
    if (r.ok) {
      localStorage.removeItem(storageKey);
      return { ok: true, message: `Saved to server (${body.updated || 'ok'})` };
    }
    const err = body.error || r.statusText;
    localStorage.setItem(storageKey, JSON.stringify(payload));
    return { ok: false, message: `Server error: ${err}. Stored in browser only.` };
  } catch (e) {
    localStorage.setItem(storageKey, JSON.stringify(payload));
    return { ok: false, message: 'Offline — saved in browser only. Deploy PHP on Hostinger for server sync.' };
  }
}

document.getElementById('btnSaveTasks')?.addEventListener('click', async () => {
  DATA.tasks.updated = new Date().toISOString().slice(0, 10);
  const result = await saveJSON('save-tasks.php', DATA.tasks);
  alert(result.message);
});

document.getElementById('btnSaveMetrics')?.addEventListener('click', async () => {
  DATA.metrics.updated = new Date().toISOString().slice(0, 10);
  const result = await saveJSON('save-metrics.php', DATA.metrics);
  alert(result.message);
});

/* ── Analytics ── */
function renderAnalytics() {
  const m = DATA.metrics;
  const keys = Object.keys(m.targets);

  document.getElementById('metricsForm').innerHTML = keys.map(k => `
    <div class="metric-row">
      <label>${k.replace(/_/g, ' ')}</label>
      <input type="number" data-target="${k}" value="${m.targets[k] ?? ''}" placeholder="Target">
      <input type="number" data-actual="${k}" value="${m.actuals[k] ?? ''}" placeholder="Actual">
    </div>`).join('');

  document.querySelectorAll('#metricsForm input[data-target]').forEach(inp => {
    inp.addEventListener('change', () => { m.targets[inp.dataset.target] = +inp.value || null; renderCharts(); });
  });
  document.querySelectorAll('#metricsForm input[data-actual]').forEach(inp => {
    inp.addEventListener('change', () => { m.actuals[inp.dataset.actual] = +inp.value || null; renderCharts(); renderDashboard(); });
  });

  const powers = [
    ['New buyers', '↑', m.actuals.kindle_units],
    ['List growth', '↑', m.actuals.subscribers],
    ['Backend %', '↑', m.actuals.backend_revenue_pct],
    ['Tests run', '≥1/mo', m.actuals.tests_run],
    ['Partner asks', '≥4/mo', m.actuals.partner_asks],
  ];
  document.querySelector('#powersTable tbody').innerHTML = powers.map(([n, d, v]) =>
    `<tr><td>${n}</td><td>${d}</td><td>${fmt(v)}</td></tr>`).join('');

  document.getElementById('revenuePanel').innerHTML = `
    <div class="metric-row"><label>Kindle royalties</label><span>$${m.revenue?.kindle_royalties ?? 0}</span></div>
    <div class="metric-row"><label>Backend</label><span>$${m.revenue?.backend_total ?? 0}</span></div>
    <div class="metric-row"><label>Consulting</label><span>$${m.revenue?.consulting ?? 0}</span></div>`;

  renderCharts();
}

function renderCharts() {
  const m = DATA.metrics;
  Object.values(charts).forEach(c => c.destroy());
  charts = {};

  const labels = ['Subs', 'Waitlist', 'Kindle', 'Cohort', 'Chapters'];
  const keys = ['subscribers', 'waitlist', 'kindle_units', 'cohort_seats', 'chapters_shipped'];
  const targets = keys.map(k => m.targets[k] ?? 0);
  const actuals = keys.map(k => m.actuals[k] ?? 0);

  charts.progress = new Chart(document.getElementById('progressChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Target', data: targets, backgroundColor: '#1e3050' },
        { label: 'Actual', data: actuals, backgroundColor: '#c9a227' },
      ],
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#8b9cb8' } } }, scales: { x: { ticks: { color: '#8b9cb8' } }, y: { ticks: { color: '#8b9cb8' } } } },
  });

  const stageNames = Object.keys(m.funnel_stages || {});
  const stageScores = stageNames.map(k => m.funnel_stages[k].score || 0);
  charts.funnel = new Chart(document.getElementById('funnelChart'), {
    type: 'radar',
    data: {
      labels: stageNames,
      datasets: [{ label: 'Score (1-5)', data: stageScores, backgroundColor: 'rgba(201,162,39,0.2)', borderColor: '#c9a227' }],
    },
    options: { responsive: true, scales: { r: { min: 0, max: 5, ticks: { color: '#8b9cb8' } } }, plugins: { legend: { labels: { color: '#8b9cb8' } } } },
  });

  charts.revenue = new Chart(document.getElementById('revenueChart'), {
    type: 'doughnut',
    data: {
      labels: ['Kindle', 'Backend', 'Consulting'],
      datasets: [{ data: [m.revenue?.kindle_royalties || 0, m.revenue?.backend_total || 0, m.revenue?.consulting || 0], backgroundColor: ['#3b82f6', '#c9a227', '#22c55e'] }],
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#8b9cb8' } } } },
  });
}

document.getElementById('btnSaveMetrics')?.addEventListener('click', async () => {
  DATA.metrics.updated = new Date().toISOString().slice(0, 10);
  const result = await saveJSON('save-metrics.php', DATA.metrics);
  alert(result.message);
});
/* ── Calendar ── */
function renderCalendar() {
  const bp = DATA.business_plan;
  const mo = DATA.marketing_ops;
  document.getElementById('timeline').innerHTML = (bp.schedule || []).map(row => {
    const moRow = mo.months?.find(m => m.month === row.month);
    const current = row.month === bp.current_month;
    return `<div class="timeline-row ${current ? 'current' : ''}">
      <span>${row.label}</span>
      <span class="mode-${row.mode.toLowerCase()}">${row.mode}</span>
      <span>${row.product_id || '—'} · ${moRow?.marketing_focus?.replace(/_/g, ' ') || ''}</span>
      <span style="color:var(--muted)">${row.month}</span>
    </div>`;
  }).join('');
}

/* ── Pipeline ── */
function renderPipeline() {
  const pub = DATA.published.published || [];
  document.getElementById('publishedPanel').innerHTML = pub.map(p => `
    <div class="product-card"><span class="pid">${p.id}</span> ${p.title}<br><small style="color:var(--muted)">${p.status} · ${p.channel}</small></div>`).join('');

  const prods = DATA.products.products || [];
  document.getElementById('pipelinePanel').innerHTML = prods.map(p => `
    <div class="product-card ${p.flagship ? 'flagship' : ''}"><span class="pid">${p.id}</span> ${p.title}</div>`).join('');

  const paths = DATA.ascension.product_paths || [];
  document.querySelector('#pathsTable tbody').innerHTML = paths.map(p =>
    `<tr><td>${p.from}</td><td>${p.to}</td><td>${p.trigger}</td><td style="font-size:0.8rem;color:var(--muted)">${p.copy_angle}</td></tr>`).join('');
}

/* ── Systems ── */
function renderSystems() {
  const sys = DATA.systems;
  document.getElementById('systemsGrid').innerHTML = (sys.categories || []).map(cat => `
    <div class="systems-category">
      <h3>${cat.name}</h3>
      <div class="systems-list">
        ${cat.systems.map(s => `
          <div class="system-card">
            <strong>${s.name}</strong>
            <code>agents/the-architect/${s.file}</code>
            <div class="law">${s.law}</div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  document.getElementById('templatesList').innerHTML = (sys.templates || []).map(t =>
    `<span class="template-chip">${t.name}</span>`).join('');
}

/* ── Navigation ── */
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`view-${name}`)?.classList.add('active');
  document.querySelector(`[data-view="${name}"]`)?.classList.add('active');
  const v = VIEWS[name];
  document.getElementById('viewTitle').textContent = v.title;
  document.getElementById('viewSubtitle').textContent = v.subtitle;
  if (name === 'analytics') renderAnalytics();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.getElementById('btnRefresh')?.addEventListener('click', init);

async function init() {
  try {
    document.getElementById('syncStatus').textContent = 'Loading…';
    await loadAll();
    // Restore unsaved browser copies (if server save failed previously)
    ['save-tasks.php', 'save-metrics.php'].forEach(key => {
      const storageKey = `fi-ops-${key}`;
      const local = localStorage.getItem(storageKey) || localStorage.getItem(key);
      if (local) {
        const data = JSON.parse(local);
        if (key.includes('tasks')) DATA.tasks = data;
        else DATA.metrics = data;
      }
    });
    renderDashboard();
    renderTasks();
    renderCalendar();
    renderPipeline();
    renderSystems();
    document.getElementById('syncStatus').textContent = `Synced · ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    document.getElementById('syncStatus').textContent = 'Error: ' + e.message;
  }
}

init();
