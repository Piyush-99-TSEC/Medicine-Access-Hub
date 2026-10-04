package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.PharmacyRegisterRequest;
import com.medicineaccesshub.dto.request.PharmacyUpdateRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.PharmacyResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Pharmacy registration and profile endpoints. Role rules live in SecurityConfig:
 * register and /me need PHARMACY_OWNER; GET /{id} is public.
 */
@RestController
@RequestMapping("/api/v1/pharmacies")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<PharmacyResponse>> register(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PharmacyRegisterRequest request) {
        PharmacyResponse response = pharmacyService.registerPharmacy(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pharmacy submitted for admin verification", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PharmacyResponse>> getMine(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Pharmacy fetched successfully",
                pharmacyService.getMyPharmacy(user.getId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<PharmacyResponse>> updateMine(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PharmacyUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Pharmacy updated successfully",
                pharmacyService.updateMyPharmacy(user.getId(), request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PharmacyResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Pharmacy fetched successfully",
                pharmacyService.getVerifiedPharmacy(id)));
    }
}
