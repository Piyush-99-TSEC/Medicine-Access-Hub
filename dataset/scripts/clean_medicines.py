#!/usr/bin/env python3
"""
clean_medicines.py - one-time cleaning of the Kaggle "A-Z Medicine Dataset of India"
into the PharmaConnect MEDICINE master CSV.

Run (one command):
    python clean_medicines.py --input A_Z_medicines_dataset_of_India.csv --output data/medicines.csv

Steps:
    1. Load the CSV and tidy the column names.
    2. Drop discontinued rows, rows missing name/composition/price, and duplicates.
    3. Build the output columns (salt, strength, dosage form, Rx flag).
    4. Pick a demo subset (default 8000 rows), always keeping must_include.txt brands.
    5. Write medicines.csv + a 100-row medicines_sample.csv and print a report.
"""
import argparse
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd

OUTPUT_COLUMNS = ["brand_name", "salt_composition", "strength", "dosage_form",
                  "manufacturer", "pack_size", "mrp", "rx_required"]

# ---------------------------------------------------------------------------
# Dosage form rules. First match wins, so ORDER MATTERS (e.g. "powder for
# injection" must hit Injection before Powder). Edit freely.
# ---------------------------------------------------------------------------
DOSAGE_FORM_RULES = [
    (r"inject|infusion|vaccine", "Injection"),
    (r"rotacap", "Inhaler"),                    # capsules used with a Rotahaler
    (r"\btablets?\b", "Tablet"),
    (r"\bcapsules?\b", "Capsule"),
    (r"\bsyrup\b|\bexpectorant\b|\belixir\b", "Syrup"),
    (r"\bcream\b", "Cream"),
    (r"\bointment\b", "Ointment"),
    (r"\bgel\b", "Gel"),
    (r"\blotion\b", "Lotion"),
    (r"\bsoap\b", "Soap"),
    (r"\bshampoo\b", "Shampoo"),
    (r"\bspray\b", "Spray"),
    (r"\binhaler\b", "Inhaler"),
    (r"suppositor|pessar", "Suppository"),
    (r"\bpatch(es)?\b", "Patch"),
    (r"\bpowder\b|\bgranules\b|\bsachets?\b", "Powder"),
    (r"\bdrops?\b|ophthalmic|opthalmic|\beye\b|\bear\b", "Drops"),
    (r"\bsuspension\b", "Suspension"),
    (r"\bsolution\b|\bliquid\b|\bwash\b|\bgargle\b|\brespules?\b", "Solution"),
    # Last resort: the container itself tells us it is injectable.
    (r"\bvial\b|\bampoule\b|\bsyringe\b|\bcartridge\b|\bpenfill\b|\bflexpen\b|\bpen\b", "Injection"),
]
COMPILED_FORM_RULES = [(re.compile(p), form) for p, form in DOSAGE_FORM_RULES]

# Forms a neighbourhood pharmacy sells every day; they get a small ranking bonus.
EVERYDAY_FORMS = {"Tablet", "Capsule", "Syrup", "Suspension", "Drops", "Cream", "Ointment", "Gel"}

TOP_MANUFACTURERS = 50     # how many manufacturers count as "top"
MAX_SENSIBLE_MRP = 10000   # pricier rows (cancer biologics etc.) are unlikely in a local shop


# ---------------------------------------------------------------------------
# Small text helpers
# ---------------------------------------------------------------------------
def clean_text(value):
    """Trim and collapse repeated whitespace. Missing values become ''."""
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return ""
    return " ".join(str(value).split())


def norm_key(text):
    """Lowercase, hyphens -> spaces, collapse whitespace. Used for matching."""
    return " ".join(str(text).lower().replace("-", " ").split())


def read_list_file(path):
    """Read a text file: one entry per line, skip blanks and # comments."""
    lines = Path(path).read_text(encoding="utf-8").splitlines()
    return [ln.strip() for ln in lines if ln.strip() and not ln.strip().startswith("#")]


# ---------------------------------------------------------------------------
# Composition -> salt + strength
# ---------------------------------------------------------------------------
LAST_BRACKET = re.compile(r"^(.*?)\s*\(([^()]*)\)\s*$")   # text ending in "( ... )"


