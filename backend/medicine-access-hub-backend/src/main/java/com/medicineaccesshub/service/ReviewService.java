package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.request.ReviewCreateRequest;
import com.medicineaccesshub.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    /** Only the user's own COLLECTED reservation, once. */
    ReviewResponse create(Long userId, Long reservationId, ReviewCreateRequest request);

    /** Latest reviews of a pharmacy, newest first. */
    List<ReviewResponse> listForPharmacy(Long pharmacyId);

    /** Edit the user's own review; the pharmacy average is corrected. */
    ReviewResponse update(Long userId, Long reservationId, ReviewCreateRequest request);
}