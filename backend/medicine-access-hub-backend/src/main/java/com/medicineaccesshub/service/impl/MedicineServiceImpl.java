package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.entity.Medicine;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.MedicineRepository;
import com.medicineaccesshub.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private static final int MAX_PAGE_SIZE = 50;

    private final MedicineRepository medicineRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MedicineResponse> search(String query, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Page<Medicine> result;
        if (query == null || query.isBlank()) {
            // No search text: browse the catalogue alphabetically
            result = medicineRepository.findAll(
                    PageRequest.of(safePage, safeSize, Sort.by("brandName")));
        } else {
            // Native query has its own ORDER BY, so the Pageable stays unsorted
            result = medicineRepository.search(query.trim(), PageRequest.of(safePage, safeSize));
        }
        return PageResponse.from(result.map(MedicineResponse::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getById(Long id) {
        return medicineRepository.findById(id)
                .map(MedicineResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
    }
}