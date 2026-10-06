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
import com.medicineaccesshub.dto.response.OcrScanResponse;
import com.medicineaccesshub.exception.BadRequestException;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final long MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

    // No @Transactional here: the OCR call can take several seconds and must not hold a DB connection.
    @Override
    @SuppressWarnings("unchecked")
    public OcrScanResponse scanStrip(MultipartFile file) {
        validateImage(file);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Could not read the uploaded image");
        }
        String filename = file.getOriginalFilename() == null ? "strip.jpg" : file.getOriginalFilename();

        Map<String, Object> res = pythonService.ocr(bytes, filename)
                .orElseThrow(() -> new BadRequestException("Scanning is unavailable right now, search by name instead"));

        List<String> lines = (List<String>) res.getOrDefault("lines", List.of());
        List<Map<String, Object>> found = (List<Map<String, Object>>) res.getOrDefault("candidates", List.of());

        List<Long> ids = found.stream().map(c -> ((Number) c.get("id")).longValue()).toList();
        Map<Long, Medicine> byId = medicineRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Medicine::getId, m -> m));

        // Keeps Python's best-first order; ids missing from the DB are skipped
        List<OcrScanResponse.Candidate> candidates = found.stream()
                .map(c -> {
                    Medicine m = byId.get(((Number) c.get("id")).longValue());
                    if (m == null) {
                        return null;
                    }
                    return OcrScanResponse.Candidate.builder()
                            .medicine(MedicineResponse.fromEntity(m))
                            .confidence(((Number) c.get("score")).doubleValue())
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        return OcrScanResponse.builder().lines(lines).candidates(candidates).build();
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please upload an image");
        }
        String type = file.getContentType();
        if (type == null || !type.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new BadRequestException("Image must be 5 MB or smaller");
        }
    }
}