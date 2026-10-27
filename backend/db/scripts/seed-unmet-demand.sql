-- Demo unmet demand for Sartel 80 Tablet (id 6274): 2 clusters near the college + 4 isolated noise points.
-- Re-run to refresh timestamps (keeps everything inside the 7-day window). Safe to re-run.

-- 1. Only Andheri Chemist stocks the medicine, so gap_km is a real A* distance (~4-5 km) and not null.
UPDATE inventory SET quantity = 0
WHERE medicine_id = 6274
  AND pharmacy_id <> (SELECT pharmacy_id FROM pharmacies WHERE name = 'Andheri Chemist');

INSERT INTO inventory (pharmacy_id, medicine_id, quantity, price, expiry_date)
SELECT pharmacy_id, 6274, 25, 165.00, CURRENT_DATE + 365
FROM pharmacies WHERE name = 'Andheri Chemist'
ON CONFLICT (pharmacy_id, medicine_id) DO UPDATE SET quantity = 25;

-- 2. Failed searches
DELETE FROM search_logs WHERE medicine_id = 6274 AND result_found = FALSE;

INSERT INTO search_logs (user_id, medicine_id, latitude, longitude, result_found, searched_at)
SELECT (u.ids)[1 + (g.i % GREATEST(cardinality(u.ids), 1))],
       6274, g.lat, g.lng, FALSE,
       NOW() - (g.i % 6) * INTERVAL '1 day' - (g.i % 5) * INTERVAL '1 hour'
FROM (
    -- Cluster A: college area (24 searches, ~150 m spread)
    SELECT i, 19.0751 + 0.0013 * sqrt(i / 24.0) * sin((i * 2.399963)::float8) AS lat,
              72.8347 + 0.0013 * sqrt(i / 24.0) * cos((i * 2.399963)::float8) AS lng
    FROM generate_series(1, 24) AS i
    UNION ALL
    -- Cluster B: Carter Road side (14 searches), ~1.4 km from A
    SELECT i + 50, 19.0690 + 0.0013 * sqrt(i / 14.0) * sin((i * 2.399963)::float8),
                   72.8230 + 0.0013 * sqrt(i / 14.0) * cos((i * 2.399963)::float8)
    FROM generate_series(1, 14) AS i
    UNION ALL
    -- Noise: 4 isolated searches
    SELECT * FROM (VALUES (101, 19.0850::float8, 72.8480::float8),
                          (102, 19.0560, 72.8400),
                          (103, 19.0820, 72.8250),
                          (104, 19.0620, 72.8400)) AS n(i, lat, lng)
) g
CROSS JOIN (SELECT COALESCE(array_agg(id ORDER BY id), '{}'::bigint[]) AS ids
            FROM users WHERE role = 'PATIENT' AND is_deleted = FALSE) u;