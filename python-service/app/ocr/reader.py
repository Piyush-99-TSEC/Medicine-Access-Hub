import io
import re
import cv2
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
SKIP = re.compile(r"mfg|mkt|warning|store|protect|dosage|keep|trademark|excipient|contains|licen|batch|taxes|circle|sikkim|\bdiv\b|prescription|practitioner|physician|\bexp\b|\bm\.?r\.?p\b|\bb\.?no\b", re.I)


def preprocess(image_bytes, binarize=False):
    img = np.array(Image.open(io.BytesIO(image_bytes)).convert("RGB"))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    gray = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    if binarize:
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return gray


def read_lines(image_bytes, binarize=False):
    result, _ = engine(preprocess(image_bytes, binarize))
    return [t[1] for t in result or []]


def candidate_lines(lines):
    out, seen = [], set()
    for line in lines:
        line = line.strip()
        key = line.lower()
        if key in seen or len(re.findall(r"[A-Za-z]", line)) < 4 or SKIP.search(line):
            continue
        seen.add(key)
        out.append(line)
    return out