def split_ingredient(text):
    """'Amoxycillin  (500mg)' -> ('Amoxycillin', '500mg').

    Only the LAST bracket is the strength, so 'Progesterone (Natural Micronized) (25mg)'
    keeps '(Natural Micronized)' in the salt name. A bracket with no digits
    (the dataset uses '(NA)' a lot) is not a strength.
    """
    text = clean_text(text)
    if not text:
        return "", ""
    m = LAST_BRACKET.match(text)
    if not m:
        return text, ""
    name, inside = m.group(1), m.group(2)
    if re.search(r"\d", inside):                      # looks like an amount
        strength = re.sub(r"(\d)\s+([A-Za-z%])", r"\1\2", clean_text(inside))   # '500 mg' -> '500mg'
        return clean_text(name), strength
    if inside.strip().upper() in {"NA", "N/A", "-", ""}:   # explicit "no strength"
        return clean_text(name), ""
    return text, ""                                    # e.g. '(Plain)' stays in the name


def build_salt_and_strength(comp1, comp2):
    """Join both ingredients: salts with ' + ', strengths with ' + '."""
    parts = [split_ingredient(comp1), split_ingredient(comp2)]
    salts = [s for s, _ in parts if s]
    strengths = [st for _, st in parts if st]
    return " + ".join(salts), " + ".join(strengths)


# ---------------------------------------------------------------------------
# Dosage form
# ---------------------------------------------------------------------------
def detect_dosage_form(pack_size_label, name):
    """Look at the pack label first (most reliable), then the brand name."""
    for text in (pack_size_label, name):
        text = str(text).lower()
        for pattern, form in COMPILED_FORM_RULES:
            if pattern.search(text):
                return form
    return "Other"


# ---------------------------------------------------------------------------
# Rx flag
# ---------------------------------------------------------------------------
def load_rx_rules(path):
    """Return (compiled salt regex or None, set of dosage forms that are always Rx)."""
    keywords, forms = [], set()
    for line in read_list_file(path):
        if line.lower().startswith("form:"):
            forms.add(line.split(":", 1)[1].strip().lower())
        else:
            keywords.append(re.escape(line.lower()))
    # keyword must start at the beginning of a word: 'cef' matches 'cefixime'
    regex = re.compile(r"\b(?:" + "|".join(keywords) + ")") if keywords else None
    return regex, forms


# ---------------------------------------------------------------------------
# Step 1: load
# ---------------------------------------------------------------------------
def load_input(path):
    """Read the CSV as text and normalise column names (the real file has
    'price(₹)' and 'Is_discontinued', not 'price' / 'is_discontinued')."""
    df = pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")
    df.columns = [c.strip().lower() for c in df.columns]
    rename = {}
    for col in df.columns:
        if col.startswith("price"):
            rename[col] = "price"
        elif "discontinu" in col:
            rename[col] = "is_discontinued"
    df = df.rename(columns=rename)
    needed = ["name", "price", "is_discontinued", "manufacturer_name", "pack_size_label",
              "short_composition1", "short_composition2"]
    missing = [c for c in needed if c not in df.columns]
    if missing:
        sys.exit(f"ERROR: input file is missing columns: {missing}\nFound: {list(df.columns)}")
    df["_order"] = np.arange(len(df))     # remember file order for stable tie-breaks
    return df


# ---------------------------------------------------------------------------
# Step 2: drop bad rows (every drop is counted for the report)
# ---------------------------------------------------------------------------
def drop_bad_rows(df, report):
    df = df.copy()
    df["name"] = df["name"].map(clean_text)
    df["short_composition1"] = df["short_composition1"].map(clean_text)
    df["short_composition2"] = df["short_composition2"].map(clean_text)
    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    # discontinued
    discontinued = df["is_discontinued"].str.strip().str.lower().isin(["true", "1", "yes"])
    report["dropped"]["discontinued"] = int(discontinued.sum())
    df = df[~discontinued]

    # missing name / composition / price (a row is counted under the first reason)
    no_name = df["name"] == ""
    no_comp = ~no_name & (df["short_composition1"] == "")
    no_price = ~no_name & ~no_comp & (df["price"].isna() | (df["price"] <= 0))
    report["dropped"]["missing name"] = int(no_name.sum())
    report["dropped"]["missing composition"] = int(no_comp.sum())
    report["dropped"]["missing or zero price"] = int(no_price.sum())
    report["zero_price_names"] = df.loc[no_price, "name"].head(6).tolist()
    return df[~(no_name | no_comp | no_price)]


# ---------------------------------------------------------------------------
# Step 3: build output columns
# ---------------------------------------------------------------------------
def build_columns(df, rx_regex, rx_forms):
    out = pd.DataFrame(index=df.index)
    out["brand_name"] = df["name"]

    pairs = [build_salt_and_strength(a, b)
             for a, b in zip(df["short_composition1"], df["short_composition2"])]
    out["salt_composition"] = [p[0] for p in pairs]
    out["strength"] = [p[1] for p in pairs]

    out["dosage_form"] = [detect_dosage_form(p, n)
                          for p, n in zip(df["pack_size_label"], df["name"])]
    out["manufacturer"] = df["manufacturer_name"].map(clean_text)
    out["pack_size"] = df["pack_size_label"].map(clean_text)
    out["mrp"] = df["price"].round(2)

    rx = out["dosage_form"].str.lower().isin(rx_forms)
    if rx_regex is not None:
        rx = rx | out["salt_composition"].str.lower().str.contains(rx_regex)
    out["rx_required"] = rx
    out["_order"] = df["_order"]
    return out


