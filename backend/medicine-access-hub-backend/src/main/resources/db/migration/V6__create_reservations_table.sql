-- V6: Medicine reservations (PENDING -> CONFIRMED / REJECTED / CANCELLED / EXPIRED / COLLECTED)

CREATE TABLE reservations (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pharmacy_id  BIGINT NOT NULL REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
    medicine_id  BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    quantity     INT NOT NULL CHECK (quantity > 0),
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    expires_at   TIMESTAMP NOT NULL,
    pickup_by    TIMESTAMP,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_pharmacy_status ON reservations(pharmacy_id, status);