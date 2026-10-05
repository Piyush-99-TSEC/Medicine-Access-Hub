from fastapi import APIRouter
from app.core.state import state

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "medicines": state["count"]}