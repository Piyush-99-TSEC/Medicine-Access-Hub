package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.dto.response.OcrScanResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MedicineService {

    PageResponse<MedicineResponse> search(String query, int page, int size);

    MedicineResponse getById(Long id);

    OcrScanResponse scanStrip(MultipartFile file);
}