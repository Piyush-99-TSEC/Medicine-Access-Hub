-- V10: Every medicine availability search (input for unmet demand mapping)
-- result_found = FALSE rows are the failed searches that get clustered with DBSCAN
-- user_id is nullable so a failed search by a guest still counts as demand

CREATE TABLE search_logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    medicine_id  BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    latitude     DOUBLE PRECISION NOT NULL,
    longitude    DOUBLE PRECISION NOT NULL,
    result_found BOOLEAN NOT NULL,
    searched_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_logs_failed ON search_logs(result_found, searched_at);
CREATE INDEX idx_search_logs_medicine ON search_logs(medicine_id, searched_at);