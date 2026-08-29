const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TABLES = ['leads', 'outreach_logs', 'clients', 'projects', 'invoices', 'proposals', 'diagnostics', 'tasks'];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const table of TABLES) {
    const file = path.join(DATA_DIR, `${table}.json`);
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
  }
}

function readTable(table) {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${table}.json`), 'utf8'));
}

function writeTable(table, rows) {
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, `${table}.json`), JSON.stringify(rows, null, 2));
}

function matchFilter(row, filter) {
  const val = row[filter.col];
  switch (filter.op) {
    case 'eq': return val === filter.val;
    case 'neq': return val !== filter.val;
    case 'lt': return val < filter.val;
    default: return true;
  }
}

function applyFilters(data, filters) {
  return data.filter(row => filters.every(f => matchFilter(row, f)));
}

function createQueryBuilder(table) {
  const state = {
    table,
    filters: [],
    order: null,
    single: false,
    operation: 'select',
    payload: null
  };

  const builder = {
    select() { return builder; },
    eq(col, val) { state.filters.push({ op: 'eq', col, val }); return builder; },
    neq(col, val) { state.filters.push({ op: 'neq', col, val }); return builder; },
    lt(col, val) { state.filters.push({ op: 'lt', col, val }); return builder; },
    order(col, opts = {}) { state.order = { col, ascending: opts.ascending !== false }; return builder; },
    single() { state.single = true; return builder; },
    insert(rows) { state.operation = 'insert'; state.payload = rows; return builder; },
    update(updates) { state.operation = 'update'; state.payload = updates; return builder; },
    delete() { state.operation = 'delete'; return builder; },
    then(resolve, reject) {
      return Promise.resolve().then(() => execute(state)).then(resolve, reject);
    }
  };

  return builder;
}

function execute(state) {
  let data = readTable(state.table);

  if (state.operation === 'insert') {
    const items = Array.isArray(state.payload) ? state.payload : [state.payload];
    data.push(...items);
    writeTable(state.table, data);
    return { data: state.single ? items[0] : items, error: null };
  }

  if (state.operation === 'update') {
    const matches = applyFilters(data, state.filters);
    if (!matches.length) return { data: null, error: { message: 'Not found' } };
    const updated = [];
    data = data.map(row => {
      if (state.filters.every(f => matchFilter(row, f))) {
        const u = { ...row, ...state.payload };
        updated.push(u);
        return u;
      }
      return row;
    });
    writeTable(state.table, data);
    return { data: state.single ? updated[0] : updated, error: null };
  }

  if (state.operation === 'delete') {
    const before = data.length;
    data = data.filter(row => !state.filters.every(f => matchFilter(row, f)));
    writeTable(state.table, data);
    return { data: null, error: before === data.length ? { message: 'Not found' } : null };
  }

  // select
  let result = applyFilters(data, state.filters);
  if (state.order) {
    const { col, ascending } = state.order;
    result.sort((a, b) => {
      const av = a[col], bv = b[col];
      if (av < bv) return ascending ? -1 : 1;
      if (av > bv) return ascending ? 1 : -1;
      return 0;
    });
  }
  if (state.single) {
    if (!result.length) return { data: null, error: { message: 'Not found' } };
    return { data: result[0], error: null };
  }
  return { data: result, error: null };
}

function createLocalStore(extra = {}) {
  return {
    mode: 'local',
    from(table) { return createQueryBuilder(table); },
    ...extra
  };
}

function validateSupabaseConfig(url, key) {
  const issues = [];
  if (!url || !key) return issues;

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url.replace(/\/$/, ''))) {
    issues.push('SUPABASE_URL must look like https://your-project.supabase.co');
  }
  if (key.startsWith('sb_secret')) {
    issues.push('SUPABASE_ANON_KEY is a secret key (sb_secret_...) — use the anon public key from Supabase → Settings → API');
  } else if (!key.startsWith('eyJ')) {
    issues.push('SUPABASE_ANON_KEY should be the anon public JWT (starts with eyJ...)');
  }
  return issues;
}

function createStore(supabase) {
  const local = createLocalStore();
  if (!supabase) {
    console.log('📁 Using local JSON storage (data/) — set SUPABASE_URL for production');
    return local;
  }

  const issues = validateSupabaseConfig(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  if (issues.length) {
    console.warn('⚠️ Supabase misconfigured — using local JSON (data/):\n  • ' + issues.join('\n  • '));
    return createLocalStore({
      mode: 'local-fallback',
      supabaseConfigured: true,
      supabaseConnected: false,
      supabaseIssues: issues
    });
  }

  return {
    mode: 'supabase',
    db: supabase,
    supabaseConfigured: true,
    supabaseConnected: null,
    from: (table) => supabase.from(table)
  };
}

async function verifySupabaseConnection(supabase) {
  const { error } = await supabase.from('leads').select('id').limit(1);
  if (error) throw new Error(error.message || 'Supabase query failed');
}

async function createStoreAsync(supabase) {
  const store = createStore(supabase);
  if (store.mode !== 'supabase') return store;

  try {
    await verifySupabaseConnection(supabase);
    store.supabaseConnected = true;
    console.log('✅ Supabase connected');
    return store;
  } catch (err) {
    const localCount = readTable('leads').length;
    console.warn(`⚠️ Supabase unreachable (${err.message}) — using local JSON with ${localCount} lead(s) in data/`);
    console.warn('   Check SUPABASE_URL in dashboard and run supabase/migration-full.sql if tables are missing.');
    return createLocalStore({
      mode: 'local-fallback',
      supabaseConfigured: true,
      supabaseConnected: false,
      supabaseIssues: [err.message]
    });
  }
}

module.exports = {
  createStore,
  createStoreAsync,
  createLocalStore,
  validateSupabaseConfig,
  verifySupabaseConnection,
  ensureDataDir,
  readTable,
  writeTable,
  DATA_DIR
};
