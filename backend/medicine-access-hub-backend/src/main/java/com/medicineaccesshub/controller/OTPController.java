package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.ResendOtpRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller dedicated to standalone OTP utility operations
 * (currently, resending a registration or login OTP).
 */
@RestController
@RequestMapping("/api/v1/auth/otp")
@RequiredArgsConstructor
public class OTPController {

    private final AuthService authService;

    @PostMapping("/resend")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        String message = authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
