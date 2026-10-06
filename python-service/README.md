# PharmaConnect Python Service

Stateless FastAPI service: typo-tolerant medicine search, strip OCR and prescription recognition.

## Run

```
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Docs at http://127.0.0.1:8000/docs. Tests: `python -m pytest -q`

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| MEDICINES_SOURCE | csv | `csv` or `db` |
| CSV_PATH | dataset/medicines.csv | CSV location |
| DB_URL | | `postgresql+psycopg2://user:pass@localhost:5432/medicine_access_hub` |
| MATCH_THRESHOLD | 0.5 | Minimum score to count as a match |
| TOP_K | 5 | Results per query |
| GROQ_API_KEY | | Enables vision mode for handwritten prescriptions |
| GROQ_VISION_MODEL | qwen/qwen3.8-27b | Groq vision model |
| GRAPH_PATH | cache/bandra.graphml | Saved road graph file |
| GRAPH_LAT | 19.08 | Graph centre latitude |
| GRAPH_LNG | 72.84 | Graph centre longitude |
| GRAPH_DIST | 10000 | Graph radius in metres |

## Endpoints

- `POST /search` with `{"queries": ["paracetmol"]}`: matches per query.
- `POST /reload`: reloads medicines and rebuilds the index.
- `GET /health`: medicine count.
- `POST /ocr`: medicine strip image to 1-3 candidates.
- `POST /prescription`: auto mode (RapidOCR for clear printed text, Groq vision otherwise). The response has `source`.
- `POST /prescription/offline`: RapidOCR only, no outside API.
- `POST /prescription/handwritten`: forces Groq vision.
- `POST /rank`: ranks pharmacies with the weighted sum model (distance 0.35, stock 0.25, price 0.20, rating 0.15, open now 0.05). Distance is the A* road distance. Open pharmacies are listed first.
- `POST /route`: A* road route between two points, returned as `distanceKm` and a `path` of `[lat, lng]` pairs for the map.

OCR endpoints always return `requires_confirmation: true`. The user must confirm each candidate before any search runs.

## Road graph

The road network is downloaded once from OpenStreetMap (OSMnx) on first start if the file at `GRAPH_PATH` is missing, then loaded from disk. The first start can take a few minutes. `cache/` is gitignored.

## Privacy

Vision mode sends the prescription image to Groq. Use dummy prescriptions, or the offline endpoint.