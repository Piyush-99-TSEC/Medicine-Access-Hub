package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.repository.InventoryRepository.AvailabilityRow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyAvailabilityResponse {

    private Long inventoryId;
    private Long pharmacyId;
    private String pharmacyName;
    private String address;
    private Double latitude;
    private Double longitude;
    private String openTime;
    private String closeTime;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Integer quantity;
    private BigDecimal price;
    private String expiryDate;
    private Long updatedMinutesAgo;
    private Double distanceKm;
    private Double score;
    private Boolean isOpen;

    public static PharmacyAvailabilityResponse from(AvailabilityRow r) {
        return PharmacyAvailabilityResponse.builder()
                .inventoryId(r.getInventoryId())
                .pharmacyId(r.getPharmacyId())
                .pharmacyName(r.getPharmacyName())
                .address(r.getAddress())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .openTime(r.getOpenTime())
                .closeTime(r.getCloseTime())
                .avgRating(r.getAvgRating())
                .reviewCount(r.getReviewCount())
                .quantity(r.getQuantity())
                .price(r.getPrice())
                .expiryDate(r.getExpiryDate())
                .updatedMinutesAgo(r.getUpdatedMinutesAgo())
                .distanceKm(Math.round(r.getDistanceKm() * 100.0) / 100.0)
                .build();
    }
}