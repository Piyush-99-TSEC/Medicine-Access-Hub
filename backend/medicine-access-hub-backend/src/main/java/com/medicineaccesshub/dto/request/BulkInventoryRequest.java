package com.medicineaccesshub.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkInventoryRequest {

    @NotEmpty(message = "The file has no rows")
    @Size(max = 2000, message = "At most 2000 rows per upload")
    private List<BulkInventoryRowRequest> rows;
}