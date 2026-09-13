-- V1: Create users table

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    phone           VARCHAR(15),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'PHARMACY_OWNER', 'ADMIN')),
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);

-- ---------------------------------------------------------------------------
-- Demo seed accounts (development only)
--   patient@medaccesshub.com   / Patient@123
--   pharmacy@medaccesshub.com  / Pharmacy@123
--   admin@medaccesshub.com     / Admin@123
-- Passwords are BCrypt-hashed (strength 12) and all accounts are pre-verified
-- so they can be used directly against the 2FA login flow.
-- ---------------------------------------------------------------------------
INSERT INTO users (name, email, password, phone, role, email_verified, is_deleted)
VALUES
    ('Demo Patient',
     'patient@medaccesshub.com',
     '$2b$12$GWop1I/jaZFRrUugD/9Bn.7GUtwKOidQd7pueFXbltSWx0unX92km',
     '9000000001',
     'PATIENT',
     TRUE,
     FALSE),
    ('Demo Pharmacy Owner',
     'pharmacy@medaccesshub.com',
     '$2b$12$5W90X69lCQXONBMmDZjZA.OayJBZJTWpHrn51dH3iPlDKfAmLKQqe',
     '9000000002',
     'PHARMACY_OWNER',
     TRUE,
     FALSE),
    ('Demo Admin',
     'admin@medaccesshub.com',
     '$2b$12$7syW.SlW98GHSueccocIhOAeOGtUqy9Ajm.a/e9rbK/0/SIB7Hy76',
     '9000000003',
     'ADMIN',
     TRUE,
     FALSE);
