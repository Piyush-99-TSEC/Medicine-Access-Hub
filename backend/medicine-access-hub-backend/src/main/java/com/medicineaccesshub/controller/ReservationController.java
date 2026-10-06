package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.ReservationCreateRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.ReservationResponse;
import com.medicineaccesshub.dto.response.RouteResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Reservations of the logged-in patient. Role rule (PATIENT) lives in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReservationCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Reservation request sent",
                reservationService.create(user.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> listMine(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Reservations fetched successfully",
                reservationService.listMine(user.getId())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancel(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled",
                reservationService.cancel(user.getId(), id)));
    }

    @GetMapping("/{id}/route")
    public ResponseEntity<ApiResponse<RouteResponse>> route(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam double lat,
            @RequestParam double lng) {
        return ResponseEntity.ok(ApiResponse.success("Route fetched successfully",
                reservationService.getRoute(user.getId(), id, lat, lng)));
    }
}