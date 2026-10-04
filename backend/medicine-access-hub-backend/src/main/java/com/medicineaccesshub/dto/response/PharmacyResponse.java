package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.entity.Pharmacy;
import com.medicineaccesshub.enums.PharmacyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyResponse {

    private Long id;
    private String name;
    private String licenceNo;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalTime openTime;
    private LocalTime closeTime;
    private BigDecimal avgRating;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    private PharmacyStatus status;
    private String rejectionReason;
    private String ownerName;
    private String email;
    private String contactPhone;
    private String gstNo;

    public static PharmacyResponse fromEntity(Pharmacy pharmacy) {
        if (pharmacy == null) {
            return null;
        }
        return PharmacyResponse.builder()
                .id(pharmacy.getId())
                .name(pharmacy.getName())
                .licenceNo(pharmacy.getLicenceNo())
                .address(pharmacy.getAddress())
                .latitude(pharmacy.getLatitude())
                .longitude(pharmacy.getLongitude())
                .openTime(pharmacy.getOpenTime())
                .closeTime(pharmacy.getCloseTime())
                .avgRating(pharmacy.getAvgRating())
                .isVerified(pharmacy.getIsVerified())
                .createdAt(pharmacy.getCreatedAt())
                .status(pharmacy.getStatus())
                .rejectionReason(pharmacy.getRejectionReason())
                .ownerName(pharmacy.getOwnerName())
                .email(pharmacy.getEmail())
                .contactPhone(pharmacy.getContactPhone())
                .gstNo(pharmacy.getGstNo())
                .build();
    }
}

