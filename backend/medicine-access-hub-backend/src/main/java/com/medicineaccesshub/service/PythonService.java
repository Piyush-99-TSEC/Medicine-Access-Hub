package com.medicineaccesshub.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Access to the Python service (typo-tolerant search and pharmacy ranking).
 * Methods return empty on failure so callers can fall back to their own logic.
 */
public interface PythonService {

    /** Matched medicine ids for a query, best match first. */
    Optional<List<Long>> searchIds(String query);

    /** Pharmacies ranked by road distance (A*) and weighted score. */
    Optional<List<Map<String, Object>>> rank(double lat, double lng, List<Map<String, Object>> pharmacies);
}