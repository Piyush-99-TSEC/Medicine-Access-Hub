-- V11: Output of the scheduled DBSCAN run (unmet demand mapping)
-- Every run writes its clusters with the same computed_at; endpoints read the latest computed_at
-- gap_km / nearest_pharmacy_id are null when no pharmacy stocks the medicine

CREATE TABLE demand_clusters (
    id                  BIGSERIAL PRIMARY KEY,
    medicine_id         BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    centroid_lat        DOUBLE PRECISION NOT NULL,
    centroid_lng        DOUBLE PRECISION NOT NULL,
    search_count        INT NOT NULL,
    distinct_users      INT NOT NULL,
    gap_km              DOUBLE PRECISION,
    nearest_pharmacy_id BIGINT REFERENCES pharmacies(pharmacy_id) ON DELETE SET NULL,
    computed_at         TIMESTAMP NOT NULL
);

CREATE INDEX idx_demand_clusters_computed ON demand_clusters(computed_at);