-- Demo stock for every verified pharmacy.
-- Deterministic (hash-based), so re-running gives the same result.
-- ~65% of pharmacy/medicine pairs in stock, ~15% listed but out of stock (qty 0), ~20% not listed.
-- Price = the medicine's MRP. Safe to re-run: existing rows are updated, not duplicated.

INSERT INTO inventory (pharmacy_id, medicine_id, quantity, price, expiry_date)
SELECT p.pharmacy_id,
       m.id,
       CASE WHEN h.bucket < 65 THEN 10 + (h.bucket % 50) ELSE 0 END,
       m.mrp,
       CURRENT_DATE + (90 + (h.raw % 400))
FROM pharmacies p
CROSS JOIN (VALUES
    ('Dolo 650 Tablet'), ('Crocin Advance Tablet'), ('Calpol 500mg Tablet'),
    ('Augmentin 625 Duo Tablet'), ('Azithral 500 Tablet'), ('PAN 40 Tablet'),
    ('Pantop 40 Tablet'), ('Telma 40 Tablet'), ('New Okacet Tablet'),
    ('Allegra 120mg Tablet'), ('Omez 20mg Capsule'), ('Ecosprin 75 Tablet'),
    ('Thyronorm 50mcg Tablet'), ('Brufen 400 Tablet'), ('Meftal-Forte Tablet')
) AS wanted(brand)
JOIN LATERAL (
    SELECT id, mrp FROM medicines WHERE brand_name = wanted.brand ORDER BY id LIMIT 1
) m ON TRUE
CROSS JOIN LATERAL (
    SELECT abs(hashtext(p.name || wanted.brand)) AS raw,
           abs(hashtext(p.name || wanted.brand)) % 100 AS bucket
) h
WHERE p.is_verified = TRUE
  AND h.bucket < 80
ON CONFLICT (pharmacy_id, medicine_id)
DO UPDATE SET quantity = EXCLUDED.quantity,
              price = EXCLUDED.price,
              expiry_date = EXCLUDED.expiry_date;