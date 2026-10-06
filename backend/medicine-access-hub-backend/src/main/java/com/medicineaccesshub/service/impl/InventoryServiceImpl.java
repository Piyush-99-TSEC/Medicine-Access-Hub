package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.request.InventoryAddRequest;
import com.medicineaccesshub.dto.request.InventoryUpdateRequest;
import com.medicineaccesshub.dto.response.InventoryItemResponse;
import com.medicineaccesshub.dto.response.InventorySummaryResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.dto.response.PharmacyAvailabilityResponse;
import com.medicineaccesshub.entity.Inventory;
import com.medicineaccesshub.entity.Medicine;
import com.medicineaccesshub.entity.Pharmacy;
import com.medicineaccesshub.enums.PharmacyStatus;
import com.medicineaccesshub.exception.BadRequestException;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.InventoryRepository;
import com.medicineaccesshub.repository.MedicineRepository;
import com.medicineaccesshub.repository.PharmacyRepository;
import com.medicineaccesshub.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private static final double MAX_RADIUS_KM = 50;

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;
    private final PharmacyRepository pharmacyRepository;

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

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryItemResponse> listMyStock(Long ownerUserId, String q, String status,
                                                           String expiry, int page, int size) {
        Pharmacy pharmacy = requireVerifiedPharmacy(ownerUserId);

        int low = InventoryItemResponse.LOW_STOCK_THRESHOLD;
        int min = 0;
        int max = Integer.MAX_VALUE;
        switch (status == null ? "ALL" : status.trim().toUpperCase(Locale.ROOT)) {
            case "ALL" -> { }
            case "IN_STOCK" -> min = low + 1;
            case "LOW_STOCK" -> { min = 1; max = low; }
            case "OUT_OF_STOCK" -> max = 0;
            default -> throw new BadRequestException("status must be ALL, IN_STOCK, LOW_STOCK or OUT_OF_STOCK");
        }

        LocalDate today = LocalDate.now();
        boolean filterExpiry = true;
        LocalDate from = today;
        LocalDate to = today;
        switch (expiry == null ? "ALL" : expiry.trim().toUpperCase(Locale.ROOT)) {
            case "ALL" -> { filterExpiry = false; from = LocalDate.of(1900, 1, 1); to = LocalDate.of(9999, 12, 31); }
            case "7" -> to = today.plusDays(7);
            case "30" -> to = today.plusDays(30);
            case "90" -> to = today.plusDays(90);
            case "EXPIRED" -> { from = LocalDate.of(1900, 1, 1); to = today.minusDays(1); }
            default -> throw new BadRequestException("expiry must be ALL, 7, 30, 90 or EXPIRED");
        }

        String text = q == null ? "" : q.trim();
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Page<Inventory> result = inventoryRepository.searchStock(
                pharmacy.getId(), text, min, max, filterExpiry, from, to,
                PageRequest.of(safePage, safeSize));
        return PageResponse.from(result.map(InventoryItemResponse::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public InventorySummaryResponse getMySummary(Long ownerUserId) {
        Pharmacy pharmacy = requireVerifiedPharmacy(ownerUserId);
        Long id = pharmacy.getId();
        LocalDate today = LocalDate.now();
        return InventorySummaryResponse.builder()
                .totalMedicines(inventoryRepository.countByPharmacyId(id))
                .totalUnits(inventoryRepository.sumQuantity(id))
                .lowStock(inventoryRepository.countByPharmacyIdAndQuantityBetween(
                        id, 1, InventoryItemResponse.LOW_STOCK_THRESHOLD))
                .outOfStock(inventoryRepository.countByPharmacyIdAndQuantityBetween(id, 0, 0))
                .expiringSoon(inventoryRepository.countByPharmacyIdAndExpiryDateBetween(
                        id, today, today.plusDays(30)))
                .build();
    }

    @Override
    @Transactional
    public InventoryItemResponse saveMyStock(Long ownerUserId, InventoryAddRequest request) {
        Pharmacy pharmacy = requireVerifiedPharmacy(ownerUserId);
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", request.getMedicineId()));
        checkPriceWithinMrp(request.getPrice(), medicine);

        Inventory item = inventoryRepository
                .findByPharmacyIdAndMedicineId(pharmacy.getId(), medicine.getId())
                .orElseGet(() -> Inventory.builder().pharmacy(pharmacy).medicine(medicine).build());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setExpiryDate(request.getExpiryDate());
        return InventoryItemResponse.fromEntity(inventoryRepository.save(item));
    }

    @Override
    @Transactional
    public InventoryItemResponse updateMyStock(Long ownerUserId, Long inventoryId, InventoryUpdateRequest request) {
        Pharmacy pharmacy = requireVerifiedPharmacy(ownerUserId);
        Inventory item = findOwnedItem(pharmacy, inventoryId);
        checkPriceWithinMrp(request.getPrice(), item.getMedicine());

        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setExpiryDate(request.getExpiryDate());
        return InventoryItemResponse.fromEntity(inventoryRepository.save(item));
    }

    @Override
    @Transactional
    public void deleteMyStock(Long ownerUserId, Long inventoryId) {
        Pharmacy pharmacy = requireVerifiedPharmacy(ownerUserId);
        inventoryRepository.delete(findOwnedItem(pharmacy, inventoryId));
    }

    private Pharmacy requireVerifiedPharmacy(Long ownerUserId) {
        Pharmacy pharmacy = pharmacyRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("You have not registered a pharmacy yet"));
        if (pharmacy.getStatus() != PharmacyStatus.VERIFIED) {
            throw new BadRequestException("Your pharmacy must be verified before you can manage inventory");
        }
        return pharmacy;
    }

    // Another pharmacy's row is reported as "not found", never as "forbidden".
    private Inventory findOwnedItem(Pharmacy pharmacy, Long inventoryId) {
        return inventoryRepository.findByIdAndPharmacyId(inventoryId, pharmacy.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item", "id", inventoryId));
    }

    // Selling above MRP is not allowed in India, so the price is capped at the catalogue MRP.
    private void checkPriceWithinMrp(BigDecimal price, Medicine medicine) {
        if (price.compareTo(medicine.getMrp()) > 0) {
            throw new BadRequestException("Price cannot exceed MRP (₹" + medicine.getMrp() + ")");
        }
    }
}