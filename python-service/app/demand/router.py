from fastapi import APIRouter
from pydantic import BaseModel
from app.core.state import state
from app.demand.dbscan import find_clusters

router = APIRouter()


class FailedSearch(BaseModel):
    medicineId: int
    userId: int | None = None
    lat: float
    lng: float


class Stockist(BaseModel):
    medicineId: int
    pharmacyId: int
    lat: float
    lng: float


class ClusterRequest(BaseModel):
    searches: list[FailedSearch]
    stockists: list[Stockist] = []
    epsMeters: float = 500
    minPts: int = 10


@router.post("/demand/clusters")
def demand_clusters(req: ClusterRequest):
    clusters, noise = find_clusters(
        [s.model_dump() for s in req.searches],
        [s.model_dump() for s in req.stockists],
        state.get("graph"), req.epsMeters, req.minPts)
    return {"clusters": clusters, "noiseCount": noise}