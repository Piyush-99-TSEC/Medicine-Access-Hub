package com.medicineaccesshub.config;

import com.medicineaccesshub.service.DemandService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Once on startup, then every 6 hours: recompute the unmet demand clusters. */
@Component
@RequiredArgsConstructor
public class DemandClusterScheduler {

    private final DemandService demandService;

    @Scheduled(initialDelay = 0, fixedDelay = 6 * 60 * 60 * 1000)
    public void refresh() {
        demandService.refresh();
    }
}