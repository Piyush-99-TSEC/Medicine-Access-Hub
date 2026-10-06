package com.medicineaccesshub.dto.response;

import com.medicineaccesshub.entity.Inventory;
import com.medicineaccesshub.entity.Medicine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemResponse {

    public static final int LOW_STOCK_THRESHOLD = 10;

    private Long id;
    private Long medicineId;
    private String brandName;
    private String saltComposition;
    private String strength;
    private String dosageForm;
    private String manufacturer;
    private BigDecimal mrp;
    private Integer quantity;
    private BigDecimal price;
    private LocalDate expiryDate;
    private LocalDateTime updatedAt;
    private String status;

    public static InventoryItemResponse fromEntity(Inventory i) {
        Medicine m = i.getMedicine();
        int qty = i.getQuantity();
        String status = qty == 0 ? "OUT_OF_STOCK" : qty <= LOW_STOCK_THRESHOLD ? "LOW_STOCK" : "IN_STOCK";
        return InventoryItemResponse.builder()
                .id(i.getId())
                .medicineId(m.getId())
                .brandName(m.getBrandName())
                .saltComposition(m.getSaltComposition())
                .strength(m.getStrength())
                .dosageForm(m.getDosageForm())
                .manufacturer(m.getManufacturer())
                .mrp(m.getMrp())
                .quantity(qty)
                .price(i.getPrice())
                .expiryDate(i.getExpiryDate())
                .updatedAt(i.getUpdatedAt())
                .status(status)
                .build();
    }
}