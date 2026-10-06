from app.ranking.wsm import rank


def ph(i, dist, qty, price, rating, open_="00:00", close="23:59"):
    return {"pharmacyId": i, "latitude": 19.05, "longitude": 72.83, "openTime": open_,
            "closeTime": close, "avgRating": rating, "quantity": qty, "price": price, "distanceKm": dist}


def test_nearest_cheapest_wins():
    r = rank(19.05, 72.83, [ph(2, 5, 10, 80, 4), ph(1, 1, 10, 50, 4)], "12:00")
    assert r[0]["pharmacyId"] == 1


def test_closed_pharmacy_ranks_lower():
    r = rank(19.05, 72.83, [ph(1, 1, 10, 50, 4, "10:00", "20:00"), ph(2, 1, 10, 50, 4)], "23:00")
    assert r[0]["pharmacyId"] == 2 and not r[1]["isOpen"]


def test_overnight_hours():
    assert rank(19.05, 72.83, [ph(1, 1, 10, 50, 4, "10:00", "00:00")], "23:30")[0]["isOpen"]


def test_empty():
    assert rank(0, 0, []) == []