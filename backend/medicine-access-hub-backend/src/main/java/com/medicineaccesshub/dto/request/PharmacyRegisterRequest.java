package com.medicineaccesshub.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyRegisterRequest {

    @NotBlank(message = "Pharmacy name is required")
    @Size(min = 2, max = 150, message = "Pharmacy name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Owner name is required")
    @Size(min = 2, max = 100, message = "Owner name must be between 2 and 100 characters")
    @Pattern(regexp = "^[A-Za-z ]+$",
            message = "Owner name must contain only letters and spaces")
    private String ownerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$",
            message = "Contact phone must be a valid 10-digit Indian mobile number")
    private String contactPhone;

    @NotBlank(message = "Licence number is required")
    @Pattern(regexp = "^[A-Za-z0-9/\\-]{5,50}$",
            message = "Licence number must be 5-50 characters (letters, digits, '/' or '-')")
    private String licenceNo;

    @NotBlank(message = "GST number is required")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$",
            message = "GST number must be a valid 15-character GSTIN")
    private String gstNo;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @NotNull(message = "Opening time is required")
    private LocalTime openTime;

    @NotNull(message = "Closing time is required")
    private LocalTime closeTime;
}
