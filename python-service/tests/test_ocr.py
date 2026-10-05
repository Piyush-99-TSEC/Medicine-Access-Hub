from app.ocr.cleaner import clean_line, clean_lines
from app.ocr.reader import candidate_lines


def test_clean_units():
    assert clean_line("Doxofylline IP 400 mg") == "doxofylline 400mg"


def test_clean_lines_drops_short_and_duplicates():
    assert clean_lines(["Dolo 650", "dolo 650", "ab"]) == ["dolo 650"]


def test_candidate_lines_drops_noise():
    lines = ["Mfg. by Zydus Healthcare", "Dolo 650", "Keep out of reach of children"]
    assert candidate_lines(lines) == ["Dolo 650"]