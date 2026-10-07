package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.entity.Medicine;
import com.medicineaccesshub.entity.Pharmacy;
import com.medicineaccesshub.entity.Reservation;
import com.medicineaccesshub.entity.User;
import com.medicineaccesshub.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Two factories because each list query fetches different relations:
 * forCustomer reads pharmacy + medicine, forPharmacy reads user + medicine.
 * Each touches only what its query fetched, so no lazy loads (no N+1).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {

    private Long id;
    private ReservationStatus status;
    private Integer quantity;
    private LocalDateTime expiresAt;
    private LocalDateTime pickupBy;
    /** Customer view: true once this reservation has been reviewed. */
    private Boolean reviewed;
    private LocalDateTime createdAt;
    private Integer myRating;
    private String myComment;

    private Long medicineId;
    private String medicineName;

    // customer view
    private Long pharmacyId;
    private String pharmacyName;
    private String pharmacyAddress;
    private String pharmacyPhone;
    private Double pharmacyLatitude;
    private Double pharmacyLongitude;

    // pharmacy view
    private String customerName;
    private String customerPhone;

    public static ReservationResponse forCustomer(Reservation r) {
        Pharmacy p = r.getPharmacy();
        return base(r)
                .pharmacyId(p.getId())
                .pharmacyName(p.getName())
                .pharmacyAddress(p.getAddress())
                .pharmacyPhone(p.getContactPhone())
                .pharmacyLatitude(p.getLatitude())
                .pharmacyLongitude(p.getLongitude())
                .build();
    }

    public static ReservationResponse forPharmacy(Reservation r) {
        User u = r.getUser();
        return base(r)
                .customerName(u.getName())
                .customerPhone(u.getPhone())
                .build();
    }

    private static ReservationResponseBuilder base(Reservation r) {
        Medicine m = r.getMedicine();
        return ReservationResponse.builder()
                .id(r.getId())
                .status(r.getStatus())
                .quantity(r.getQuantity())
                .expiresAt(r.getExpiresAt())
                .pickupBy(r.getPickupBy())
                .createdAt(r.getCreatedAt())
                .medicineId(m.getId())
                .medicineName(m.getBrandName());
    }
}