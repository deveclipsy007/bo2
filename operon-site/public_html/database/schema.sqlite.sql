PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS diagnostic_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT NOT NULL,
    operational_bottleneck TEXT NOT NULL,
    consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'new',
    source TEXT NOT NULL DEFAULT 'site',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS diagnostic_leads_status_idx ON diagnostic_leads(status);
CREATE INDEX IF NOT EXISTS diagnostic_leads_created_at_idx ON diagnostic_leads(created_at);
CREATE INDEX IF NOT EXISTS diagnostic_leads_email_idx ON diagnostic_leads(email);
