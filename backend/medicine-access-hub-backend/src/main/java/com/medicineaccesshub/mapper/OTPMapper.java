package com.medicineaccesshub.mapper;

import com.medicineaccesshub.entity.OtpVerification;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class OTPMapper {

    /**
     * Internal-only projection of an {@link OtpVerification} used when handing the
     * generated code off to {@code EmailService}. The raw OTP code is intentionally
     * never exposed through any HTTP response DTO.
     */
    @Getter
    @AllArgsConstructor
    public static class OtpEmailPayload {
        private final String recipientEmail;
        private final String recipientName;
        private final String otpCode;
        private final LocalDateTime expiresAt;
    }

    public OtpEmailPayload toEmailPayload(OtpVerification otpVerification) {
        return new OtpEmailPayload(
                otpVerification.getUser().getEmail(),
                otpVerification.getUser().getName(),
                otpVerification.getOtpCode(),
                otpVerification.getExpiresAt()
        );
    }
}
