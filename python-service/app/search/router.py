from fastapi import APIRouter
from pydantic import BaseModel
from app.core.state import state, load_state

router = APIRouter()


class SearchRequest(BaseModel):
    queries: list[str]


@router.post("/search")
def search(req: SearchRequest):
    return state["matcher"].search_many(req.queries)


@router.post("/reload")
def reload():
    load_state()
    return {"count": state["count"]}