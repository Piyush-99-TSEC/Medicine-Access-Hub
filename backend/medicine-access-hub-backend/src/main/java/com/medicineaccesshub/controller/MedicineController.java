package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.dto.response.PharmacyAvailabilityResponse;
import com.medicineaccesshub.service.InventoryService;
import com.medicineaccesshub.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.medicineaccesshub.dto.response.OcrScanResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Public medicine catalogue endpoints (search and details).
 */
@RestController
@RequestMapping("/api/v1/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;
    private final InventoryService inventoryService;


    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MedicineResponse>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Medicines fetched successfully",
                medicineService.search(q, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Medicine fetched successfully",
                medicineService.getById(id)));
    }
    
    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<PharmacyAvailabilityResponse>>> availability(
            @PathVariable Long id,
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5") double radiusKm) {
        return ResponseEntity.ok(ApiResponse.success("Availability fetched successfully",
                inventoryService.findAvailability(id, lat, lng, radiusKm)));
    }

    // Strip / box photo -> top matching medicines for the patient to confirm.
    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OcrScanResponse>> scan(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Strip scanned successfully",
                medicineService.scanStrip(file)));
    }
}