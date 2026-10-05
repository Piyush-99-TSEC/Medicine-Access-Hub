import re

NOISE = re.compile(r"\b(ip|bp|usp|tab|tabs)\b")


def clean_line(line):
    line = line.lower()
    line = re.sub(r"[^a-z0-9. ]", " ", line)
    line = re.sub(r"(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g)\b", r"\1\2", line)
    line = NOISE.sub(" ", line)
    return re.sub(r"\s+", " ", line).strip()


def clean_lines(lines):
    out = []
    for line in lines:
        c = clean_line(line)
        if len(c) >= 4 and c not in out:
            out.append(c)
    return out