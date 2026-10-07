package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.request.ReviewCreateRequest;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.ReviewResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Role rule (PATIENT) comes from the /api/v1/reservations/** rule in SecurityConfig
    @PostMapping("/reservations/{id}/review")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Thanks for your review",
                reviewService.create(user.getId(), id, request)));
    }

    @GetMapping("/pharmacies/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> list(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully",
                reviewService.listForPharmacy(id)));
    }

    @PutMapping("/reservations/{id}/review")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review updated",
                reviewService.update(user.getId(), id, request)));
    }
}