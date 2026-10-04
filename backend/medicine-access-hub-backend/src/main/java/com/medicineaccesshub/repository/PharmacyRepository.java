package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.medicineaccesshub.enums.PharmacyStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {

    Optional<Pharmacy> findByOwnerId(Long ownerId);

    Optional<Pharmacy> findByIdAndIsVerifiedTrue(Long id);

    boolean existsByOwnerId(Long ownerId);

    boolean existsByLicenceNo(String licenceNo);

    List<Pharmacy> findByStatusOrderByCreatedAtDesc(PharmacyStatus status);
}