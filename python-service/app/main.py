from fastapi import FastAPI
from app.core.state import load_state
from app.search.router import router as search_router
from app.ocr.router import router as ocr_router
from app import health
from app.ranking.router import router as rank_router 
from app.routing.router import router as route_router

app = FastAPI()
app.include_router(search_router)
app.include_router(ocr_router)
app.include_router(health.router)
app.include_router(rank_router)
app.include_router(route_router)

@app.on_event("startup")
def startup():
    load_state()