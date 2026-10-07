package com.medicineaccesshub.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineRequest {

    @NotBlank(message = "Brand name is required")
    @Size(max = 150, message = "Brand name must be at most 150 characters")
    private String brandName;

    @NotBlank(message = "Salt composition is required")
    @Size(max = 200, message = "Salt composition must be at most 200 characters")
    private String saltComposition;

    @Size(max = 100, message = "Strength must be at most 100 characters")
    private String strength;

    @Size(max = 50, message = "Dosage form must be at most 50 characters")
    private String dosageForm;

    @Size(max = 150, message = "Manufacturer must be at most 150 characters")
    private String manufacturer;

    @Size(max = 100, message = "Pack size must be at most 100 characters")
    private String packSize;

    @NotNull(message = "MRP is required")
    @DecimalMin(value = "0.01", message = "MRP must be greater than 0")
    private BigDecimal mrp;

    @NotNull(message = "Rx required flag is required")
    private Boolean rxRequired;
}