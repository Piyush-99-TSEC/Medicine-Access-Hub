package com.medicineaccesshub.controller;

import com.medicineaccesshub.dto.response.ApiResponse;
import com.medicineaccesshub.dto.response.DemandClusterResponse;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.service.DemandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Unmet demand clusters within 3 km of the logged-in owner's pharmacy. Role rule (PHARMACY_OWNER) lives in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/pharmacies/me/demand")
@RequiredArgsConstructor
public class OwnerDemandController {

    private final DemandService demandService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DemandClusterResponse>>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Unmet demand fetched successfully",
                demandService.getForOwner(user.getId())));
    }
}