package com.medicineaccesshub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyCountResponse {

    private LocalDate date;
    private long count;
}