package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.DemandCluster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DemandClusterRepository extends JpaRepository<DemandCluster, Long> {

    /** Clusters of the most recent run, biggest first, with medicine loaded; the nearest pharmacy may be null. */
    @Query("SELECT d FROM DemandCluster d JOIN FETCH d.medicine LEFT JOIN FETCH d.nearestPharmacy " +
            "WHERE d.computedAt = (SELECT MAX(c.computedAt) FROM DemandCluster c) " +
            "ORDER BY d.searchCount DESC")
    List<DemandCluster> findLatestRun();

    /** Removes runs computed before the cutoff. */
    @Modifying
    @Transactional
    @Query("DELETE FROM DemandCluster d WHERE d.computedAt < :cutoff")
    void deleteOlderThan(@Param("cutoff") LocalDateTime cutoff);
}