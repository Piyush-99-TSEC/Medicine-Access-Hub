package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.response.PharmacyAvailabilityResponse;
import com.medicineaccesshub.exception.BadRequestException;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.InventoryRepository;
import com.medicineaccesshub.repository.MedicineRepository;
import com.medicineaccesshub.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private static final double MAX_RADIUS_KM = 50;

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyAvailabilityResponse> findAvailability(Long medicineId, double lat, double lng, double radiusKm) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new BadRequestException("Invalid latitude or longitude");
        }
        if (radiusKm <= 0 || radiusKm > MAX_RADIUS_KM) {
            throw new BadRequestException("radiusKm must be between 0 and " + (int) MAX_RADIUS_KM);
        }
        if (!medicineRepository.existsById(medicineId)) {
            throw new ResourceNotFoundException("Medicine", "id", medicineId);
        }
        return inventoryRepository.findAvailability(medicineId, lat, lng, radiusKm)
                .stream()
                .map(PharmacyAvailabilityResponse::from)
                .toList();
    }
}