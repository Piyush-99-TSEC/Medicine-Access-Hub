package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String comment;
    private String reviewerName;
    private LocalDateTime createdAt;

    /** Reads review.user, so callers must load it (JOIN FETCH or already in memory). */
    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewerName(review.getUser().getName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}