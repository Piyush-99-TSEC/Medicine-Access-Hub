import re
import numpy as np
from rapidfuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.core import config

FIELDS = ["brand_name", "salt_composition", "strength", "dosage_form", "manufacturer"]


def clean(text):
    return re.sub(r"\s+", " ", str(text).lower()).strip()


class MedicineMatcher:
    def build(self, df):
        self.df = df.reset_index(drop=True)
        self.texts = self.df[FIELDS].astype(str).agg(" ".join, axis=1).map(clean).tolist()
        self.vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 3))
        self.matrix = self.vectorizer.fit_transform(self.texts)
        return self

    def search_many(self, queries, top_k=None):
        top_k = top_k or config.TOP_K
        return [self._search(clean(q), top_k) for q in queries]

    def _search(self, query, top_k):
        cos = cosine_similarity(self.vectorizer.transform([query]), self.matrix).ravel()
        idx = np.argsort(cos)[::-1][:top_k]
        results = []
        for i in idx:
            score = 0.5 * cos[i] + 0.5 * fuzz.WRatio(query, self.texts[i]) / 100
            row = self.df.iloc[i]
            results.append({
                "id": int(row["id"]),
                "brand_name": row["brand_name"],
                "salt_composition": row["salt_composition"],
                "strength": row["strength"],
                "score": round(float(score), 3),
            })
        results.sort(key=lambda r: r["score"], reverse=True)
        matched = bool(results) and results[0]["score"] >= config.MATCH_THRESHOLD
        return {"query": query, "matched": matched, "results": results}