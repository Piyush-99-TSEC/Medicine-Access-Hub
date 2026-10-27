package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.DemandClusterResponse;
import com.medicineaccesshub.service.DemandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Unmet demand clusters across all areas. ADMIN role rule comes from /api/v1/admin/** in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/admin/demand")
@RequiredArgsConstructor
public class AdminDemandController {

    private final DemandService demandService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DemandClusterResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success("Unmet demand fetched successfully", demandService.getAll()));
    }
}