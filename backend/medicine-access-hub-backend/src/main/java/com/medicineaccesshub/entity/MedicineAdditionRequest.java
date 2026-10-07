package com.medicineaccesshub.entity;

import com.medicineaccesshub.enums.MedicineRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineAdditionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pharmacy_id", nullable = false)
    private Pharmacy pharmacy;

    @Column(name = "brand_name", nullable = false, length = 150)
    private String brandName;

    @Column(name = "salt_composition", nullable = false, length = 200)
    private String saltComposition;

    @Column(length = 100)
    private String strength;

    @Column(name = "dosage_form", length = 50)
    private String dosageForm;

    @Column(length = 150)
    private String manufacturer;

    @Column(name = "pack_size", length = 100)
    private String packSize;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(name = "rx_required", nullable = false)
    private Boolean rxRequired;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MedicineRequestStatus status = MedicineRequestStatus.PENDING;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    /** Set when approved: the medicine created in the master table. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}