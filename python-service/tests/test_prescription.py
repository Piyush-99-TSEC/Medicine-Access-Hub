from app.ocr.prescription import medicine_entries


def test_numbered_lines_with_salt_hint():
    lines = ["1)TAB.ABCIXIMAB", "1 Morning", "3)CAP.ZOCLAR500", "CLARITHROMYCINIPSOOMG", "Advice:"]
    e = medicine_entries(lines)
    assert [x["name"] for x in e] == ["ABCIXIMAB", "ZOCLAR 500"]
    assert e[1]["hint"] == ["CLARITHROMYCINIPSOOMG"]


def test_unnumbered_and_glued_syrup():
    e = medicine_entries(["TAB.HEPCDAC", "SYRUPANOTHERMEDICINE"])
    assert [x["name"] for x in e] == ["HEPCDAC", "ANOTHERMEDICINE"]


def test_ignores_non_medicine_lines():
    assert medicine_entries(["Dr.Akshara", "Diagnosis:", "Capital Road"]) == []