from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.state import state
from app.routing.astar import astar
from app.routing.graph import nearest_node

router = APIRouter()


class Point(BaseModel):
    lat: float
    lng: float


class RouteRequest(BaseModel):
    origin: Point
    destination: Point


@router.post("/route")
def route(req: RouteRequest):
    G = state["graph"]
    start = nearest_node(G, req.origin.lat, req.origin.lng)
    goal = nearest_node(G, req.destination.lat, req.destination.lng)
    dist, path = astar(G, start, goal)
    if dist is None:
        raise HTTPException(404, "No road route found")
    return {"distanceKm": round(dist / 1000, 3), "path": [[G.nodes[n]["y"], G.nodes[n]["x"]] for n in path]}