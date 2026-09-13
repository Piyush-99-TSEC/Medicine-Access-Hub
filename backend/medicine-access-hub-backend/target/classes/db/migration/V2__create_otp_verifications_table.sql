-- V2: Create otp_verifications table

CREATE TABLE otp_verifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_code    VARCHAR(10) NOT NULL,
    otp_type    VARCHAR(30) NOT NULL CHECK (otp_type IN ('REGISTRATION_OTP', 'LOGIN_OTP', 'PASSWORD_RESET')),
    expires_at  TIMESTAMP NOT NULL,
    attempts    INT NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_user_id ON otp_verifications(user_id);
CREATE INDEX idx_otp_user_type ON otp_verifications(user_id, otp_type);
CREATE INDEX idx_otp_expiry ON otp_verifications(expires_at);
