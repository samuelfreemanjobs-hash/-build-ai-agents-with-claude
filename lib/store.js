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

function createLocalStore() {
  return {
    mode: 'local',
    from(table) { return createQueryBuilder(table); }
  };
}

function createStore(supabase) {
  if (supabase) return { mode: 'supabase', db: supabase, from: (table) => supabase.from(table) };
  console.log('📁 Using local JSON storage (data/) — set SUPABASE_URL for production');
  return createLocalStore();
}

module.exports = { createStore, ensureDataDir, readTable, writeTable, DATA_DIR };
