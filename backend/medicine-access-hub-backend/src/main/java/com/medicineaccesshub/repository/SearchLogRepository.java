package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    /** Failed searches since the cutoff, with medicine and user loaded; guests have no user, so LEFT JOIN. */
    @Query("SELECT s FROM SearchLog s JOIN FETCH s.medicine LEFT JOIN FETCH s.user " +
            "WHERE s.resultFound = false AND s.searchedAt >= :since ORDER BY s.medicine.id")
    List<SearchLog> findFailedSince(@Param("since") LocalDateTime since);
}