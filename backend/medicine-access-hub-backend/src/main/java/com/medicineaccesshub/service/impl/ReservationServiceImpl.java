package com.medicineaccesshub.service.impl;

import com.medicineaccesshub.dto.request.ReservationCreateRequest;
import com.medicineaccesshub.dto.response.ReservationResponse;
import com.medicineaccesshub.entity.Medicine;
import com.medicineaccesshub.entity.Pharmacy;
import com.medicineaccesshub.entity.Reservation;
import com.medicineaccesshub.entity.Review;
import com.medicineaccesshub.enums.PharmacyStatus;
import com.medicineaccesshub.enums.ReservationStatus;
import com.medicineaccesshub.exception.BadRequestException;
import com.medicineaccesshub.exception.ResourceNotFoundException;
import com.medicineaccesshub.repository.InventoryRepository;
import com.medicineaccesshub.repository.MedicineRepository;
import com.medicineaccesshub.repository.PharmacyRepository;
import com.medicineaccesshub.repository.ReservationRepository;
import com.medicineaccesshub.repository.UserRepository;
import com.medicineaccesshub.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.medicineaccesshub.dto.response.RouteResponse;
import com.medicineaccesshub.service.PythonService;
import com.medicineaccesshub.repository.ReviewRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.medicineaccesshub.dto.response.DailyCountResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private static final long RESPONSE_WINDOW_MINUTES = 15;
    private static final long PICKUP_WINDOW_HOURS = 2;
    private static final List<ReservationStatus> ACTIVE =
            List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final ReservationRepository reservationRepository;
    private final InventoryRepository inventoryRepository;
    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final PythonService pythonService;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public ReservationResponse create(Long userId, ReservationCreateRequest request) {
        Pharmacy pharmacy = pharmacyRepository.findById(request.getPharmacyId())
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacy", "id", request.getPharmacyId()));
        if (pharmacy.getStatus() != PharmacyStatus.VERIFIED) {
            throw new BadRequestException("This pharmacy is not accepting reservations");
        }
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", request.getMedicineId()));

        // Stock is only checked here; it is held when the pharmacy accepts.
        boolean inStock = inventoryRepository.findByPharmacyIdAndMedicineId(pharmacy.getId(), medicine.getId())
                .map(i -> i.getQuantity() >= request.getQuantity())
                .orElse(false);
        if (!inStock) {
            throw new BadRequestException("Not enough stock available at this pharmacy");
        }
        if (reservationRepository.existsByUserIdAndPharmacyIdAndMedicineIdAndStatusIn(
                userId, pharmacy.getId(), medicine.getId(), ACTIVE)) {
            throw new BadRequestException("You already have an active reservation for this medicine here");
        }

        Reservation saved = reservationRepository.save(Reservation.builder()
                .user(userRepository.getReferenceById(userId))
                .pharmacy(pharmacy)
                .medicine(medicine)
                .quantity(request.getQuantity())
                .expiresAt(LocalDateTime.now().plusMinutes(RESPONSE_WINDOW_MINUTES))
                .build());
        return ReservationResponse.forCustomer(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> listMine(Long userId) {
        Map<Long, Review> reviews = reviewRepository.findByUserWithReservation(userId).stream()
                .collect(Collectors.toMap(rv -> rv.getReservation().getId(), rv -> rv));
        return reservationRepository.findByUserWithDetails(userId).stream()
                .map(r -> {
                    ReservationResponse res = ReservationResponse.forCustomer(r);
                    Review rv = reviews.get(r.getId());
                    res.setReviewed(rv != null);
                    if (rv != null) {
                        res.setMyRating(rv.getRating());
                        res.setMyComment(rv.getComment());
                    }
                    return res;
                }).toList();
    }

    @Override
    @Transactional
    public ReservationResponse cancel(Long userId, Long reservationId) {
        Reservation r = reservationRepository.findByIdWithDetails(reservationId)
                .filter(x -> x.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
        if (r.getStatus() != ReservationStatus.PENDING && r.getStatus() != ReservationStatus.CONFIRMED) {
            throw new BadRequestException("This reservation can no longer be cancelled");
        }
        if (r.getStatus() == ReservationStatus.CONFIRMED) {
            restoreStock(r);
        }
        r.setStatus(ReservationStatus.CANCELLED);
        return ReservationResponse.forCustomer(r);
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public RouteResponse getRoute(Long userId, Long reservationId, double lat, double lng) {
        Reservation r = reservationRepository.findByIdWithDetails(reservationId)
                .filter(x -> x.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
        if (r.getStatus() != ReservationStatus.CONFIRMED) {
            throw new BadRequestException("Route is available once the pharmacy accepts your reservation");
        }
        Pharmacy p = r.getPharmacy();
        return pythonService.route(lat, lng, p.getLatitude(), p.getLongitude())
                .map(m -> RouteResponse.builder()
                        .distanceKm(((Number) m.get("distanceKm")).doubleValue())
                        .path((List<List<Double>>) m.get("path"))
                        .build())
                .orElseThrow(() -> new BadRequestException("Route is unavailable right now"));
    }
    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> listForMyPharmacy(Long ownerUserId, ReservationStatus status) {
        Pharmacy pharmacy = requireMyPharmacy(ownerUserId);
        List<ReservationStatus> statuses = status == null ? ACTIVE : List.of(status);
        return reservationRepository.findByPharmacyAndStatusWithDetails(pharmacy.getId(), statuses).stream()
                .map(ReservationResponse::forPharmacy).toList();
    }

    @Override
    @Transactional
    public ReservationResponse accept(Long ownerUserId, Long reservationId) {
        Reservation r = findOwnedReservation(ownerUserId, reservationId);
        requireStatus(r, ReservationStatus.PENDING, "Only pending requests can be accepted");
        if (r.getExpiresAt().isBefore(LocalDateTime.now())) {
            r.setStatus(ReservationStatus.EXPIRED);
            throw new BadRequestException("This request has expired");
        }
        int held = inventoryRepository.reduceStock(r.getPharmacy().getId(), r.getMedicine().getId(), r.getQuantity());
        if (held == 0) {
            throw new BadRequestException("Not enough stock to hold this reservation");
        }
        r.setStatus(ReservationStatus.CONFIRMED);
        r.setPickupBy(LocalDateTime.now().plusHours(PICKUP_WINDOW_HOURS));
        return ReservationResponse.forPharmacy(r);
    }

    @Override
    @Transactional
    public ReservationResponse reject(Long ownerUserId, Long reservationId) {
        Reservation r = findOwnedReservation(ownerUserId, reservationId);
        requireStatus(r, ReservationStatus.PENDING, "Only pending requests can be rejected");
        r.setStatus(ReservationStatus.REJECTED);
        return ReservationResponse.forPharmacy(r);
    }

    @Override
    @Transactional
    public ReservationResponse markCollected(Long ownerUserId, Long reservationId) {
        Reservation r = findOwnedReservation(ownerUserId, reservationId);
        requireStatus(r, ReservationStatus.CONFIRMED, "Only confirmed reservations can be collected");
        r.setStatus(ReservationStatus.COLLECTED);
        return ReservationResponse.forPharmacy(r);
    }

    @Override
    @Transactional
    public void expireStale() {
        LocalDateTime now = LocalDateTime.now();
        int pending = reservationRepository.expirePending(now);
        List<Reservation> unclaimed = reservationRepository.findConfirmedPastPickup(now);
        for (Reservation r : unclaimed) {
            restoreStock(r);
            r.setStatus(ReservationStatus.EXPIRED);
        }
        if (pending > 0 || !unclaimed.isEmpty()) {
            log.info("Reservations expired: pending={} unclaimed={}", pending, unclaimed.size());
        }
    }

    private Pharmacy requireMyPharmacy(Long ownerUserId) {
        return pharmacyRepository.findByOwnerId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("You have not registered a pharmacy yet"));
    }

    // Another pharmacy's reservation is reported as "not found", never as "forbidden".
    private Reservation findOwnedReservation(Long ownerUserId, Long reservationId) {
        Pharmacy pharmacy = requireMyPharmacy(ownerUserId);
        return reservationRepository.findByIdWithDetails(reservationId)
                .filter(r -> r.getPharmacy().getId().equals(pharmacy.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
    }

    private void requireStatus(Reservation r, ReservationStatus expected, String message) {
        if (r.getStatus() != expected) {
            throw new BadRequestException(message);
        }
    }

    private void restoreStock(Reservation r) {
        inventoryRepository.restoreStock(r.getPharmacy().getId(), r.getMedicine().getId(), r.getQuantity());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyCountResponse> dailyCountsForMyPharmacy(Long ownerUserId, int days) {
        int range = Math.min(Math.max(days, 1), 30);
        Pharmacy pharmacy = requireMyPharmacy(ownerUserId);
        LocalDate first = LocalDate.now().minusDays(range - 1L);

        Map<LocalDate, Long> counts = reservationRepository.countPerDay(pharmacy.getId(), first.atStartOfDay()).stream()
                .collect(Collectors.toMap(ReservationRepository.DayCount::getDay, ReservationRepository.DayCount::getTotal));
        return first.datesUntil(LocalDate.now().plusDays(1))
                .map(d -> new DailyCountResponse(d, counts.getOrDefault(d, 0L)))
                .toList();
    }
}