package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.dto.response.OcrScanResponse;
import org.springframework.web.multipart.MultipartFile;
import com.medicineaccesshub.dto.request.MedicineRequest;
import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;
public interface MedicineService {

    PageResponse<MedicineResponse> search(String query, int page, int size);

    MedicineResponse getById(Long id);

    OcrScanResponse scanStrip(MultipartFile file);

    // admin master data
    PageResponse<MedicineResponse> adminList(String q, int page, int size);

    MedicineResponse adminCreate(MedicineRequest request);

    MedicineResponse adminUpdate(Long id, MedicineRequest request);
}