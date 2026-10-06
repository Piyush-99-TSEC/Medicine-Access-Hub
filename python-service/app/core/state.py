from app.data.loader import load_medicines
from app.search.matcher import MedicineMatcher
from app.routing.graph import load_graph

state = {}


def load_state():
    df = load_medicines()
    state["matcher"] = MedicineMatcher().build(df)
    state["count"] = len(df)
    state["graph"] = load_graph()