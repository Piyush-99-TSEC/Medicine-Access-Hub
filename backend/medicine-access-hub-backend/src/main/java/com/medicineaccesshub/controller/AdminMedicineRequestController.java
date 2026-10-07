package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.MedicineRejectRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.MedicineAdditionResponse;
import com.medicineaccesshub.enums.MedicineRequestStatus;
import com.medicineaccesshub.service.MedicineRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Review queue for pharmacy medicine requests. ADMIN role rule comes from /api/v1/admin/** in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/admin/medicine-requests")
@RequiredArgsConstructor
public class AdminMedicineRequestController {

    private final MedicineRequestService medicineRequestService;

    // No status = PENDING
    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineAdditionResponse>>> list(
            @RequestParam(required = false) MedicineRequestStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Requests fetched successfully",
                medicineRequestService.listByStatus(status)));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<MedicineAdditionResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Medicine added to the catalogue",
                medicineRequestService.approve(id)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<MedicineAdditionResponse>> reject(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRejectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Request rejected",
                medicineRequestService.reject(id, request.getReason())));
    }
}