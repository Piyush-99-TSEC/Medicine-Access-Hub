package com.medicineaccesshub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineRejectRequest {

    @NotBlank(message = "Please give a reason")
    @Size(max = 500, message = "Reason must be at most 500 characters")
    private String reason;
}