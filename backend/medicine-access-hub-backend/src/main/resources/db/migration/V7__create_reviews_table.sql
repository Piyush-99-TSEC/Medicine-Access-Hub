-- V7: Reviews (one per collected reservation, so every review is a verified purchase)

CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    reservation_id  BIGINT NOT NULL UNIQUE REFERENCES reservations(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pharmacy_id     BIGINT NOT NULL REFERENCES pharmacies(pharmacy_id) ON DELETE CASCADE,
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_pharmacy ON reviews(pharmacy_id, created_at DESC);