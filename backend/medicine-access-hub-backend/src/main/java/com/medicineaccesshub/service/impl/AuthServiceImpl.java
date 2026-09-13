package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.request.LoginInitRequest;
import com.medicineaccesshub.dto.request.LoginVerifyRequest;
import com.medicineaccesshub.dto.request.RegisterInitRequest;
import com.medicineaccesshub.dto.request.RegisterVerifyRequest;
import com.medicineaccesshub.dto.request.ResendOtpRequest;
import com.medicineaccesshub.dto.response.AuthResponse;
import com.medicineaccesshub.dto.response.UserProfileResponse;
import com.medicineaccesshub.entity.OtpVerification;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.EmailType;
import com.medicineaccesshub.enums.Role;
import com.medicineaccesshub.exception.BadRequestException;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.mapper.UserMapper;
import com.medicineaccesshub.repository.UserRepository;
import com.medicineaccesshub.security.JwtUtil;
import com.medicineaccesshub.service.AuthService;
import com.medicineaccesshub.service.EmailService;
import com.medicineaccesshub.service.OTPService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orchestrates the 2-step registration and 2-factor authentication (login) flows.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final OTPService otpService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public String initiateRegistration(RegisterInitRequest request) {
        if (request.getRole() != Role.PATIENT && request.getRole() != Role.PHARMACY_OWNER) {
            throw new BadRequestException("Self-registration is only allowed for PATIENT or PHARMACY_OWNER roles");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .map(existing -> {
                    if (Boolean.TRUE.equals(existing.getEmailVerified())) {
                        throw new BadRequestException("An account with this email already exists");
                    }
                    // Re-use the still-pending (unverified) account and refresh its details.
                    existing.setName(request.getName());
                    existing.setPassword(passwordEncoder.encode(request.getPassword()));
                    existing.setPhone(request.getPhone());
                    existing.setRole(request.getRole());
                    return existing;
                })
                .orElseGet(() -> User.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .phone(request.getPhone())
                        .role(request.getRole())
                        .emailVerified(false)
                        .isDeleted(false)
                        .build());

        User savedUser = userRepository.save(user);

        OtpVerification otp = otpService.generateAndSaveOtp(savedUser, EmailType.REGISTRATION_OTP);
        emailService.sendOtpEmail(savedUser, otp.getOtpCode(), EmailType.REGISTRATION_OTP);

        log.info("Registration initiated for email={}", savedUser.getEmail());
        return "An OTP has been sent to " + savedUser.getEmail() + ". Please verify to activate your account.";
    }

    @Override
    @Transactional
    public AuthResponse verifyRegistration(RegisterVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("This email has already been verified. Please log in instead.");
        }

        boolean verified = otpService.verifyOtp(user, request.getOtp(), EmailType.REGISTRATION_OTP);
        if (!verified) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        user.setEmailVerified(true);
        User updatedUser = userRepository.save(user);

        emailService.sendWelcomeEmail(updatedUser);

        log.info("Registration completed for email={} role={}", updatedUser.getEmail(), updatedUser.getRole());
        return buildAuthResponse(updatedUser);
    }

    @Override
    @Transactional
    public String initiateLogin(LoginInitRequest request) {
        User user = userRepository.findByEmailAndIsDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid email or password");
        }

        OtpVerification otp = otpService.generateAndSaveOtp(user, EmailType.LOGIN_OTP);
        emailService.sendOtpEmail(user, otp.getOtpCode(), EmailType.LOGIN_OTP);

        log.info("Login OTP dispatched for email={}", user.getEmail());
        return "An OTP has been sent to " + user.getEmail() + ". Please verify to complete login.";
    }

    @Override
    @Transactional
    public AuthResponse verifyLogin(LoginVerifyRequest request) {
        User user = userRepository.findByEmailAndIsDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or OTP"));

        boolean verified = otpService.verifyOtp(user, request.getOtp(), EmailType.LOGIN_OTP);
        if (!verified) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        log.info("Login completed for email={} role={}", user.getEmail(), user.getRole());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public String resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        EmailType purpose = request.getPurpose();

        if (purpose == EmailType.REGISTRATION_OTP && Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("This email has already been verified. Please log in instead.");
        }
        if (purpose == EmailType.PASSWORD_RESET) {
            throw new BadRequestException("Password reset is not supported by this module yet");
        }

        OtpVerification otp = otpService.generateAndSaveOtp(user, purpose);
        emailService.sendOtpEmail(user, otp.getOtpCode(), purpose);

        log.info("OTP resent for email={} purpose={}", user.getEmail(), purpose);
        return "A new OTP has been sent to " + user.getEmail();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return userMapper.toProfileResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationSeconds())
                .user(userMapper.toProfileResponse(user))
                .build();
    }
}
