from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from app.ranking.wsm import rank

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
    return rank(req.lat, req.lng, [p.model_dump() for p in req.pharmacies], req.now)