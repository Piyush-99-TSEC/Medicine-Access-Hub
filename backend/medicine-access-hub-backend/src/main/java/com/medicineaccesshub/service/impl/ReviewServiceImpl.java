package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.request.ReviewCreateRequest;
import com.medicineaccesshub.dto.response.ReviewResponse;
import com.medicineaccesshub.entity.Reservation;
import com.medicineaccesshub.entity.Review;
import com.medicineaccesshub.enums.ReservationStatus;
import com.medicineaccesshub.exception.BadRequestException;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.PharmacyRepository;
import com.medicineaccesshub.repository.ReservationRepository;
import com.medicineaccesshub.repository.ReviewRepository;
import com.medicineaccesshub.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private static final int PAGE_SIZE = 20;

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final PharmacyRepository pharmacyRepository;

    @Override
    @Transactional
    public ReviewResponse create(Long userId, Long reservationId, ReviewCreateRequest request) {
        Reservation r = reservationRepository.findByIdWithDetails(reservationId)
                .filter(x -> x.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
        if (r.getStatus() != ReservationStatus.COLLECTED) {
            throw new BadRequestException("You can review a pharmacy after collecting your medicine");
        }
        if (reviewRepository.existsByReservationId(reservationId)) {
            throw new BadRequestException("You have already reviewed this reservation");
        }

//        String comment = request.getComment() == null || request.getComment().isBlank()
//                ? null : request.getComment().trim();
        Review saved = reviewRepository.save(Review.builder()
                .reservation(r)
                .user(r.getUser())
                .pharmacy(r.getPharmacy())
                .rating(request.getRating())
                .comment(cleanComment(request.getComment()))
                .build());
        pharmacyRepository.addRating(r.getPharmacy().getId(), request.getRating());
        return ReviewResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> listForPharmacy(Long pharmacyId) {
        if (!pharmacyRepository.existsById(pharmacyId)) {
            throw new ResourceNotFoundException("Pharmacy", "id", pharmacyId);
        }
        return reviewRepository.findByPharmacyWithUser(pharmacyId, PageRequest.of(0, PAGE_SIZE)).stream()
                .map(ReviewResponse::from).toList();
    }

    @Override
    @Transactional
    public ReviewResponse update(Long userId, Long reservationId, ReviewCreateRequest request) {
        Review review = reviewRepository.findByReservationIdWithDetails(reservationId)
                .filter(x -> x.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Review", "reservationId", reservationId));
        int oldRating = review.getRating();
        review.setRating(request.getRating());
        review.setComment(cleanComment(request.getComment()));
        pharmacyRepository.adjustRating(review.getPharmacy().getId(), oldRating, request.getRating());
        return ReviewResponse.from(review);
    }

    private String cleanComment(String comment) {
        return comment == null || comment.isBlank() ? null : comment.trim();
    }
}