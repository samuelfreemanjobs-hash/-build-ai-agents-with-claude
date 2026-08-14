-- AI Proposals Agent™ — PostgreSQL init schema
-- Mounted into postgres container via docker-compose

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO companies (id, name, industry)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Company', 'Logistics')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS past_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    client_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    services TEXT[],
    value NUMERIC(14, 2),
    won BOOLEAN,
    rfp_text TEXT,
    generated_proposal JSONB,
    run_id VARCHAR(50),
    pricing_hash VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submission_date DATE
);

CREATE TABLE IF NOT EXISTS case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    case_id VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255),
    industry VARCHAR(100) NOT NULL,
    challenge TEXT,
    solution TEXT,
    results JSONB NOT NULL DEFAULT '{}',
    challenge_tags TEXT[],
    solution_tags TEXT[],
    source_ref TEXT,
    relevance_score REAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    cert_type VARCHAR(100) NOT NULL,
    cert_name VARCHAR(255) NOT NULL,
    cert_number VARCHAR(100),
    issued_date DATE,
    expiry_date DATE,
    source_ref TEXT,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS pricing_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    service_type TEXT NOT NULL,
    corridor TEXT,
    unit TEXT NOT NULL,
    unit_cost NUMERIC(14, 4) NOT NULL,
    cost_row_ref TEXT UNIQUE NOT NULL,
    margin_competitive NUMERIC(5, 2) DEFAULT 8,
    margin_balanced NUMERIC(5, 2) DEFAULT 12,
    margin_premium NUMERIC(5, 2) DEFAULT 18,
    volume_tiers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposal_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    job_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    halt_cause VARCHAR(50),
    rfp_text TEXT,
    pricing_tier VARCHAR(50),
    corridor VARCHAR(50),
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_proposals_company ON past_proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_company ON case_studies(company_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_tags ON case_studies USING GIN(challenge_tags);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON proposal_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON proposal_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_pricing_service ON pricing_models(service_type, corridor);

-- Seed DET-WARREN cost rows (matches in-memory KB demo)
INSERT INTO pricing_models (company_id, service_type, corridor, unit, unit_cost, cost_row_ref)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'dedicated_shuttle', 'DET-WARREN', 'annual', 240000.0000, 'pricing_models.row_shuttle_det_warren_annual'),
  ('00000000-0000-0000-0000-000000000001', 'yard_management', 'DET-WARREN', 'annual', 84000.0000, 'pricing_models.row_yard_det_warren_annual'),
  ('00000000-0000-0000-0000-000000000001', 'asn_compliance_desk', 'DET-WARREN', 'annual', 72000.0000, 'pricing_models.row_asn_det_warren_annual')
ON CONFLICT (cost_row_ref) DO NOTHING;

INSERT INTO certifications (company_id, cert_type, cert_name, cert_number, expiry_date, source_ref, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'ISO_9001', 'ISO 9001:2015', 'ISO-12345', '2026-11-30', 'credentials.iso9001', 'active')
ON CONFLICT DO NOTHING;
