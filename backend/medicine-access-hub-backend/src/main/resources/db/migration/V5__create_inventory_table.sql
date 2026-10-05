-- V5: Pharmacy stock (links pharmacies to the medicines master table)

CREATE TABLE inventory (
                           id           BIGSERIAL PRIMARY KEY,
                           pharmacy_id  BIGINT NOT NULL REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
                           medicine_id  BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
                           quantity     INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
                           price        NUMERIC(10, 2) NOT NULL CHECK (price > 0),
                           expiry_date  DATE,
                           updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           CONSTRAINT uq_inventory_pharmacy_medicine UNIQUE (pharmacy_id, medicine_id)
);

CREATE INDEX idx_inventory_medicine ON inventory(medicine_id);