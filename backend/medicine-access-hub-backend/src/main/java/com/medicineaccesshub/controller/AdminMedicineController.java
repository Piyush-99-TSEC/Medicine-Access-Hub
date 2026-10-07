package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.MedicineRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Medicine master data for admins. The ADMIN role rule comes from /api/v1/admin/** in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/admin/medicines")
@RequiredArgsConstructor
public class AdminMedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MedicineResponse>>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Medicines fetched successfully",
                medicineService.adminList(q, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineResponse>> create(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Medicine added",
                medicineService.adminCreate(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Medicine updated",
                medicineService.adminUpdate(id, request)));
    }
}