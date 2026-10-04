package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.PharmacyResponse;
import com.medicineaccesshub.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin-only pharmacy verification endpoints (ADMIN role enforced in SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/admin/pharmacies")
@RequiredArgsConstructor
public class AdminPharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PharmacyResponse>>> list(
            @RequestParam(defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(ApiResponse.success("Pharmacies fetched successfully",
                pharmacyService.listPharmacies(status)));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<PharmacyResponse>> verify(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Pharmacy verified",
                pharmacyService.verifyPharmacy(id)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> reject(@PathVariable Long id) {
        pharmacyService.rejectPharmacy(id);
        return ResponseEntity.ok(ApiResponse.success("Pharmacy registration rejected"));
    }
}
