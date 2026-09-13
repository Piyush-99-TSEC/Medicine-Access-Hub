package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.entity.OtpVerification;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.EmailType;
import com.medicineaccesshub.repository.OtpVerificationRepository;
import com.medicineaccesshub.service.OTPService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OTPServiceImpl implements OTPService {

    private final OtpVerificationRepository otpVerificationRepository;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_VERIFY_ATTEMPTS = 5;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public OtpVerification generateAndSaveOtp(User user, EmailType otpType) {
        invalidatePreviousOtps(user, otpType);

        String otp = generateSixDigitOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        OtpVerification otpVerification = OtpVerification.builder()
                .user(user)
                .otpCode(otp)
                .otpType(otpType)
                .expiresAt(expiryTime)
                .attempts(0)
                .isVerified(false)
                .build();

        OtpVerification saved = otpVerificationRepository.save(otpVerification);
        log.info("Generated {} OTP for user id={} expiring at {}", otpType, user.getId(), expiryTime);
        return saved;
    }

    @Override
    @Transactional
    public boolean verifyOtp(User user, String otp, EmailType otpType) {
        OtpVerification otpVerification = otpVerificationRepository
                .findFirstByUserAndOtpTypeOrderByCreatedAtDesc(user, otpType)
                .orElse(null);

        if (otpVerification == null) {
            log.warn("No OTP found for user id={} type={}", user.getId(), otpType);
            return false;
        }

        if (Boolean.TRUE.equals(otpVerification.getIsVerified())) {
            log.warn("OTP already used for user id={} type={}", user.getId(), otpType);
            return false;
        }

        if (otpVerification.getAttempts() >= MAX_VERIFY_ATTEMPTS) {
            log.warn("Max OTP verification attempts exceeded for user id={} type={}", user.getId(), otpType);
            return false;
        }

        if (isOtpExpired(otpVerification)) {
            log.warn("Expired OTP presented for user id={} type={}", user.getId(), otpType);
            return false;
        }

        if (!otpVerification.getOtpCode().equals(otp)) {
            otpVerification.setAttempts(otpVerification.getAttempts() + 1);
            otpVerificationRepository.save(otpVerification);
            log.warn("Invalid OTP presented for user id={} type={} attempt={}",
                    user.getId(), otpType, otpVerification.getAttempts());
            return false;
        }

        otpVerification.setIsVerified(true);
        otpVerificationRepository.save(otpVerification);
        return true;
    }

    @Override
    public boolean isOtpExpired(OtpVerification otpVerification) {
        return LocalDateTime.now().isAfter(otpVerification.getExpiresAt());
    }

    @Override
    @Transactional
    public void invalidatePreviousOtps(User user, EmailType otpType) {
        otpVerificationRepository.invalidateAllByUserAndOtpType(user, otpType);
    }

    private String generateSixDigitOtp() {
        int number = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(number);
    }
}
