package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.response.DemandClusterResponse;
import com.medicineaccesshub.entity.Pharmacy;
import com.medicineaccesshub.entity.SearchLog;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.InventoryRepository;
import com.medicineaccesshub.repository.PharmacyRepository;
import com.medicineaccesshub.repository.SearchLogRepository;
import com.medicineaccesshub.service.DemandService;
import com.medicineaccesshub.service.PythonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.medicineaccesshub.entity.DemandCluster;
import com.medicineaccesshub.entity.Medicine;
import com.medicineaccesshub.repository.DemandClusterRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DemandServiceImpl implements DemandService {

    private static final int WINDOW_DAYS = 7;
    private static final double OWNER_RADIUS_KM = 3.0;
    private static final int RETENTION_DAYS = 7;
    private final SearchLogRepository searchLogRepository;
    private final InventoryRepository inventoryRepository;
    private final PharmacyRepository pharmacyRepository;
    private final PythonService pythonService;
    private final DemandClusterRepository demandClusterRepository;

    @Override
    public List<DemandClusterResponse> getAll() {
        return demandClusterRepository.findLatestRun().stream().map(this::toResponse).toList();
    }

    @Override
    public List<DemandClusterResponse> getForOwner(Long ownerUserId) {
        Pharmacy pharmacy = pharmacyRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("You have not registered a pharmacy yet"));
        return demandClusterRepository.findLatestRun().stream()
                .filter(d -> haversineKm(pharmacy.getLatitude(), pharmacy.getLongitude(),
                        d.getCentroidLat(), d.getCentroidLng()) <= OWNER_RADIUS_KM)
                .map(this::toResponse)
                .toList();
    }

    /** Sends the last 7 days of failed searches and the stockists to Python (DBSCAN + A* gap) and saves the result as one run. */
    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public void refresh() {
        LocalDateTime now = LocalDateTime.now();
        List<SearchLog> failed = searchLogRepository.findFailedSince(now.minusDays(WINDOW_DAYS));
        if (failed.isEmpty()) {
            return;
        }
        Map<Long, Medicine> medicines = new HashMap<>();
        List<Map<String, Object>> searches = new ArrayList<>();
        for (SearchLog s : failed) {
            medicines.put(s.getMedicine().getId(), s.getMedicine());
            Map<String, Object> row = new HashMap<>();
            row.put("medicineId", s.getMedicine().getId());
            row.put("userId", s.getUser() == null ? null : s.getUser().getId());
            row.put("lat", s.getLatitude());
            row.put("lng", s.getLongitude());
            searches.add(row);
        }
        List<Map<String, Object>> stockists = inventoryRepository.findStockists(medicines.keySet()).stream()
                .map(i -> Map.<String, Object>of(
                        "medicineId", i.getMedicine().getId(),
                        "pharmacyId", i.getPharmacy().getId(),
                        "lat", i.getPharmacy().getLatitude(),
                        "lng", i.getPharmacy().getLongitude()))
                .toList();

        Map<String, Object> res = pythonService.demandClusters(searches, stockists).orElse(null);
        if (res == null) {
            return;
        }
        List<Map<String, Object>> clusters = (List<Map<String, Object>>) res.get("clusters");
        List<DemandCluster> rows = clusters.stream().map(c -> {
            Long medicineId = ((Number) c.get("medicineId")).longValue();
            Long pharmacyId = c.get("nearestPharmacyId") == null ? null
                    : ((Number) c.get("nearestPharmacyId")).longValue();
            return DemandCluster.builder()
                    .medicine(medicines.get(medicineId))
                    .centroidLat(((Number) c.get("centroidLat")).doubleValue())
                    .centroidLng(((Number) c.get("centroidLng")).doubleValue())
                    .searchCount(((Number) c.get("searchCount")).intValue())
                    .distinctUsers(((Number) c.get("distinctUsers")).intValue())
                    .gapKm(c.get("gapKm") == null ? null : ((Number) c.get("gapKm")).doubleValue())
                    .nearestPharmacy(pharmacyId == null ? null : pharmacyRepository.getReferenceById(pharmacyId))
                    .computedAt(now)
                    .build();
        }).toList();
        demandClusterRepository.saveAll(rows);
        demandClusterRepository.deleteOlderThan(now.minusDays(RETENTION_DAYS));
    }

    private DemandClusterResponse toResponse(DemandCluster d) {
        return DemandClusterResponse.builder()
                .medicineId(d.getMedicine().getId())
                .medicineName(d.getMedicine().getBrandName())
                .centroidLat(d.getCentroidLat())
                .centroidLng(d.getCentroidLng())
                .searchCount(d.getSearchCount())
                .distinctUsers(d.getDistinctUsers())
                .gapKm(d.getGapKm())
                .nearestPharmacyId(d.getNearestPharmacy() == null ? null : d.getNearestPharmacy().getId())
                .build();
    }

    /** Great-circle distance in km. */
    private static double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.pow(Math.sin(dLng / 2), 2);
        return 6371 * 2 * Math.asin(Math.sqrt(a));
    }
}