package com.medicineaccesshub.service;

public interface SearchLogService {

    /**
     * Saves one availability search. Runs in the background and never fails the search itself.
     * userId is null for guests; resultFound is false when no pharmacy had the medicine.
     */
    void record(Long userId, Long medicineId, double lat, double lng, boolean resultFound);
}