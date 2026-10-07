-- V8: Stored with avg_rating so lists can show "4.2 (12 reviews)" without counting rows
ALTER TABLE pharmacies ADD COLUMN review_count INT NOT NULL DEFAULT 0;