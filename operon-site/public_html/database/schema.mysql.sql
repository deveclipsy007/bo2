CREATE TABLE IF NOT EXISTS diagnostic_leads (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(26) NOT NULL,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(32) NULL,
    company VARCHAR(180) NOT NULL,
    operational_bottleneck TEXT NOT NULL,
    consent TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'new',
    source VARCHAR(64) NOT NULL DEFAULT 'site',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY diagnostic_leads_public_id_unique (public_id),
    KEY diagnostic_leads_status_idx (status),
    KEY diagnostic_leads_created_at_idx (created_at),
    KEY diagnostic_leads_email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
