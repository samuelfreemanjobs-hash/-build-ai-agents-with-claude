-- Outreach engagement tracking (run after migration-full.sql)

ALTER TABLE outreach_logs ADD COLUMN IF NOT EXISTS resend_message_id TEXT;
ALTER TABLE outreach_logs ADD COLUMN IF NOT EXISTS recipient TEXT;
ALTER TABLE outreach_logs ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0;
ALTER TABLE outreach_logs ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE outreach_logs ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP;
ALTER TABLE outreach_logs ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP;
ALTER TABLE outreach_logs ADD COLUMN IF NOT EXISTS follow_up_paused BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_outreach_resend_id ON outreach_logs(resend_message_id);
CREATE INDEX IF NOT EXISTS idx_outreach_lead ON outreach_logs(lead_id);
