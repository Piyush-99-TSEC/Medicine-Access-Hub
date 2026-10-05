package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query(value = """
            SELECT * FROM medicines
            WHERE brand_name ILIKE '%' || :q || '%'
               OR salt_composition ILIKE '%' || :q || '%'
               OR word_similarity(:q, brand_name) > 0.4
               OR word_similarity(:q, salt_composition) > 0.4
            ORDER BY
               CASE
                 WHEN brand_name ILIKE :q || '%' THEN 0
                 WHEN salt_composition ILIKE :q THEN 1
                 WHEN salt_composition ILIKE :q || '%' THEN 2
                 ELSE 3
               END,
               GREATEST(word_similarity(:q, brand_name),
                        word_similarity(:q, salt_composition)) DESC,
               brand_name
            """,
            countQuery = """
            SELECT count(*) FROM medicines
            WHERE brand_name ILIKE '%' || :q || '%'
               OR salt_composition ILIKE '%' || :q || '%'
               OR word_similarity(:q, brand_name) > 0.4
               OR word_similarity(:q, salt_composition) > 0.4
            """,
            nativeQuery = true)
    Page<Medicine> search(@Param("q") String q, Pageable pageable);
}