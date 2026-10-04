package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.request.PharmacyRegisterRequest;
import com.medicineaccesshub.dto.request.PharmacyUpdateRequest;
import com.medicineaccesshub.dto.response.PharmacyResponse;

import java.util.List;

public interface PharmacyService {

    PharmacyResponse registerPharmacy(Long ownerUserId, PharmacyRegisterRequest request);

    PharmacyResponse getMyPharmacy(Long ownerUserId);

    PharmacyResponse updateMyPharmacy(Long ownerUserId, PharmacyUpdateRequest request);

    PharmacyResponse getVerifiedPharmacy(Long pharmacyId);

    List<PharmacyResponse> listPharmacies(String status);

    PharmacyResponse verifyPharmacy(Long pharmacyId);

    void rejectPharmacy(Long pharmacyId);
}
