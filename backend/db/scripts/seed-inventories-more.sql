-- Extra demo stock: ~30% of the catalogue + all Dolo products.
-- Each pharmacy lists ~60% of those; ~10% of listed rows are out of stock (qty 0).
-- Deterministic, safe to re-run, and never overwrites existing rows (so the first seed stays as is).

INSERT INTO inventory (pharmacy_id, medicine_id, quantity, price, expiry_date)
SELECT p.pharmacy_id,
       m.id,
       CASE WHEN h.bucket < 50 THEN 10 + (h.bucket % 50) ELSE 0 END,
       m.mrp,
       CURRENT_DATE + (90 + (h.raw % 400))
FROM medicines m
CROSS JOIN pharmacies p
CROSS JOIN LATERAL (
    SELECT abs(hashtext(p.name || m.id::text)) AS raw,
           abs(hashtext(p.name || m.id::text)) % 100 AS bucket
) h
WHERE p.is_verified = TRUE
  AND (abs(hashtext('sample' || m.id::text)) % 100 < 30 OR m.brand_name ILIKE 'Dolo%')
  AND h.bucket < 60
ON CONFLICT (pharmacy_id, medicine_id) DO NOTHING;