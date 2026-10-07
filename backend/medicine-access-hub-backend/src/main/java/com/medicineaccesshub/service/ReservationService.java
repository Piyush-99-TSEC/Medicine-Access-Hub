package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.request.ReservationCreateRequest;
import com.medicineaccesshub.dto.response.ReservationResponse;
import com.medicineaccesshub.dto.response.RouteResponse;
import com.medicineaccesshub.enums.ReservationStatus;
import com.medicineaccesshub.dto.response.DailyCountResponse;
import java.util.List;

public interface ReservationService {

    // customer
    ReservationResponse create(Long userId, ReservationCreateRequest request);

    List<ReservationResponse> listMine(Long userId);

    ReservationResponse cancel(Long userId, Long reservationId);

    // pharmacy owner (status null = PENDING + CONFIRMED)
    List<ReservationResponse> listForMyPharmacy(Long ownerUserId, ReservationStatus status);

    ReservationResponse accept(Long ownerUserId, Long reservationId);

    ReservationResponse reject(Long ownerUserId, Long reservationId);

    ReservationResponse markCollected(Long ownerUserId, Long reservationId);

    /** Expires unanswered requests and unclaimed confirmed holds (restoring stock). */
    void expireStale();

    /** Road route to the pharmacy; only for the user's own CONFIRMED reservation. */
    RouteResponse getRoute(Long userId, Long reservationId, double lat, double lng);

    /** Reservations created per day for the last {@code days} days (1 to 30), oldest first, zeros included. */
    List<DailyCountResponse> dailyCountsForMyPharmacy(Long ownerUserId, int days);
}