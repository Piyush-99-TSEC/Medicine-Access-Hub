package com.medicineaccesshub.config;

import com.medicineaccesshub.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Every minute: expire unanswered requests and unclaimed holds. */
@Component
@RequiredArgsConstructor
public class ReservationExpiryScheduler {

    private final ReservationService reservationService;

    @Scheduled(fixedDelay = 60_000)
    public void expireStale() {
        reservationService.expireStale();
    }
}