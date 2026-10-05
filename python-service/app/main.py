from fastapi import FastAPI
from pydantic import BaseModel
from app.data_loader import load_medicines
from app.matcher import MedicineMatcher

app = FastAPI()
state = {}


class SearchRequest(BaseModel):
    queries: list[str]


def build_index():
    df = load_medicines()
    return MedicineMatcher().build(df), len(df)


@app.on_event("startup")
def startup():
    state["matcher"], state["count"] = build_index()


@app.post("/search")
def search(req: SearchRequest):
    return state["matcher"].search_many(req.queries)


@app.post("/reload")
def reload():
    matcher, count = build_index()
    state["matcher"], state["count"] = matcher, count
    return {"count": count}


@app.get("/health")
def health():
    return {"status": "ok", "medicines": state["count"]}