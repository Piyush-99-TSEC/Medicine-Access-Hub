package com.medicineaccesshub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "demand_clusters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandCluster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "centroid_lat", nullable = false)
    private Double centroidLat;

    @Column(name = "centroid_lng", nullable = false)
    private Double centroidLng;

    @Column(name = "search_count", nullable = false)
    private Integer searchCount;

    @Column(name = "distinct_users", nullable = false)
    private Integer distinctUsers;

    // Null when no pharmacy stocks the medicine
    @Column(name = "gap_km")
    private Double gapKm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nearest_pharmacy_id")
    private Pharmacy nearestPharmacy;

    // Same value for every cluster written by one scheduled run
    @Column(name = "computed_at", nullable = false)
    private LocalDateTime computedAt;
}