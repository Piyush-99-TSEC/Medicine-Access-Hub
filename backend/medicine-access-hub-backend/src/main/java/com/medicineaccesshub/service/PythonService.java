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

    /** OCR result for a strip or box photo: extracted lines and top candidate medicines. */
    Optional<Map<String, Object>> ocr(byte[] image, String filename);

    /** Road route (A*) between two points: {distanceKm, path:[[lat,lng],...]}. */
    Optional<Map<String, Object>> route(double fromLat, double fromLng, double toLat, double toLng);

    /** Tells Python to reload its medicine search index (after the master data changed). */
    void reloadSearchIndex();
}