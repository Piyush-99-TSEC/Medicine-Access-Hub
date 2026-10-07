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
import com.medicineaccesshub.service.PythonService;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import com.medicineaccesshub.dto.request.BulkInventoryRequest;
import com.medicineaccesshub.dto.request.BulkInventoryRowRequest;
import com.medicineaccesshub.dto.response.BulkInventoryResponse;
import com.medicineaccesshub.dto.response.BulkInventoryRowResult;
import com.medicineaccesshub.enums.BulkRowStatus;
import com.medicineaccesshub.repository.ReservationRepository;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
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
    private final PythonService pythonService;
    private final ReservationRepository reservationRepository;


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
        List<PharmacyAvailabilityResponse> rows = inventoryRepository
                .findAvailability(medicineId, lat, lng, radiusKm)
                .stream()
                .map(PharmacyAvailabilityResponse::from)
                .toList();
        return rankWithPython(lat, lng, rows);
    }

    /** Ranks by road distance and weighted score via Python; keeps SQL order if Python is down. */
    private List<PharmacyAvailabilityResponse> rankWithPython(double lat, double lng,
                                                              List<PharmacyAvailabilityResponse> rows) {
        if (rows.isEmpty()) {
            return rows;
        }
        List<Map<String, Object>> payload = rows.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("inventoryId", r.getInventoryId());
            m.put("pharmacyId", r.getPharmacyId());
            m.put("latitude", r.getLatitude());
            m.put("longitude", r.getLongitude());
            m.put("openTime", r.getOpenTime());
            m.put("closeTime", r.getCloseTime());
            m.put("quantity", r.getQuantity());
            m.put("price", r.getPrice());
            m.put("avgRating", r.getAvgRating());
            m.put("distanceKm", r.getDistanceKm());
            return m;
        }).toList();

        Map<Long, PharmacyAvailabilityResponse> byId = rows.stream()
                .collect(Collectors.toMap(PharmacyAvailabilityResponse::getInventoryId, r -> r));

        return pythonService.rank(lat, lng, payload)
                .map(ranked -> ranked.stream().map(m -> {
                    PharmacyAvailabilityResponse r = byId.get(((Number) m.get("inventoryId")).longValue());
                    r.setDistanceKm(((Number) m.get("distanceKm")).doubleValue());
                    r.setScore(((Number) m.get("score")).doubleValue());
                    r.setIsOpen((Boolean) m.get("isOpen"));
                    return r;
                }).toList())
                .orElse(rows);
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

    @Override
    @Transactional
    public BulkInventoryResponse bulkUpdate(Long ownerUserId, BulkInventoryRequest request, boolean dryRun) {
        Pharmacy pharmacy = requireVerifiedPharmacy(ownerUserId);
        List<BulkInventoryRowRequest> rows = request.getRows();

        // One query for the whole catalogue lookup
        Set<String> brands = rows.stream()
                .map(BulkInventoryRowRequest::getBrandName)
                .filter(b -> b != null && !b.isBlank())
                .map(b -> b.trim().toLowerCase())
                .collect(Collectors.toSet());
        Map<String, List<Medicine>> catalogue = brands.isEmpty() ? Map.of()
                : medicineRepository.findByBrandNames(brands).stream()
                .collect(Collectors.groupingBy(m -> m.getBrandName().toLowerCase()));

        // Pass 1: validate every row and match it to a medicine
        Map<Long, Integer> seen = new HashMap<>();
        List<BulkInventoryRowResult> results = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            results.add(evaluateRow(i + 1, rows.get(i), catalogue, seen));
        }

        // Pass 2: two more queries for all matched rows (existing stock, units held for reservations)
        Set<Long> ids = results.stream().map(BulkInventoryRowResult::getMedicineId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Inventory> existing = ids.isEmpty() ? Map.of()
                : inventoryRepository.findByPharmacyAndMedicines(pharmacy.getId(), ids).stream()
                .collect(Collectors.toMap(i -> i.getMedicine().getId(), i -> i));
        Map<Long, Long> held = reservationRepository.findHeldUnits(pharmacy.getId()).stream()
                .collect(Collectors.toMap(ReservationRepository.HeldUnits::getMedicineId,
                        ReservationRepository.HeldUnits::getHeld));

        List<Inventory> toSave = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            BulkInventoryRowResult result = results.get(i);
            Long medicineId = result.getMedicineId();
            if (medicineId == null) {
                continue;
            }
            BulkInventoryRowRequest row = rows.get(i);
            long heldUnits = held.getOrDefault(medicineId, 0L);
            int available = (int) Math.max(0, row.getQuantity() - heldUnits);
            Inventory item = existing.get(medicineId);

            result.setStatus(item == null ? BulkRowStatus.CREATE : BulkRowStatus.UPDATE);
            if (heldUnits > 0) {
                result.setMessage(heldUnits + " unit(s) held for reservations are kept aside");
            }
            if (!dryRun) {
                if (item == null) {
                    item = Inventory.builder().pharmacy(pharmacy)
                            .medicine(medicineRepository.getReferenceById(medicineId)).build();
                }
                item.setQuantity(available);
                item.setPrice(row.getPrice());
                LocalDate expiry = parseDate(row.getExpiryDate());
                if (expiry != null) {
                    item.setExpiryDate(expiry); // blank expiry in the file keeps the existing one
                }
                toSave.add(item);
            }
        }
        inventoryRepository.saveAll(toSave);

        return BulkInventoryResponse.builder()
                .dryRun(dryRun)
                .total(results.size())
                .created(count(results, BulkRowStatus.CREATE))
                .updated(count(results, BulkRowStatus.UPDATE))
                .notInCatalogue(count(results, BulkRowStatus.NOT_IN_CATALOGUE))
                .invalid(count(results, BulkRowStatus.INVALID))
                .rows(results)
                .build();
    }

    /** Validates one row and matches it by brand (+ strength). Valid rows come back as UPDATE with a medicineId. */
    private BulkInventoryRowResult evaluateRow(int number, BulkInventoryRowRequest row,
                                               Map<String, List<Medicine>> catalogue, Map<Long, Integer> seen) {
        BulkInventoryRowResult.BulkInventoryRowResultBuilder out = BulkInventoryRowResult.builder()
                .rowNumber(number).brandName(row.getBrandName())
                .strength(row.getStrength()).quantity(row.getQuantity());

        if (row.getBrandName() == null || row.getBrandName().isBlank()) {
            return invalid(out, "Brand name is missing");
        }
        if (row.getQuantity() == null || row.getQuantity() < 0) {
            return invalid(out, "Quantity must be 0 or more");
        }
        if (row.getPrice() == null || row.getPrice().signum() <= 0) {
            return invalid(out, "Price must be greater than 0");
        }
        try {
            parseDate(row.getExpiryDate());
        } catch (DateTimeParseException e) {
            return invalid(out, "Expiry date must be yyyy-MM-dd");
        }

        List<Medicine> candidates = catalogue.getOrDefault(row.getBrandName().trim().toLowerCase(), List.of());
        if (candidates.isEmpty()) {
            return out.status(BulkRowStatus.NOT_IN_CATALOGUE).message("Not in the catalogue").build();
        }
        Medicine medicine;
        if (candidates.size() == 1) {
            // Catalogue brand names already contain the strength, so a single match is decisive
            medicine = candidates.get(0);
        } else {
            if (row.getStrength() == null || row.getStrength().isBlank()) {
                return invalid(out, "Several strengths exist; add the strength");
            }
            String wanted = normalize(row.getStrength());
            medicine = candidates.stream()
                    .filter(m -> normalize(m.getStrength()).equals(wanted)).findFirst().orElse(null);
            if (medicine == null) {
                return out.status(BulkRowStatus.NOT_IN_CATALOGUE).message("Brand exists but not in this strength").build();
            }
        }
        if (row.getPrice().compareTo(medicine.getMrp()) > 0) {
            return invalid(out, "Price exceeds MRP (₹" + medicine.getMrp() + ")");
        }
        Integer firstRow = seen.putIfAbsent(medicine.getId(), number);
        if (firstRow != null) {
            return invalid(out, "Duplicate of row " + firstRow);
        }
        return out.status(BulkRowStatus.UPDATE).medicineId(medicine.getId()).build();
    }

    private BulkInventoryRowResult invalid(BulkInventoryRowResult.BulkInventoryRowResultBuilder out, String message) {
        return out.status(BulkRowStatus.INVALID).message(message).build();
    }

    private int count(List<BulkInventoryRowResult> results, BulkRowStatus status) {
        return (int) results.stream().filter(r -> r.getStatus() == status).count();
    }

    private LocalDate parseDate(String s) {
        return s == null || s.isBlank() ? null : LocalDate.parse(s.trim());
    }

    private String normalize(String s) {
        return s == null ? "" : s.replaceAll("\\s+", "").replace("/", "+").toLowerCase();
    }
}