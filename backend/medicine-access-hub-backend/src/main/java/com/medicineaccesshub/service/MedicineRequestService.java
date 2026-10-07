package com.medicineaccesshub.service;

import com.medicineaccesshub.dto.request.MedicineRequest;
import com.medicineaccesshub.dto.response.MedicineAdditionResponse;
import com.medicineaccesshub.enums.MedicineRequestStatus;

import java.util.List;

public interface MedicineRequestService {

    // pharmacy owner
    MedicineAdditionResponse submit(Long ownerUserId, MedicineRequest request);

    List<MedicineAdditionResponse> listMine(Long ownerUserId);

    // admin
    List<MedicineAdditionResponse> listByStatus(MedicineRequestStatus status);

    /** Creates the medicine in the master table and marks the request APPROVED. */
    MedicineAdditionResponse approve(Long requestId);

    MedicineAdditionResponse reject(Long requestId, String reason);
}