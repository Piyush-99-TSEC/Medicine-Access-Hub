from fastapi import FastAPI
from app.core.state import load_state
from app.search.router import router as search_router
from app.ocr.router import router as ocr_router
from app import health

app = FastAPI()
app.include_router(search_router)
app.include_router(ocr_router)
app.include_router(health.router)


@app.on_event("startup")
def startup():
    load_state()