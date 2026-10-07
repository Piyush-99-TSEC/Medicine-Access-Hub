package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /** Running average: (avg x count + rating) / (count + 1), done in one atomic UPDATE. */
    @Modifying
    @Query("UPDATE Pharmacy p SET p.avgRating = ((p.avgRating * p.reviewCount) + :rating) / (p.reviewCount + 1), " +
            "p.reviewCount = p.reviewCount + 1 WHERE p.id = :id")
    int addRating(@Param("id") Long id, @Param("rating") int rating);

    /** Edited review: swaps the old rating for the new one in the average (count unchanged). */
    @Modifying
    @Query("UPDATE Pharmacy p SET p.avgRating = ((p.avgRating * p.reviewCount) - :oldRating + :newRating) / p.reviewCount " +
            "WHERE p.id = :id AND p.reviewCount > 0")
    int adjustRating(@Param("id") Long id, @Param("oldRating") int oldRating, @Param("newRating") int newRating);
}