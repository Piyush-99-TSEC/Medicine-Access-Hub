package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.request.InventoryAddRequest;
import com.medicineaccesshub.dto.request.InventoryUpdateRequest;
import com.medicineaccesshub.dto.response.*;
import com.medicineaccesshub.dto.request.BulkInventoryRequest;
import com.medicineaccesshub.dto.response.InventoryItemResponse;
import java.util.List;

public interface InventoryService {

    List<PharmacyAvailabilityResponse> findAvailability(Long medicineId, double lat, double lng, double radiusKm);

//    List<InventoryItemResponse> listMyStock(Long ownerUserId);

    PageResponse<InventoryItemResponse> listMyStock(Long ownerUserId, String q, String status, String expiry, int page, int size);

    InventorySummaryResponse getMySummary(Long ownerUserId);

    InventoryItemResponse saveMyStock(Long ownerUserId, InventoryAddRequest request);

    InventoryItemResponse updateMyStock(Long ownerUserId, Long inventoryId, InventoryUpdateRequest request);

    void deleteMyStock(Long ownerUserId, Long inventoryId);

    /** Bulk stock upload. dryRun = preview only, nothing is saved. Quantity is the shelf count. */
    BulkInventoryResponse bulkUpdate(Long ownerUserId, BulkInventoryRequest request, boolean dryRun);
}