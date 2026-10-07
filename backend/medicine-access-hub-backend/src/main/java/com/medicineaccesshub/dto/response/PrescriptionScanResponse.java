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
public class PrescriptionScanResponse {

    private List<Item> items;

    /** "ocr" for printed text, "vision" for the handwriting model. */
    private String source;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        /** What was read from the prescription line. */
        private String query;
        private boolean matched;
        private List<OcrScanResponse.Candidate> candidates;
    }
}