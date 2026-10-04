-- V3: Create pharmacies table

CREATE TABLE pharmacies (
    pharmacy_id    BIGSERIAL PRIMARY KEY,
    owner_user_id  BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    name           VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(10) NOT NULL,
    gst_no VARCHAR(15),
    licence_no     VARCHAR(50) NOT NULL UNIQUE,
    address        VARCHAR(500) NOT NULL,
    latitude       DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude      DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    open_time      TIME NOT NULL,
    close_time     TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','VERIFIED','REJECTED','BLOCKED')),
    rejection_reason VARCHAR(500),
    avg_rating     NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (avg_rating BETWEEN 0 AND 5),
    is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- owner_user_id is NULL for seeded demo pharmacies; UNIQUE allows many NULLs
-- and limits a real owner to one pharmacy.
CREATE INDEX idx_pharmacies_lat_lng ON pharmacies(latitude, longitude);
CREATE INDEX idx_pharmacies_is_verified ON pharmacies(is_verified);
