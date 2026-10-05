import pytest
from app.core import config
from app.data.loader import load_medicines
from app.search.matcher import MedicineMatcher


@pytest.fixture(scope="module")
def matcher():
    config.MEDICINES_SOURCE = "csv"
    return MedicineMatcher().build(load_medicines())


def test_typo(matcher):
    r = matcher.search_many(["paracetmol"])[0]
    assert r["matched"]
    assert "paracetamol" in r["results"][0]["salt_composition"].lower()


def test_partial(matcher):
    r = matcher.search_many(["dolo 65"])[0]
    assert r["matched"]
    assert "dolo" in r["results"][0]["brand_name"].lower()


def test_multiple(matcher):
    assert len(matcher.search_many(["paracetmol", "dolo 65", "xyzqwerty"])) == 3


def test_nonsense(matcher):
    assert not matcher.search_many(["xyzqwerty"])[0]["matched"] 