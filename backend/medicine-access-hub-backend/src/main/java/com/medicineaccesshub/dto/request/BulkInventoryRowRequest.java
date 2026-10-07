package com.medicineaccesshub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * One uploaded row. Deliberately not validated with annotations: a bad row must be
 * reported in the preview, not fail the whole upload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkInventoryRowRequest {

    private String brandName;
    private String strength;

    /** Shelf count right now (not "add this many"). */
    private Integer quantity;
    private BigDecimal price;

    /** yyyy-MM-dd, optional; parsed in the service so a bad date only fails its own row. */
    private String expiryDate;
}