package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.enums.BulkRowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkInventoryRowResult {

    /** 1-based position in the uploaded list. */
    private Integer rowNumber;
    private String brandName;
    private String strength;
    private Integer quantity;
    private BulkRowStatus status;
    private String message;
    private Long medicineId;
}