def drop_duplicates(df, report):
    """Duplicate = same brand_name + strength + pack_size (case-insensitive)."""
    key = (df["brand_name"].str.lower() + "|" + df["strength"].str.lower()
           + "|" + df["pack_size"].str.lower())
    dup = key.duplicated(keep="first")
    report["dropped"]["duplicates"] = int(dup.sum())
    return df[~dup]


# ---------------------------------------------------------------------------
# Step 4: choose the demo subset
# ---------------------------------------------------------------------------
def brand_root(name):
    """First word of the brand: 'Zerodol-SP Tablet' -> 'zerodol'."""
    parts = re.split(r"[\s\-/]+", name.lower().strip())
    return parts[0] if parts and parts[0] else name.lower()


def manufacturer_key(name):
    """'Cipla Ltd' and 'Cipla Limited' count as one manufacturer when ranking."""
    s = re.sub(r"[^a-z0-9 ]", " ", name.lower())
    s = re.sub(r"\b(ltd|limited|pvt|private|inc|co)\b", " ", s)
    return " ".join(s.split())


def find_must_include(df, entries, report):
    """Mark rows whose brand starts with a must_include line (whole-word match)."""
    names = df["brand_name"].map(norm_key)
    mask = pd.Series(False, index=df.index)
    not_found, counts = [], {}
    for entry in entries:
        key = norm_key(entry)
        # entry ending in a number may be followed by a unit ("Dolo 650" -> "Dolo 650mg");
        # otherwise the match must end at a word boundary ("Dolo" must not hit "Dolonex")
        end = r"(?!\d)" if key[-1:].isdigit() else r"(?![a-z0-9])"
        hit = names.str.contains("^" + re.escape(key) + end, regex=True)
        counts[entry] = int(hit.sum())
        if hit.any():
            mask |= hit
        else:
            not_found.append(entry)
    report["must_not_found"] = not_found
    report["must_counts"] = counts
    report["must_found_rows"] = int(mask.sum())
    return mask


def select_subset(df, must_mask, target_rows, per_group_cap):
    """Score every row, then take must-include rows + the best-scoring rest.

    The file has NO sales/popularity column, so 'popular' is approximated by:
      * manufacturer size  - top manufacturers by number of products
      * salt popularity    - how many products contain the same salt combination
      * brand family size  - how many products share the brand's first word
    A per-group cap (same salt + strength + form) keeps the subset varied.
    """
    if target_rows <= 0 or len(df) <= target_rows:
        return df

    work = df.copy()
    mkey = work["manufacturer"].map(manufacturer_key)
    rank = mkey.map(mkey.value_counts().rank(ascending=False, method="first"))
    mfr_score = (1 - (rank - 1) / TOP_MANUFACTURERS).clip(lower=0)      # 0 outside the top N

    salt_score = work["salt_composition"].str.lower().map(
        work["salt_composition"].str.lower().value_counts()).rank(pct=True)
    root = work["brand_name"].map(brand_root)
    family_score = root.map(root.value_counts()).rank(pct=True)
    form_bonus = work["dosage_form"].isin(EVERYDAY_FORMS).astype(float) * 0.15
    price_penalty = (work["mrp"] > MAX_SENSIBLE_MRP).astype(float) * 0.5

    work["_score"] = (0.35 * mfr_score + 0.35 * salt_score + 0.30 * family_score
                      + form_bonus - price_penalty)
    work = work.sort_values(["_score", "_order"], ascending=[False, True])

    chosen = work[must_mask.reindex(work.index)]
    rest = work[~must_mask.reindex(work.index)]
    room = max(target_rows - len(chosen), 0)

    group = (rest["salt_composition"].str.lower() + "|" + rest["strength"].str.lower()
             + "|" + rest["dosage_form"])
    within_cap = rest.groupby(group).cumcount() < per_group_cap
    picked = rest[within_cap].head(room)
    if len(picked) < room:                                  # cap too strict -> top up
        leftovers = rest.drop(picked.index)
        picked = pd.concat([picked, leftovers.head(room - len(picked))])
    return pd.concat([chosen, picked])


