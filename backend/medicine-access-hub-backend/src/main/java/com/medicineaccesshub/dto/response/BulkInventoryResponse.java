package com.medicineaccesshub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkInventoryResponse {

    /** true = preview only, nothing was saved. */
    private boolean dryRun;
    private int total;
    private int created;
    private int updated;
    private int notInCatalogue;
    private int invalid;
    private List<BulkInventoryRowResult> rows;
}