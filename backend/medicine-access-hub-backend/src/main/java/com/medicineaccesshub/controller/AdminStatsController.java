package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.response.AdminStatsResponse;
import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** System-wide counters for the admin dashboard. ADMIN role rule comes from /api/v1/admin/** in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", adminStatsService.getStats()));
    }
}