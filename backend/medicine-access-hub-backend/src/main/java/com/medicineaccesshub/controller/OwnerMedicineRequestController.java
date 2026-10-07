package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.MedicineRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.MedicineAdditionResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.service.MedicineRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Medicine requests of the logged-in owner's pharmacy. Role rule (PHARMACY_OWNER) lives in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/pharmacies/me/medicine-requests")
@RequiredArgsConstructor
public class OwnerMedicineRequestController {

    private final MedicineRequestService medicineRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineAdditionResponse>> submit(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Request sent to admin",
                medicineRequestService.submit(user.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineAdditionResponse>>> listMine(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Requests fetched successfully",
                medicineRequestService.listMine(user.getId())));
    }
}