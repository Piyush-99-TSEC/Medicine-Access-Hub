package com.medicineaccesshub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandClusterResponse {

    private Long medicineId;
    private String medicineName;
    private Double centroidLat;
    private Double centroidLng;

    /** Failed searches in the cluster over the window. */
    private Integer searchCount;
    private Integer distinctUsers;

    /** Road distance (A*) from the cluster to the nearest pharmacy holding stock; null if none stocks it. */
    private Double gapKm;
    private Long nearestPharmacyId;
}