import re
from app.ocr.reader import read_lines

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

def identify_prescription(image_bytes, matcher, top_n=3):
    entries = medicine_entries(read_lines(image_bytes, False))
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