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

## Endpoints

- `POST /search` with `{"queries": ["paracetmol"]}`: matches per query.
- `POST /reload`: reloads medicines and rebuilds the index.
- `GET /health`: medicine count.
- `POST /ocr`: medicine strip image to 1-3 candidates.
- `POST /prescription`: auto mode (RapidOCR for clear printed text, Groq vision otherwise). The response has `source`.
- `POST /prescription/offline`: RapidOCR only, no outside API.
- `POST /prescription/handwritten`: forces Groq vision.

OCR endpoints always return `requires_confirmation: true`. The user must confirm each candidate before any search runs.

## Privacy

Vision mode sends the prescription image to Groq. Use dummy prescriptions, or the offline endpoint.