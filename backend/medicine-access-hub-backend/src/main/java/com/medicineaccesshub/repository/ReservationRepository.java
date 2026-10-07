package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.Reservation;
import com.medicineaccesshub.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r JOIN FETCH r.user JOIN FETCH r.pharmacy JOIN FETCH r.medicine " +
            "WHERE r.id = :id")
    Optional<Reservation> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT r FROM Reservation r JOIN FETCH r.pharmacy JOIN FETCH r.medicine " +
            "WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Reservation> findByUserWithDetails(@Param("userId") Long userId);

    @Query("SELECT r FROM Reservation r JOIN FETCH r.user JOIN FETCH r.medicine " +
            "WHERE r.pharmacy.id = :pharmacyId AND r.status IN :statuses ORDER BY r.createdAt DESC")
    List<Reservation> findByPharmacyAndStatusWithDetails(@Param("pharmacyId") Long pharmacyId,
                                                         @Param("statuses") Collection<ReservationStatus> statuses);

    boolean existsByUserIdAndPharmacyIdAndMedicineIdAndStatusIn(Long userId, Long pharmacyId, Long medicineId,
                                                                Collection<ReservationStatus> statuses);

    /** Bulk expiry of unanswered requests: one UPDATE, no stock to restore (not yet accepted). */
    @Modifying
    @Query("UPDATE Reservation r SET r.status = com.medicineaccesshub.enums.ReservationStatus.EXPIRED, " +
            "r.updatedAt = :now WHERE r.status = com.medicineaccesshub.enums.ReservationStatus.PENDING " +
            "AND r.expiresAt < :now")
    int expirePending(@Param("now") LocalDateTime now);

    /** Confirmed reservations not collected in time (stock must be restored). */
    @Query("SELECT r FROM Reservation r JOIN FETCH r.pharmacy JOIN FETCH r.medicine " +
            "WHERE r.status = com.medicineaccesshub.enums.ReservationStatus.CONFIRMED AND r.pickupBy < :now")
    List<Reservation> findConfirmedPastPickup(@Param("now") LocalDateTime now);

    interface DayCount {
        java.time.LocalDate getDay();
        Long getTotal();
    }

    /** Reservations created per day for one pharmacy (days with none are filled in by the service). */
    @Query(value = "SELECT CAST(created_at AS date) AS day, COUNT(*) AS total FROM reservations " +
            "WHERE pharmacy_id = :pharmacyId AND created_at >= :since " +
            "GROUP BY CAST(created_at AS date)", nativeQuery = true)
    List<DayCount> countPerDay(@Param("pharmacyId") Long pharmacyId, @Param("since") LocalDateTime since);
}