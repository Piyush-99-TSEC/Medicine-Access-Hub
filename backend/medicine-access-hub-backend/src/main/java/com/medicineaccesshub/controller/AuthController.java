package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.LoginInitRequest;
import com.medicineaccesshub.dto.request.LoginVerifyRequest;
import com.medicineaccesshub.dto.request.RegisterInitRequest;
import com.medicineaccesshub.dto.request.RegisterVerifyRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.AuthResponse;
import com.medicineaccesshub.dto.response.UserProfileResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller exposing the 2-step registration and 2-factor login endpoints
 * for the Medicine Access Hub platform.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/init")
    public ResponseEntity<ApiResponse<Void>> registerInit(@Valid @RequestBody RegisterInitRequest request) {
        String message = authService.initiateRegistration(request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(message));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> registerVerify(
            @Valid @RequestBody RegisterVerifyRequest request) {
        AuthResponse response = authService.verifyRegistration(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account verified successfully", response));
    }

    @PostMapping("/login/init")
    public ResponseEntity<ApiResponse<Void>> loginInit(@Valid @RequestBody LoginInitRequest request) {
        String message = authService.initiateLogin(request);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PostMapping("/login/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> loginVerify(@Valid @RequestBody LoginVerifyRequest request) {
        AuthResponse response = authService.verifyLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(@AuthenticationPrincipal User user) {
        UserProfileResponse profile = authService.getCurrentUserProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }
}
