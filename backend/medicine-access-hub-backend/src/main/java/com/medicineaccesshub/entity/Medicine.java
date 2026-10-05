package com.medicineaccesshub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
}