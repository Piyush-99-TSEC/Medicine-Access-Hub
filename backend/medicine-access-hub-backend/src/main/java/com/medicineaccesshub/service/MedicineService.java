package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;

public interface MedicineService {

    PageResponse<MedicineResponse> search(String query, int page, int size);

    MedicineResponse getById(Long id);
}