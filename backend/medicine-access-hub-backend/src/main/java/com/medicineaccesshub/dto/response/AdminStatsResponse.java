package com.medicineaccesshub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalPharmacies;
    private long pharmaciesVerified;
    private long pharmaciesPending;
    /** Rejected and blocked together. */
    private long pharmaciesUnverified;
    private long medicines;
    /** PENDING + CONFIRMED reservations. */
    private long activeReservations;
    private long totalUnitsStocked;
}