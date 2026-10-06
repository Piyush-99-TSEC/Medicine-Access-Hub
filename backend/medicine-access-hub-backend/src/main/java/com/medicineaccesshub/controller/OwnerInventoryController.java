package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.InventoryAddRequest;
import com.medicineaccesshub.dto.request.InventoryUpdateRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.InventoryItemResponse;
import com.medicineaccesshub.dto.response.InventorySummaryResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stock management for the logged-in pharmacy owner's own pharmacy.
 * Role rule (PHARMACY_OWNER) lives in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/pharmacies/me/inventory")
@RequiredArgsConstructor
public class OwnerInventoryController {

    private final InventoryService inventoryService;

//    @GetMapping
//    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> list(@AuthenticationPrincipal User user) {
//        return ResponseEntity.ok(ApiResponse.success("Inventory fetched successfully",
//                inventoryService.listMyStock(user.getId())));
//    }
//    @GetMapping
//    public ResponseEntity<ApiResponse<PageResponse<InventoryItemResponse>>> list(
//            @AuthenticationPrincipal User user,
//            @RequestParam(required = false) String q,
//            @RequestParam(defaultValue = "ALL") String status,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "20") int size) {
//        return ResponseEntity.ok(ApiResponse.success("Inventory fetched successfully",
//                inventoryService.listMyStock(user.getId(), q, status, page, size)));
//    }
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InventoryItemResponse>>> list(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "ALL") String expiry,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Inventory fetched successfully",
                inventoryService.listMyStock(user.getId(), q, status, expiry, page, size)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<InventorySummaryResponse>> summary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Inventory summary fetched successfully",
                inventoryService.getMySummary(user.getId())));
    }

    // Adds a medicine to stock, or updates it if the pharmacy already stocks it.
    @PostMapping
    public ResponseEntity<ApiResponse<InventoryItemResponse>> save(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody InventoryAddRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock saved successfully",
                inventoryService.saveMyStock(user.getId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody InventoryUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully",
                inventoryService.updateMyStock(user.getId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        inventoryService.deleteMyStock(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Stock removed successfully"));
    }
}