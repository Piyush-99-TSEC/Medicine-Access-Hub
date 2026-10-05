package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.response.PharmacyAvailabilityResponse;

import java.util.List;

public interface InventoryService {

    List<PharmacyAvailabilityResponse> findAvailability(Long medicineId, double lat, double lng, double radiusKm);
}