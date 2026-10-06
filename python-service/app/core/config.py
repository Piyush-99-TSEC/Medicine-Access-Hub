import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

MEDICINES_SOURCE = os.getenv("MEDICINES_SOURCE", "csv")
CSV_PATH = os.getenv("CSV_PATH", str(ROOT / "dataset" / "medicines.csv"))
DB_URL = os.getenv("DB_URL", "")
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD", "0.5"))
TOP_K = int(os.getenv("TOP_K", "5"))
GRAPH_PATH = os.getenv("GRAPH_PATH", str(ROOT / "python-service" / "cache" / "bandra.graphml"))
GRAPH_CENTER = (float(os.getenv("GRAPH_LAT", "19.08")), float(os.getenv("GRAPH_LNG", "72.84")))
GRAPH_DIST = int(os.getenv("GRAPH_DIST", "10000"))