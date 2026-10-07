package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.dto.response.PageResponse;
import com.medicineaccesshub.dto.response.PrescriptionScanResponse;
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
import com.medicineaccesshub.dto.request.MedicineRequest;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private static final int MAX_PAGE_SIZE = 50;
    // Same cap as the Python matcher (TOP_K), so results look alike when Python is down
    private static final int SEARCH_LIMIT = 5;
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
                // Python down or no match: SQL fallback, capped at the same top 5
                List<MedicineResponse> top = medicineRepository
                        .search(query.trim(), PageRequest.of(0, Math.min(safeSize, SEARCH_LIMIT)))
                        .map(MedicineResponse::fromEntity).getContent();
                return PageResponse.from(new PageImpl<>(top, PageRequest.of(0, safeSize), top.size()));
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

    // No @Transactional: the Python call can take several seconds and must not hold a DB connection.
    @Override
    @SuppressWarnings("unchecked")
    public PrescriptionScanResponse scanPrescription(MultipartFile file) {
        validateImage(file);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Could not read the uploaded image");
        }
        String filename = file.getOriginalFilename() == null ? "prescription.jpg" : file.getOriginalFilename();

        Map<String, Object> res = pythonService.prescription(bytes, filename)
                .orElseThrow(() -> new BadRequestException(
                        "Prescription reading is unavailable right now, add medicines by name instead"));

        List<Map<String, Object>> found = (List<Map<String, Object>>) res.getOrDefault("medicines", List.of());

        List<Long> ids = found.stream()
                .flatMap(m -> ((List<Map<String, Object>>) m.getOrDefault("candidates", List.of())).stream())
                .map(c -> ((Number) c.get("id")).longValue())
                .distinct().toList();
        Map<Long, Medicine> byId = medicineRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Medicine::getId, m -> m));

        List<PrescriptionScanResponse.Item> items = found.stream().map(m -> {
            List<OcrScanResponse.Candidate> candidates =
                    ((List<Map<String, Object>>) m.getOrDefault("candidates", List.of())).stream()
                            .map(c -> {
                                Medicine med = byId.get(((Number) c.get("id")).longValue());
                                if (med == null) {
                                    return null;
                                }
                                return OcrScanResponse.Candidate.builder()
                                        .medicine(MedicineResponse.fromEntity(med))
                                        .confidence(((Number) c.get("score")).doubleValue())
                                        .build();
                            })
                            .filter(Objects::nonNull)
                            .toList();
            return PrescriptionScanResponse.Item.builder()
                    .query((String) m.get("query"))
                    .matched(Boolean.TRUE.equals(m.get("matched")))
                    .candidates(candidates)
                    .build();
        }).toList();

        return PrescriptionScanResponse.builder()
                .items(items)
                .source((String) res.getOrDefault("source", "ocr"))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MedicineResponse> adminList(String q, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        String term = q == null ? "" : q.trim();
        Page<Medicine> result = medicineRepository
                .findByBrandNameContainingIgnoreCaseOrSaltCompositionContainingIgnoreCase(
                        term, term, PageRequest.of(safePage, safeSize, Sort.by("brandName")));
        return PageResponse.from(result.map(MedicineResponse::fromEntity));
    }

    @Override
    @Transactional
    public MedicineResponse adminCreate(MedicineRequest request) {
        Medicine saved = medicineRepository.save(apply(new Medicine(), request));
        reloadSearchIndexAfterCommit();
        return MedicineResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public MedicineResponse adminUpdate(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        reloadSearchIndexAfterCommit();
        return MedicineResponse.fromEntity(apply(medicine, request));
    }

    // Python reads the DB, so it must reload only after our transaction has committed
    private void reloadSearchIndexAfterCommit() {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                pythonService.reloadSearchIndex();
            }
        });
    }

    private Medicine apply(Medicine m, MedicineRequest r) {
        m.setBrandName(r.getBrandName().trim());
        m.setSaltComposition(r.getSaltComposition().trim());
        m.setStrength(blankToNull(r.getStrength()));
        m.setDosageForm(blankToNull(r.getDosageForm()));
        m.setManufacturer(blankToNull(r.getManufacturer()));
        m.setPackSize(blankToNull(r.getPackSize()));
        m.setMrp(r.getMrp());
        m.setRxRequired(r.getRxRequired());
        return m;
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
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