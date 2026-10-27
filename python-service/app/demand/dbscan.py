import numpy as np
from sklearn.cluster import DBSCAN
from app.routing.astar import astar
from app.routing.graph import nearest_node

EARTH_RADIUS_M = 6371000.0


def gap_km(G, lat, lng, stockists):
    """A* road distance (km) from a point to the nearest pharmacy holding stock, plus that pharmacy's id."""
    if G is None or not stockists:
        return None, None
    start = nearest_node(G, lat, lng)
    best, best_id = None, None
    for s in stockists:
        dist, _ = astar(G, start, nearest_node(G, s["lat"], s["lng"]))
        if dist is not None and (best is None or dist < best):
            best, best_id = dist, s["pharmacyId"]
    return (round(best / 1000, 3) if best is not None else None), best_id


def find_clusters(searches, stockists, G, eps_m=500, min_pts=10):
    """DBSCAN (haversine) per medicine over failed searches; returns (clusters, noise_count)."""
    by_med, stock_by_med = {}, {}
    for s in searches:
        by_med.setdefault(s["medicineId"], []).append(s)
    for s in stockists:
        stock_by_med.setdefault(s["medicineId"], []).append(s)

    clusters, noise = [], 0
    for med_id, pts in by_med.items():
        if len(pts) < min_pts:
            noise += len(pts)
            continue
        coords = np.radians([[p["lat"], p["lng"]] for p in pts])
        labels = DBSCAN(eps=eps_m / EARTH_RADIUS_M, min_samples=min_pts,
                        metric="haversine", algorithm="ball_tree").fit_predict(coords)
        noise += int(np.sum(labels == -1))
        for label in set(labels) - {-1}:
            members = [p for p, l in zip(pts, labels) if l == label]
            c_lat = sum(m["lat"] for m in members) / len(members)
            c_lng = sum(m["lng"] for m in members) / len(members)
            gap, pharmacy_id = gap_km(G, c_lat, c_lng, stock_by_med.get(med_id, []))
            clusters.append({
                "medicineId": med_id,
                "centroidLat": round(c_lat, 6),
                "centroidLng": round(c_lng, 6),
                "searchCount": len(members),
                "distinctUsers": len({m["userId"] for m in members if m.get("userId") is not None}),
                "gapKm": gap,
                "nearestPharmacyId": pharmacy_id,
            })
    clusters.sort(key=lambda c: c["searchCount"], reverse=True)
    return clusters, noise