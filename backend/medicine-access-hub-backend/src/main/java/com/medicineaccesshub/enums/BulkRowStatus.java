package com.medicineaccesshub.enums;

public enum BulkRowStatus {
    CREATE,            // medicine matched, pharmacy has no stock row yet
    UPDATE,            // medicine matched, existing stock row will be changed
    NOT_IN_CATALOGUE,  // no brand + strength match in the master table
    INVALID            // bad quantity, price, date or price above MRP
}