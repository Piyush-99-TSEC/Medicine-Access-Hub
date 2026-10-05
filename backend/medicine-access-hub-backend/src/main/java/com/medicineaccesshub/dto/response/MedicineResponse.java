package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.entity.Medicine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineResponse {

    private Long id;
    private String brandName;
    private String saltComposition;
    private String strength;
    private String dosageForm;
    private String manufacturer;
    private String packSize;
    private BigDecimal mrp;
    private Boolean rxRequired;

    public static MedicineResponse fromEntity(Medicine m) {
        return MedicineResponse.builder()
                .id(m.getId())
                .brandName(m.getBrandName())
                .saltComposition(m.getSaltComposition())
                .strength(m.getStrength())
                .dosageForm(m.getDosageForm())
                .manufacturer(m.getManufacturer())
                .packSize(m.getPackSize())
                .mrp(m.getMrp())
                .rxRequired(m.getRxRequired())
                .build();
    }
}