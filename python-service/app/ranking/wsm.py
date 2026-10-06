from datetime import datetime
from math import asin, cos, radians, sin, sqrt

WEIGHTS = {"distance": 0.35, "stock": 0.25, "price": 0.20, "rating": 0.15, "open": 0.05}


def haversine_km(lat1, lng1, lat2, lng2):
    dlat, dlng = radians(lat2 - lat1), radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def minutes(hhmm):
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def is_open(now, open_time, close_time):
    o, c = minutes(open_time), minutes(close_time)
    return o <= now < c if c > o else now >= o or now < c


def normalize(values, benefit):
    lo, hi = min(values), max(values)
    if hi == lo:
        return [1.0] * len(values)
    return [(v - lo) / (hi - lo) if benefit else (hi - v) / (hi - lo) for v in values]


def rank(user_lat, user_lng, pharmacies, now=None):
    if not pharmacies:
        return []
    t = datetime.now()
    now = minutes(now) if now else t.hour * 60 + t.minute
    dist = [p["distanceKm"] if p.get("distanceKm") is not None
            else haversine_km(user_lat, user_lng, p["latitude"], p["longitude"]) for p in pharmacies]
    opens = [1.0 if is_open(now, p["openTime"], p["closeTime"]) else 0.0 for p in pharmacies]
    cols = {
        "distance": normalize(dist, False),
        "stock": normalize([p["quantity"] for p in pharmacies], True),
        "price": normalize([float(p["price"]) for p in pharmacies], False),
        "rating": normalize([float(p.get("avgRating") or 0) for p in pharmacies], True),
        "open": normalize(opens, True),
    }
    out = []
    for i, p in enumerate(pharmacies):
        score = sum(WEIGHTS[k] * cols[k][i] for k in WEIGHTS)
        out.append({**p, "distanceKm": round(dist[i], 3), "isOpen": bool(opens[i]), "score": round(score, 4)})
    return sorted(out, key=lambda x: (x["isOpen"], x["score"]), reverse=True)