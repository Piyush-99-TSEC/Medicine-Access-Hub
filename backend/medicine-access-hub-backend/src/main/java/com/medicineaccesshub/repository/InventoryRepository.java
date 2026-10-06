package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByPharmacyId(Long pharmacyId);

    Optional<Inventory> findByPharmacyIdAndMedicineId(Long pharmacyId, Long medicineId);

    interface AvailabilityRow {
        Long getInventoryId();
        Long getPharmacyId();
        String getPharmacyName();
        String getAddress();
        Double getLatitude();
        Double getLongitude();
        String getOpenTime();
        String getCloseTime();
        BigDecimal getAvgRating();
        Integer getQuantity();
        BigDecimal getPrice();
        String getExpiryDate();
        Double getDistanceKm();
    }

    @Query(value = """
            SELECT * FROM (
                SELECT i.id                                  AS "inventoryId",
                       p.pharmacy_id                         AS "pharmacyId",
                       p.name                                AS "pharmacyName",
                       p.address                             AS "address",
                       p.latitude                            AS "latitude",
                       p.longitude                           AS "longitude",
                       to_char(p.open_time, 'HH24:MI')       AS "openTime",
                       to_char(p.close_time, 'HH24:MI')      AS "closeTime",
                       p.avg_rating                          AS "avgRating",
                       i.quantity                            AS "quantity",
                       i.price                               AS "price",
                       to_char(i.expiry_date, 'YYYY-MM-DD')  AS "expiryDate",
                       6371 * 2 * asin(sqrt(
                           power(sin(radians(p.latitude - :lat) / 2), 2)
                         + cos(radians(:lat)) * cos(radians(p.latitude))
                           * power(sin(radians(p.longitude - :lng) / 2), 2)
                       ))                                    AS "distanceKm"
                FROM inventory i
                JOIN pharmacies p ON p.pharmacy_id = i.pharmacy_id
                WHERE i.medicine_id = :medicineId
                  AND i.quantity > 0
                  AND p.is_verified = TRUE
            ) t
            WHERE t."distanceKm" <= :radiusKm
            ORDER BY t."distanceKm"
            """, nativeQuery = true)
    List<AvailabilityRow> findAvailability(@Param("medicineId") Long medicineId,
                                           @Param("lat") double lat,
                                           @Param("lng") double lng,
                                           @Param("radiusKm") double radiusKm);

//    @Query("SELECT i FROM Inventory i JOIN FETCH i.medicine "
//            + "WHERE i.pharmacy.id = :pharmacyId ORDER BY i.updatedAt DESC")
//    List<Inventory> findAllByPharmacyWithMedicine(@Param("pharmacyId") Long pharmacyId);

//    @Query(value = "SELECT i FROM Inventory i JOIN FETCH i.medicine m "
//            + "WHERE i.pharmacy.id = :pharmacyId AND i.quantity BETWEEN :minQty AND :maxQty "
//            + "AND (LOWER(m.brandName) LIKE LOWER(CONCAT('%', :q, '%')) "
//            + "  OR LOWER(m.saltComposition) LIKE LOWER(CONCAT('%', :q, '%'))) "
//            + "ORDER BY m.brandName ASC, i.id ASC",
//            countQuery = "SELECT COUNT(i) FROM Inventory i JOIN i.medicine m "
//                    + "WHERE i.pharmacy.id = :pharmacyId AND i.quantity BETWEEN :minQty AND :maxQty "
//                    + "AND (LOWER(m.brandName) LIKE LOWER(CONCAT('%', :q, '%')) "
//                    + "  OR LOWER(m.saltComposition) LIKE LOWER(CONCAT('%', :q, '%')))")
//    Page<Inventory> searchStock(@Param("pharmacyId") Long pharmacyId,
//                                @Param("q") String q,
//                                @Param("minQty") int minQty,
//                                @Param("maxQty") int maxQty,
//                                Pageable pageable);
    @Query(value = "SELECT i FROM Inventory i JOIN FETCH i.medicine m "
            + "WHERE i.pharmacy.id = :pharmacyId AND i.quantity BETWEEN :minQty AND :maxQty "
            + "AND (LOWER(m.brandName) LIKE LOWER(CONCAT('%', :q, '%')) "
            + "  OR LOWER(m.saltComposition) LIKE LOWER(CONCAT('%', :q, '%'))) "
            + "AND (:filterExpiry = false OR i.expiryDate BETWEEN :expFrom AND :expTo) "
            + "ORDER BY m.brandName ASC, i.id ASC",
            countQuery = "SELECT COUNT(i) FROM Inventory i JOIN i.medicine m "
                    + "WHERE i.pharmacy.id = :pharmacyId AND i.quantity BETWEEN :minQty AND :maxQty "
                    + "AND (LOWER(m.brandName) LIKE LOWER(CONCAT('%', :q, '%')) "
                    + "  OR LOWER(m.saltComposition) LIKE LOWER(CONCAT('%', :q, '%'))) "
                    + "AND (:filterExpiry = false OR i.expiryDate BETWEEN :expFrom AND :expTo)")
    Page<Inventory> searchStock(@Param("pharmacyId") Long pharmacyId,
                                @Param("q") String q,
                                @Param("minQty") int minQty,
                                @Param("maxQty") int maxQty,
                                @Param("filterExpiry") boolean filterExpiry,
                                @Param("expFrom") LocalDate expFrom,
                                @Param("expTo") LocalDate expTo,
                                Pageable pageable);

    long countByPharmacyId(Long pharmacyId);

    long countByPharmacyIdAndQuantityBetween(Long pharmacyId, int min, int max);

    long countByPharmacyIdAndExpiryDateBetween(Long pharmacyId, LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(i.quantity), 0L) FROM Inventory i WHERE i.pharmacy.id = :pharmacyId")
    Long sumQuantity(@Param("pharmacyId") Long pharmacyId);

    Optional<Inventory> findByIdAndPharmacyId(Long id, Long pharmacyId);

}