package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.response.AdminStatsResponse;
import com.medicineaccesshub.enums.PharmacyStatus;
import com.medicineaccesshub.enums.ReservationStatus;
import com.medicineaccesshub.repository.InventoryRepository;
import com.medicineaccesshub.repository.MedicineRepository;
import com.medicineaccesshub.repository.PharmacyRepository;
import com.medicineaccesshub.repository.ReservationRepository;
import com.medicineaccesshub.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;
    private final ReservationRepository reservationRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long verified = pharmacyRepository.countByStatus(PharmacyStatus.VERIFIED);
        long pending = pharmacyRepository.countByStatus(PharmacyStatus.PENDING);
        long total = pharmacyRepository.count();
        return AdminStatsResponse.builder()
                .totalPharmacies(total)
                .pharmaciesVerified(verified)
                .pharmaciesPending(pending)
                .pharmaciesUnverified(total - verified - pending)
                .medicines(medicineRepository.count())
                .activeReservations(reservationRepository.countByStatusIn(
                        List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)))
                .totalUnitsStocked(inventoryRepository.totalUnits())
                .build();
    }
}