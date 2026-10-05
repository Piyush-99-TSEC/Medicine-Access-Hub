import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

MEDICINES_SOURCE = os.getenv("MEDICINES_SOURCE", "csv")
CSV_PATH = os.getenv("CSV_PATH", str(ROOT / "dataset" / "medicines.csv"))
DB_URL = os.getenv("DB_URL", "")
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD", "0.5"))
TOP_K = int(os.getenv("TOP_K", "5"))