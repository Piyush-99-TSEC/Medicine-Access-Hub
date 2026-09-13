package com.medicineaccesshub.repository;

import com.medicineaccesshub.entity.OtpVerification;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.EmailType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findFirstByUserAndOtpTypeOrderByCreatedAtDesc(User user, EmailType otpType);

    List<OtpVerification> findByUserAndOtpTypeAndIsVerifiedFalse(User user, EmailType otpType);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.isVerified = true " +
            "WHERE o.user = :user AND o.otpType = :otpType AND o.isVerified = false")
    void invalidateAllByUserAndOtpType(@Param("user") User user, @Param("otpType") EmailType otpType);

    void deleteByUser(User user);
}
