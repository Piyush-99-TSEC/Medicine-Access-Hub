package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByReservationId(Long reservationId);

    /** Newest first; the user is fetched in the same query because the response shows the reviewer's name. */
    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.pharmacy.id = :pharmacyId ORDER BY r.createdAt DESC")
    List<Review> findByPharmacyWithUser(@Param("pharmacyId") Long pharmacyId, Pageable pageable);

    /** Which of this user's reservations are already reviewed (one query for the whole list). */
    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.pharmacy WHERE r.reservation.id = :reservationId")
    Optional<Review> findByReservationIdWithDetails(@Param("reservationId") Long reservationId);

    /** The user's own reviews, with the reservation loaded so each can be matched to its card. */
    @Query("SELECT r FROM Review r JOIN FETCH r.reservation WHERE r.user.id = :userId")
    List<Review> findByUserWithReservation(@Param("userId") Long userId);
}