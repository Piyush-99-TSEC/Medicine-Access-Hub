package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.entity.MedicineAdditionRequest;
import com.medicineaccesshub.enums.MedicineRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * forOwner reads only the request and its medicine; forAdmin also reads the pharmacy.
 * Each matches what its repository query fetched, so no lazy loads.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineAdditionResponse {

    private Long id;
    private String brandName;
    private String saltComposition;
    private String strength;
    private String dosageForm;
    private String manufacturer;
    private String packSize;
    private BigDecimal mrp;
    private Boolean rxRequired;
    private MedicineRequestStatus status;
    private String rejectionReason;
    private Long medicineId;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    // admin view
    private Long pharmacyId;
    private String pharmacyName;

    public static MedicineAdditionResponse forOwner(MedicineAdditionRequest r) {
        return base(r).build();
    }

    public static MedicineAdditionResponse forAdmin(MedicineAdditionRequest r) {
        return base(r)
                .pharmacyId(r.getPharmacy().getId())
                .pharmacyName(r.getPharmacy().getName())
                .build();
    }

    private static MedicineAdditionResponseBuilder base(MedicineAdditionRequest r) {
        return MedicineAdditionResponse.builder()
                .id(r.getId())
                .brandName(r.getBrandName())
                .saltComposition(r.getSaltComposition())
                .strength(r.getStrength())
                .dosageForm(r.getDosageForm())
                .manufacturer(r.getManufacturer())
                .packSize(r.getPackSize())
                .mrp(r.getMrp())
                .rxRequired(r.getRxRequired())
                .status(r.getStatus())
                .rejectionReason(r.getRejectionReason())
                .medicineId(r.getMedicine() == null ? null : r.getMedicine().getId())
                .createdAt(r.getCreatedAt())
                .reviewedAt(r.getReviewedAt());
    }
}