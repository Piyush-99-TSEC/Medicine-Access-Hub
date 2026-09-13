package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.request.LoginInitRequest;
import com.medicineaccesshub.dto.request.LoginVerifyRequest;
import com.medicineaccesshub.dto.request.RegisterInitRequest;
import com.medicineaccesshub.dto.request.RegisterVerifyRequest;
import com.medicineaccesshub.dto.request.ResendOtpRequest;
import com.medicineaccesshub.dto.response.AuthResponse;
import com.medicineaccesshub.dto.response.UserProfileResponse;

/**
 * Service contract for the 2-step registration and 2-factor login flows used
 * across the Medicine Access Hub platform.
 */
public interface AuthService {

    /** Step 1 of registration: validates the email, provisions a pending account, sends OTP. */
    String initiateRegistration(RegisterInitRequest request);

    /** Step 2 of registration: verifies OTP, activates the account, returns a signed JWT. */
    AuthResponse verifyRegistration(RegisterVerifyRequest request);

    /** Step 1 of login: verifies credentials, sends a login OTP. */
    String initiateLogin(LoginInitRequest request);

    /** Step 2 of login: verifies OTP, returns a signed JWT and the user's profile. */
    AuthResponse verifyLogin(LoginVerifyRequest request);

    /** Invalidates the previous OTP for the given purpose and emails a fresh one. */
    String resendOtp(ResendOtpRequest request);

    /** Returns the profile of the currently authenticated (JWT) user. */
    UserProfileResponse getCurrentUserProfile(Long userId);
}
