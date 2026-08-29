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
