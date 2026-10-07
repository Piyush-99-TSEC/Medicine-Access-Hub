package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.DailyCountResponse;
import com.medicineaccesshub.dto.response.ReservationResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.ReservationStatus;
import com.medicineaccesshub.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Reservation requests of the logged-in owner's pharmacy. Role rule (PHARMACY_OWNER) lives in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/pharmacies/me/reservations")
@RequiredArgsConstructor
public class OwnerReservationController {

    private final ReservationService reservationService;

    // No status = PENDING + CONFIRMED
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> list(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) ReservationStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Reservations fetched successfully",
                reservationService.listForMyPharmacy(user.getId(), status)));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<ReservationResponse>> accept(
            @AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reservation accepted",
                reservationService.accept(user.getId(), id)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ReservationResponse>> reject(
            @AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reservation rejected",
                reservationService.reject(user.getId(), id)));
    }

    @PatchMapping("/{id}/collect")
    public ResponseEntity<ApiResponse<ReservationResponse>> collect(
            @AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reservation marked as collected",
                reservationService.markCollected(user.getId(), id)));
    }
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<List<DailyCountResponse>>> daily(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success("Daily reservation counts fetched",
                reservationService.dailyCountsForMyPharmacy(user.getId(), days)));
    }
}