package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.request.PharmacyRegisterRequest;
import com.medicineaccesshub.dto.request.PharmacyUpdateRequest;
import com.medicineaccesshub.dto.response.PharmacyResponse;
import com.medicineaccesshub.entity.Pharmacy;
import com.medicineaccesshub.enums.PharmacyStatus;
import com.medicineaccesshub.exception.BadRequestException;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.PharmacyRepository;
import com.medicineaccesshub.repository.UserRepository;
import com.medicineaccesshub.service.PharmacyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.Role;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyServiceImpl implements PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PharmacyResponse registerPharmacy(Long ownerUserId, PharmacyRegisterRequest request) {
        pharmacyRepository.findByOwnerId(ownerUserId).ifPresent(existing -> {
            if (existing.getStatus() == PharmacyStatus.REJECTED || existing.getStatus() == PharmacyStatus.BLOCKED) {
                throw new BadRequestException("Your pharmacy registration was " + existing.getStatus()
                        + ". Please contact support.");
            }
            throw new BadRequestException("You have already registered a pharmacy");
        });

        String licenceNo = request.getLicenceNo().trim().toUpperCase(Locale.ROOT);
        if (pharmacyRepository.existsByLicenceNo(licenceNo)) {
            throw new BadRequestException("A pharmacy with this licence number is already registered");
        }

        Pharmacy pharmacy = Pharmacy.builder()
                .owner(userRepository.getReferenceById(ownerUserId))
                .name(request.getName().trim())
                .ownerName(request.getOwnerName().trim())
                .email(request.getEmail().trim())
                .contactPhone(request.getContactPhone().trim())
                .gstNo(request.getGstNo().trim().toUpperCase(Locale.ROOT))
                .status(PharmacyStatus.PENDING)
                .licenceNo(licenceNo)
                .address(request.getAddress().trim())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .openTime(request.getOpenTime())
                .closeTime(request.getCloseTime())
                .isVerified(false)
                .build();

        Pharmacy saved = pharmacyRepository.save(pharmacy);
        log.info("Pharmacy registered id={} ownerUserId={} (pending verification)", saved.getId(), ownerUserId);
        return PharmacyResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PharmacyResponse getMyPharmacy(Long ownerUserId) {
        return PharmacyResponse.fromEntity(findOwned(ownerUserId));
    }

    @Override
    @Transactional
    public PharmacyResponse updateMyPharmacy(Long ownerUserId, PharmacyUpdateRequest request) {
        Pharmacy pharmacy = findOwned(ownerUserId);

        if (pharmacy.getStatus() == PharmacyStatus.REJECTED || pharmacy.getStatus() == PharmacyStatus.BLOCKED) {
            throw new BadRequestException("Your pharmacy cannot be edited (" + pharmacy.getStatus() + ")");
        }

        pharmacy.setName(request.getName().trim());
        pharmacy.setOwnerName(request.getOwnerName().trim());
        pharmacy.setEmail(request.getEmail().trim());
        pharmacy.setContactPhone(request.getContactPhone().trim());
        pharmacy.setAddress(request.getAddress().trim());
        pharmacy.setLatitude(request.getLatitude());
        pharmacy.setLongitude(request.getLongitude());
        pharmacy.setOpenTime(request.getOpenTime());
        pharmacy.setCloseTime(request.getCloseTime());

        return PharmacyResponse.fromEntity(pharmacyRepository.save(pharmacy));
    }

    @Override
    @Transactional(readOnly = true)
    public PharmacyResponse getVerifiedPharmacy(Long pharmacyId) {
        return pharmacyRepository.findByIdAndIsVerifiedTrue(pharmacyId)
                .map(PharmacyResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy", "id", pharmacyId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyResponse> listPharmacies(String status) {
        PharmacyStatus parsed;
        try {
            parsed = PharmacyStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Status must be PENDING, VERIFIED, REJECTED or BLOCKED");
        }

        return pharmacyRepository
                .findByStatusOrderByCreatedAtDesc(parsed)
                .stream()
                .map(PharmacyResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public PharmacyResponse verifyPharmacy(Long pharmacyId) {
        Pharmacy pharmacy = findById(pharmacyId);
        if (pharmacy.getStatus() != PharmacyStatus.PENDING) {
            throw new BadRequestException("Only pending pharmacies can be verified");
        }
        pharmacy.setStatus(PharmacyStatus.VERIFIED);
        pharmacy.setIsVerified(true);
        pharmacy.setRejectionReason(null);
        pharmacy.setReviewedAt(LocalDateTime.now());

        User owner = pharmacy.getOwner();
        if (owner != null) {
            owner.setRole(Role.PHARMACY_OWNER);
            userRepository.save(owner);
        }
        log.info("Pharmacy id={} verified", pharmacyId);
        return PharmacyResponse.fromEntity(pharmacyRepository.save(pharmacy));
    }

    // A rejected registration is deleted so the owner can correct the details and re-register.
    @Override
    @Transactional
    public void rejectPharmacy(Long pharmacyId) {
        Pharmacy pharmacy = findById(pharmacyId);
        if (pharmacy.getStatus() != PharmacyStatus.PENDING) {
            throw new BadRequestException("Only pending pharmacies can be rejected");
        }
        pharmacy.setStatus(PharmacyStatus.REJECTED);
        pharmacy.setIsVerified(false);
        pharmacy.setReviewedAt(LocalDateTime.now());
        pharmacyRepository.save(pharmacy);
        log.info("Pharmacy id={} rejected", pharmacyId);
    }

    private Pharmacy findById(Long pharmacyId) {
        return pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy", "id", pharmacyId));
    }

    private Pharmacy findOwned(Long ownerUserId) {
        return pharmacyRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("You have not registered a pharmacy yet"));
    }
}
