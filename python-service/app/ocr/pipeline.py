from app.core import config
from app.ocr.reader import read_lines, candidate_lines
from app.ocr.cleaner import clean_lines


def identify(image_bytes, matcher, top_n=3):
    queries = clean_lines(candidate_lines(read_lines(image_bytes)))
    totals = {}
    for res in matcher.search_many(queries, top_k=3):
        if not res["matched"]:
            continue
        for r in res["results"]:
            item = totals.setdefault(r["id"], {**r, "total": 0.0, "best": 0.0})
            item["total"] += r["score"]
            item["best"] = max(item["best"], r["score"])
    ranked = sorted(totals.values(), key=lambda x: (x["best"], x["total"]), reverse=True)[:top_n]
    candidates = [{k: c[k] for k in ("id", "brand_name", "salt_composition", "strength")} | {"score": round(c["best"], 3)} for c in ranked]
    return {"lines": queries, "candidates": candidates, "requires_confirmation": True}