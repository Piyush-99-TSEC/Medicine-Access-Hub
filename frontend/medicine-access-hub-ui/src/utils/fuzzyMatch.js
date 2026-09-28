// ---------------------------------------------------------------------------
// Trigram-based fuzzy matcher for typo-tolerant medicine search.
//
// Builds a lightweight character n-gram index over MEDICINES and scores a
// query by trigram overlap against each medicine's "document" (brand +
// generic + salt + strength + form). This is a demo-grade stand-in for real
// TF-IDF / edit-distance search — good enough to power a believable
// "Did you mean...?" flow on mock data, upgradeable later with IDF-style
// weighting so common chunks like "tab" or "mg" count for less.
// ---------------------------------------------------------------------------

const N = 3;

// Threshold rule from the spec: score >= this -> treat as a confident
// auto-correct and search directly. Below it -> show "Did you mean?".
export const FUZZY_MATCH_THRESHOLD = 0.5;

// Break a string into overlapping N-character chunks.
// Padded with a leading/trailing space so short words still contribute
// edge grams (" pa", "ara", ... "ol ").
function toTrigrams(text) {
  const s = ` ${String(text).toLowerCase().trim()} `;
  if (s.length < N) return [s];
  const grams = [];
  for (let i = 0; i <= s.length - N; i++) {
    grams.push(s.slice(i, i + N));
  }
  return grams;
}

// One medicine's searchable "document": brand + generic + salt + strength + form,
// lowercased and space-joined.
function buildMedicineDocument(med) {
  return [med.brand, med.generic, med.salt, med.strength, med.form]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

// Build the index once (call this at module level or inside useMemo).
// Returns [{ medicine, grams: Set<string> }, ...]
export function buildFuzzyIndex(medicines) {
  return medicines.map(medicine => ({
    medicine,
    grams: new Set(toTrigrams(buildMedicineDocument(medicine)))
  }));
}

// Overlap ratio: shared trigrams / trigrams in the query.
// Ratio is against the query (not the document) so a short typo'd query
// isn't unfairly diluted by a longer medicine document.
function overlapScore(queryGrams, docGramSet) {
  if (queryGrams.length === 0 || docGramSet.size === 0) return 0;
  let shared = 0;
  for (const g of queryGrams) {
    if (docGramSet.has(g)) shared += 1;
  }
  return shared / queryGrams.length;
}

// Score a query against every medicine in the index, sorted best-first.
// Returns [{ medicine, score }, ...] — score is 0..1.
export function getFuzzyMatches(query, fuzzyIndex, { limit = 5, minScore = 0.05 } = {}) {
  const q = String(query).trim().toLowerCase();
  if (!q) return [];

  const queryGrams = toTrigrams(q);

  return fuzzyIndex
    .map(({ medicine, grams }) => ({ medicine, score: overlapScore(queryGrams, grams) }))
    .filter(entry => entry.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}