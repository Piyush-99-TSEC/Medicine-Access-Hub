-- V4: Create medicines table (master catalogue, loaded from dataset/medicines.csv)

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE medicines (
                           id               BIGSERIAL PRIMARY KEY,
                           brand_name       VARCHAR(150) NOT NULL,
                           salt_composition VARCHAR(200) NOT NULL,
                           strength         VARCHAR(100),
                           dosage_form      VARCHAR(50),
                           manufacturer     VARCHAR(150),
                           pack_size        VARCHAR(100),
                           mrp              NUMERIC(10, 2) NOT NULL CHECK (mrp > 0),
                           rx_required      BOOLEAN NOT NULL DEFAULT FALSE
);

-- Trigram indexes make ILIKE / similarity search fast and typo-tolerant
CREATE INDEX idx_medicines_brand_trgm ON medicines USING gin (brand_name gin_trgm_ops);
CREATE INDEX idx_medicines_salt_trgm  ON medicines USING gin (salt_composition gin_trgm_ops);
CREATE INDEX idx_medicines_dosage_form ON medicines(dosage_form);