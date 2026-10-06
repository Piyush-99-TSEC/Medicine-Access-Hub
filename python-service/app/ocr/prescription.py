import re
import os
from app.ocr.vision import extract_medicines
from app.ocr.reader import read_lines, read_scored

FORM = r"(?:tab|tabs|tablet|cap|caps|capsule|syp|syr|syrup|inj|drops|oint|gel|cream)"
LINE = re.compile(rf"^\s*(?:\d+\s*[\).]\s*)?(?:{FORM}\b\.?|syrup|syr|syp)\s*(.+)$", re.I)

def medicine_names(lines):
    names = []
    for line in lines:
        m = LINE.match(line.strip())
        if m:
            names.append(re.sub(r"(?<=[A-Za-z])(?=\d)", " ", m.group(1)).strip())
    return names


SKIP_HINT = re.compile(r"morning|night|noon|days?|tot|food", re.I)


def medicine_entries(lines):
    entries = []
    for line in lines:
        line = line.strip()
        m = LINE.match(line)
        if m:
            name = re.sub(r"(?<=[A-Za-z])(?=\d)", " ", m.group(1)).strip()
            entries.append({"name": name, "hint": []})
        elif entries and re.search(r"mg|mcg", line, re.I) and not SKIP_HINT.search(line):
            entries[-1]["hint"].append(line)
    return entries

def match_entries(entries, matcher, top_n=3):
    queries = [f"{e['name']} {' '.join(e['hint'])}" for e in entries]
    medicines = []
    for e, res in zip(entries, matcher.search_many(queries, top_k=top_n * 3)):
        seen, cands = set(), []
        for r in res["results"]:
            key = (r["brand_name"], r["salt_composition"], r["strength"])
            if key not in seen:
                seen.add(key)
                cands.append({k: r[k] for k in ("id", "brand_name", "salt_composition", "strength", "score")})
        medicines.append({"query": e["name"], "matched": res["matched"], "candidates": cands[:top_n]})
    return {"medicines": medicines, "requires_confirmation": True}


def identify_prescription(image_bytes, matcher, top_n=3):
    return match_entries(medicine_entries(read_lines(image_bytes, False)), matcher, top_n)


def identify_handwritten(image_bytes, matcher, top_n=3):
    entries, seen = [], set()
    for item in extract_medicines(image_bytes):
        name = re.sub(rf"^\s*{FORM}\b\.?\s*", "", item.get("name", ""), flags=re.I).strip()
        if name and name.lower() not in seen:
            seen.add(name.lower())
            entries.append({"name": name, "hint": [item["salt"]] if item.get("salt") else []})
    return match_entries(entries, matcher, top_n)

def medicine_confidence(scored):
    s = [sc for text, sc in scored if LINE.match(text.strip())]
    return round(sum(s) / len(s), 3) if s else 0.0

def identify_auto(image_bytes, matcher, top_n=3):
    scored = read_scored(image_bytes)
    entries = medicine_entries([t for t, _ in scored])
    conf = sum(s for _, s in scored) / len(scored) if scored else 0
    if len(entries) >= 2 and conf >= 0.8:
        return {**match_entries(entries, matcher, top_n), "source": "ocr"}
    if os.getenv("GROQ_API_KEY"):
        try:
            result = identify_handwritten(image_bytes, matcher, top_n)
            if result["medicines"]:
                return {**result, "source": "vision"}
        except Exception:
            pass
    return {**match_entries(entries, matcher, top_n), "source": "ocr"}