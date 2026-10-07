-- V9: Pharmacy requests for medicines missing from the master catalogue
-- PENDING -> APPROVED (medicine_id set) / REJECTED (rejection_reason set)

CREATE TABLE medicine_requests (
    id               BIGSERIAL PRIMARY KEY,
    pharmacy_id      BIGINT NOT NULL REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
    brand_name       VARCHAR(150) NOT NULL,
    salt_composition VARCHAR(200) NOT NULL,
    strength         VARCHAR(100),
    dosage_form      VARCHAR(50),
    manufacturer     VARCHAR(150),
    pack_size        VARCHAR(100),
    mrp              NUMERIC(10, 2) NOT NULL CHECK (mrp > 0),
    rx_required      BOOLEAN NOT NULL DEFAULT FALSE,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    medicine_id      BIGINT REFERENCES medicines(id) ON DELETE SET NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      TIMESTAMP
);

CREATE INDEX idx_medicine_requests_pharmacy ON medicine_requests(pharmacy_id, created_at DESC);
CREATE INDEX idx_medicine_requests_status ON medicine_requests(status, created_at);