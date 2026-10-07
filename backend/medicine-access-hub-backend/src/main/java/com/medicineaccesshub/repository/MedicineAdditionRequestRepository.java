package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.MedicineAdditionRequest;
import com.medicineaccesshub.enums.MedicineRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineAdditionRequestRepository extends JpaRepository<MedicineAdditionRequest, Long> {

    /** Owner's own requests; the created medicine is fetched so the response needs no lazy load. */
    @Query("SELECT r FROM MedicineAdditionRequest r LEFT JOIN FETCH r.medicine " +
            "WHERE r.pharmacy.id = :pharmacyId ORDER BY r.createdAt DESC")
    List<MedicineAdditionRequest> findByPharmacyWithMedicine(@Param("pharmacyId") Long pharmacyId);

    /** Admin queue: pharmacy and medicine fetched in the same query. */
    @Query("SELECT r FROM MedicineAdditionRequest r JOIN FETCH r.pharmacy LEFT JOIN FETCH r.medicine " +
            "WHERE r.status = :status ORDER BY r.createdAt")
    List<MedicineAdditionRequest> findByStatusWithPharmacy(@Param("status") MedicineRequestStatus status);

    @Query("SELECT r FROM MedicineAdditionRequest r JOIN FETCH r.pharmacy LEFT JOIN FETCH r.medicine " +
            "WHERE r.id = :id")
    Optional<MedicineAdditionRequest> findByIdWithPharmacy(@Param("id") Long id);

    /** Stops the same pharmacy from queueing the same brand twice. */
    boolean existsByPharmacyIdAndBrandNameIgnoreCaseAndStatus(Long pharmacyId, String brandName,
                                                              MedicineRequestStatus status);
}