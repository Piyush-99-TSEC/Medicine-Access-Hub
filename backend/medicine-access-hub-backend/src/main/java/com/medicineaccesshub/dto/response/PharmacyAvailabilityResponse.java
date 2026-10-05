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
    private Integer quantity;
    private BigDecimal price;
    private String expiryDate;
    private Double distanceKm;

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
                .quantity(r.getQuantity())
                .price(r.getPrice())
                .expiryDate(r.getExpiryDate())
                .distanceKm(Math.round(r.getDistanceKm() * 100.0) / 100.0)
                .build();
    }
}