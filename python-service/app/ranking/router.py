from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from app.ranking.wsm import rank
from app.ranking.wsm import rank, haversine_km

from app.core.state import state
from app.routing.astar import astar
from app.routing.graph import nearest_node

router = APIRouter()


class Pharmacy(BaseModel):
    model_config = ConfigDict(extra="allow")
    pharmacyId: int
    latitude: float
    longitude: float
    openTime: str
    closeTime: str
    quantity: int
    price: float
    avgRating: float | None = None
    distanceKm: float | None = None


class RankRequest(BaseModel):
    lat: float
    lng: float
    now: str | None = None
    pharmacies: list[Pharmacy]

@router.post("/rank")
def rank_pharmacies(req: RankRequest):
    pharmacies = [p.model_dump() for p in req.pharmacies]
    G = state.get("graph")
    if G is not None:
        start = nearest_node(G, req.lat, req.lng)
        for p in pharmacies:
            dist, _ = astar(G, start, nearest_node(G, p["latitude"], p["longitude"]))
            if dist is not None:
                p["straightKm"] = round(haversine_km(req.lat, req.lng, p["latitude"], p["longitude"]), 3)
                p["distanceKm"] = round(dist / 1000, 3)
    return rank(req.lat, req.lng, pharmacies, req.now)