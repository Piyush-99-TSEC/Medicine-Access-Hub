package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.request.MedicineRequest;
import com.medicineaccesshub.dto.response.MedicineAdditionResponse;
import com.medicineaccesshub.dto.response.MedicineResponse;
import com.medicineaccesshub.entity.MedicineAdditionRequest;
import com.medicineaccesshub.entity.Pharmacy;
import com.medicineaccesshub.enums.MedicineRequestStatus;
import com.medicineaccesshub.enums.PharmacyStatus;
import com.medicineaccesshub.exception.BadRequestException;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.MedicineAdditionRequestRepository;
import com.medicineaccesshub.repository.MedicineRepository;
import com.medicineaccesshub.repository.PharmacyRepository;
import com.medicineaccesshub.service.MedicineRequestService;
import com.medicineaccesshub.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineRequestServiceImpl implements MedicineRequestService {

    private final MedicineAdditionRequestRepository requestRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineService medicineService;

    @Override
    @Transactional
    public MedicineAdditionResponse submit(Long ownerUserId, MedicineRequest request) {
        Pharmacy pharmacy = requireMyPharmacy(ownerUserId);
        if (pharmacy.getStatus() != PharmacyStatus.VERIFIED) {
            throw new BadRequestException("Your pharmacy must be verified before requesting medicines");
        }
        String brand = request.getBrandName().trim();
        if (requestRepository.existsByPharmacyIdAndBrandNameIgnoreCaseAndStatus(
                pharmacy.getId(), brand, MedicineRequestStatus.PENDING)) {
            throw new BadRequestException("You already have a pending request for this medicine");
        }

        MedicineAdditionRequest saved = requestRepository.save(MedicineAdditionRequest.builder()
                .pharmacy(pharmacy)
                .brandName(brand)
                .saltComposition(request.getSaltComposition().trim())
                .strength(blankToNull(request.getStrength()))
                .dosageForm(blankToNull(request.getDosageForm()))
                .manufacturer(blankToNull(request.getManufacturer()))
                .packSize(blankToNull(request.getPackSize()))
                .mrp(request.getMrp())
                .rxRequired(request.getRxRequired())
                .build());
        return MedicineAdditionResponse.forOwner(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineAdditionResponse> listMine(Long ownerUserId) {
        Pharmacy pharmacy = requireMyPharmacy(ownerUserId);
        return requestRepository.findByPharmacyWithMedicine(pharmacy.getId()).stream()
                .map(MedicineAdditionResponse::forOwner).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineAdditionResponse> listByStatus(MedicineRequestStatus status) {
        MedicineRequestStatus s = status == null ? MedicineRequestStatus.PENDING : status;
        return requestRepository.findByStatusWithPharmacy(s).stream()
                .map(MedicineAdditionResponse::forAdmin).toList();
    }

    @Override
    @Transactional
    public MedicineAdditionResponse approve(Long requestId) {
        MedicineAdditionRequest r = findPending(requestId, "Only pending requests can be approved");
        MedicineResponse created = medicineService.adminCreate(MedicineRequest.builder()
                .brandName(r.getBrandName())
                .saltComposition(r.getSaltComposition())
                .strength(r.getStrength())
                .dosageForm(r.getDosageForm())
                .manufacturer(r.getManufacturer())
                .packSize(r.getPackSize())
                .mrp(r.getMrp())
                .rxRequired(r.getRxRequired())
                .build());
        r.setMedicine(medicineRepository.getReferenceById(created.getId()));
        r.setStatus(MedicineRequestStatus.APPROVED);
        r.setReviewedAt(LocalDateTime.now());
        return MedicineAdditionResponse.forAdmin(r);
    }

    @Override
    @Transactional
    public MedicineAdditionResponse reject(Long requestId, String reason) {
        MedicineAdditionRequest r = findPending(requestId, "Only pending requests can be rejected");
        r.setStatus(MedicineRequestStatus.REJECTED);
        r.setRejectionReason(reason.trim());
        r.setReviewedAt(LocalDateTime.now());
        return MedicineAdditionResponse.forAdmin(r);
    }

    private Pharmacy requireMyPharmacy(Long ownerUserId) {
        return pharmacyRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("You have not registered a pharmacy yet"));
    }

    private MedicineAdditionRequest findPending(Long requestId, String notPendingMessage) {
        MedicineAdditionRequest r = requestRepository.findByIdWithPharmacy(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine request", "id", requestId));
        if (r.getStatus() != MedicineRequestStatus.PENDING) {
            throw new BadRequestException(notPendingMessage);
        }
        return r;
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}