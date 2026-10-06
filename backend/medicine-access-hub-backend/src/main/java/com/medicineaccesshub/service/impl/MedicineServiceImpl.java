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
import com.medicineaccesshub.service.PythonService;
import org.springframework.data.domain.PageImpl;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private static final int MAX_PAGE_SIZE = 50;

    private final MedicineRepository medicineRepository;
    private final PythonService pythonService;

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
            if (safePage == 0) {
                Optional<List<Long>> ids = pythonService.searchIds(query.trim());
                if (ids.isPresent()) {
                    return fromIds(ids.get(), safeSize);
                }
            }
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

    private PageResponse<MedicineResponse> fromIds(List<Long> ids, int size) {
        Map<Long, Medicine> byId = medicineRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Medicine::getId, m -> m));
        List<MedicineResponse> content = ids.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .limit(size)
                .map(MedicineResponse::fromEntity)
                .toList();
        return PageResponse.from(new PageImpl<>(content, PageRequest.of(0, size), content.size()));
    }
}