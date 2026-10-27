package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.entity.SearchLog;
import com.medicineaccesshub.repository.MedicineRepository;
import com.medicineaccesshub.repository.SearchLogRepository;
import com.medicineaccesshub.repository.UserRepository;
import com.medicineaccesshub.service.SearchLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchLogServiceImpl implements SearchLogService {

    private final SearchLogRepository searchLogRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @Override
    @Async
    @Transactional
    public void record(Long userId, Long medicineId, double lat, double lng, boolean resultFound) {
        try {
            searchLogRepository.save(SearchLog.builder()
                    .user(userId == null ? null : userRepository.getReferenceById(userId))
                    .medicine(medicineRepository.getReferenceById(medicineId))
                    .latitude(lat)
                    .longitude(lng)
                    .resultFound(resultFound)
                    .build());
        } catch (Exception e) {
            // Logging is best effort; a failure here must never affect the patient's search.
            log.warn("Could not save search log for medicine {}: {}", medicineId, e.getMessage());
        }
    }
}