# ---------------------------------------------------------------------------
# Step 5: report
# ---------------------------------------------------------------------------
def print_report(report, final, pool_rows, seed):
    dropped_total = sum(report["dropped"].values())
    print("\n" + "=" * 70)
    print("CLEANING REPORT")
    print("=" * 70)
    print(f"Rows in:                         {report['rows_in']:>8}")
    print("Rows dropped:")
    for reason, n in report["dropped"].items():
        print(f"    {reason:<28} {n:>8}")
    print(f"    {'TOTAL dropped':<28} {dropped_total:>8}")
    print(f"Clean rows (before subset):      {pool_rows:>8}")
    print(f"Not picked for demo subset:      {pool_rows - len(final):>8}")
    print(f"Rows out:                        {len(final):>8}")

    print("\nOutput summary:")
    print("    dosage forms:", final["dosage_form"].value_counts().to_dict())
    print(f"    rx_required true: {int((final['rx_required'] == 'true').sum())} of {len(final)}")
    print(f"    missing strength: {int((final['strength'] == '').sum())}")
    print(f"    must_include rows matched: {report['must_found_rows']}")

    print("\nThings that look off:")
    if report["must_not_found"]:
        print("    * must_include entries NOT in the dataset:", ", ".join(report["must_not_found"]))
    broad = {k: v for k, v in report["must_counts"].items() if v > 15}
    if broad:
        print("    * must_include entries matching >15 rows (add more words to narrow):", broad)
    if report["zero_price_names"]:
        print("    * price 0 rows dropped, e.g.:", ", ".join(report["zero_price_names"]))
    other = final[final["dosage_form"] == "Other"]
    if len(other):
        print(f"    * {len(other)} rows have dosage_form 'Other'; pack labels:",
              other["pack_size"].value_counts().head(5).to_dict())
    big = final[final["mrp"] > MAX_SENSIBLE_MRP]
    if len(big):
        print(f"    * {len(big)} rows have mrp > {MAX_SENSIBLE_MRP}, e.g.:",
              big.nlargest(3, "mrp")[["brand_name", "mrp"]].values.tolist())

    unflagged = final.loc[final["rx_required"] == "false", "salt_composition"].str.lower().value_counts().head(12)
    print("    * most common salts NOT flagged Rx (review rx_keywords.txt):")
    for salt, n in unflagged.items():
        print(f"        {n:>4}  {salt}")

    print("\n10 random sample rows:")
    pd.set_option("display.width", 250)
    pd.set_option("display.max_colwidth", 38)
    print(final.sample(min(10, len(final)), random_state=seed).to_string(index=False))


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------
def main():
    here = Path(__file__).resolve().parent
    ap = argparse.ArgumentParser(description="Clean the A-Z Medicine Dataset of India.")
    ap.add_argument("--input", required=True, help="Kaggle CSV")
    ap.add_argument("--output", default="data/medicines.csv", help="output CSV")
    ap.add_argument("--sample-output", help="100-row sample CSV (default: medicines_sample.csv next to --output)")
    ap.add_argument("--rx-keywords", default=str(here / "rx_keywords.txt"))
    ap.add_argument("--must-include", default=str(here / "must_include.txt"))
    ap.add_argument("--target-rows", type=int, default=8000,
                    help="demo subset size (0 = keep every clean row)")
    ap.add_argument("--per-group-cap", type=int, default=5,
                    help="max brands per same salt+strength+form in the subset")
    ap.add_argument("--sample-size", type=int, default=100)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    report = {"dropped": {}}
    raw = load_input(args.input)
    report["rows_in"] = len(raw)

    kept = drop_bad_rows(raw, report)
    rx_regex, rx_forms = load_rx_rules(args.rx_keywords)
    table = build_columns(kept, rx_regex, rx_forms)
    table = drop_duplicates(table, report)
    pool_rows = len(table)

    must_mask = find_must_include(table, read_list_file(args.must_include), report)
    final = select_subset(table, must_mask, args.target_rows, args.per_group_cap)

    final = final[OUTPUT_COLUMNS].copy()
    final["rx_required"] = final["rx_required"].map({True: "true", False: "false"})
    final = final.sort_values("brand_name", key=lambda s: s.str.lower()).reset_index(drop=True)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    final.to_csv(out_path, index=False, encoding="utf-8")

    sample_path = Path(args.sample_output) if args.sample_output else out_path.parent / "medicines_sample.csv"
    final.sample(min(args.sample_size, len(final)), random_state=args.seed) \
         .sort_values("brand_name", key=lambda s: s.str.lower()) \
         .to_csv(sample_path, index=False, encoding="utf-8")

    print_report(report, final, pool_rows, args.seed)
    print(f"\nWrote {out_path} ({len(final)} rows) and {sample_path}")


if __name__ == "__main__":
    main()
