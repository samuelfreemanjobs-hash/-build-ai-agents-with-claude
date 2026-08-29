-- Supabase Migration for Autonomous HUNTER OS

-- 1. Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  url TEXT,
  location TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  decision_maker TEXT,
  opportunity_title TEXT,
  score INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  tier TEXT CHECK (tier IN ('HOT', 'HIGH', 'MEDIUM', 'WATCH')),
  stage TEXT CHECK (stage IN ('New Opportunity', 'Diagnostic Ready', 'Outreach Sent', 'Meeting Booked', 'Proposal Active', 'Closed Won / Client')),
  estimated_value INTEGER DEFAULT 50000,
  value_range TEXT,
  matched_service TEXT,
  detected_problems TEXT[],
  evidence_signals TEXT,
  give_before_ask TEXT,
  diagnostic TEXT,
  outreach_strategy TEXT CHECK (outreach_strategy IN ('A', 'B', 'C', 'D', 'E', 'F')),
  outreach_subject TEXT,
  outreach_body TEXT,
  notes TEXT,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Outreach Logs
CREATE TABLE outreach_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  strategy TEXT,
  subject TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent', 'opened', 'replied', 'bounced')),
  reply_content TEXT
);

-- 3. Users (for multi-user)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'sales', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_tier ON leads(tier);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_last_activity ON leads(last_activity DESC);

-- 5. RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON outreach_logs
  FOR ALL USING (auth.role() = 'authenticated');
-- HUNTER OS Business Layer — Run AFTER migration.sql

-- Clients (converted from won leads)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  company TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  industry TEXT,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned')),
  retainer_active BOOLEAN DEFAULT false,
  retainer_amount INTEGER DEFAULT 0,
  msa_signed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (delivery engagements)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('scoping', 'active', 'review', 'completed', 'cancelled')),
  value INTEGER NOT NULL,
  start_date DATE,
  target_end_date DATE,
  completed_at TIMESTAMP,
  deliverables JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  service_id TEXT,
  title TEXT,
  content TEXT,
  investment INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined')),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  invoice_number TEXT UNIQUE,
  amount INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Operator tasks (daily action items)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('sales', 'delivery', 'finance', 'marketing', 'ops')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'cancelled')),
  due_date DATE,
  lead_id UUID REFERENCES leads(id),
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Diagnostics (give-before-ask assets)
CREATE TABLE IF NOT EXISTS diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  content TEXT NOT NULL,
  friction_score INTEGER,
  annual_cost_estimate TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_proposals_lead ON proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated" ON proposals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated" ON invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated" ON diagnostics FOR ALL USING (auth.role() = 'authenticated');
-- Combined migration created
