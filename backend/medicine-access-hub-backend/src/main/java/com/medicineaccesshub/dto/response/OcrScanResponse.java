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
public class OcrScanResponse {

    // Cleaned text lines OCR picked up from the photo
    private List<String> lines;
    private List<Candidate> candidates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Candidate {
        private MedicineResponse medicine;
        // Match score from the Python matcher, 0 to 1
        private Double confidence;
    }
}