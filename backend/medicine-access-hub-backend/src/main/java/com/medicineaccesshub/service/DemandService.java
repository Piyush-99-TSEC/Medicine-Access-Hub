package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.response.DemandClusterResponse;

import java.util.List;

/** Unmet demand mapping: DBSCAN clusters of failed searches from the last 7 days, biggest first. */
public interface DemandService {

    /** All clusters (admin). */
    List<DemandClusterResponse> getAll();

    /** Only clusters within 3 km of the owner's pharmacy. */
    List<DemandClusterResponse> getForOwner(Long ownerUserId);

    /** Runs DBSCAN now and saves the result as a new run; skipped if there is nothing to cluster or Python is down. */
    void refresh();
}