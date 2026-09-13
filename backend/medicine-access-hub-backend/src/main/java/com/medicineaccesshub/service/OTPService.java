package com.medicineaccesshub.service;

import com.medicineaccesshub.entity.OtpVerification;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.EmailType;

public interface OTPService {

    /**
     * Invalidates any outstanding, unverified OTPs of the given type for the user,
     * generates a fresh 6-digit OTP, and persists it.
     */
    OtpVerification generateAndSaveOtp(User user, EmailType otpType);

    /**
     * Validates the supplied OTP code against the most recent OTP of the given type
     * issued to the user. On success, marks that OTP record as verified.
     */
    boolean verifyOtp(User user, String otp, EmailType otpType);

    boolean isOtpExpired(OtpVerification otpVerification);

    void invalidatePreviousOtps(User user, EmailType otpType);
}
