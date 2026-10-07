package com.medicineaccesshub.service;

import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.EmailType;

import java.time.LocalDateTime;

/** Contract for all transactional emails sent by the Medicine Access Hub backend. */
public interface EmailService {

    /** Sends a one-time-password email for the given purpose (registration or login). */
    void sendOtpEmail(User user, String otp, EmailType otpType);

    /** Sends a welcome email once a user's account has been fully verified. */
    void sendWelcomeEmail(User user);

    /** Tells a pharmacy owner that a new reservation is waiting for their response. */
    void sendReservationRequestEmail(String ownerName, String ownerEmail, String pharmacyName, String customerName, String medicineName, int quantity, LocalDateTime respondBy);
}