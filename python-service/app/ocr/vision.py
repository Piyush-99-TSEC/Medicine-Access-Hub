import base64
import json
import os
import re
from groq import Groq

MODEL = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")
PROMPT = (
    "Read this medical prescription image. Return only a JSON list of the prescribed medicines, "
    'each as {"name": "...", "salt": "..."}, where salt is the composition if written, else "". '
    "Write brand names exactly as written. Skip dosage schedules, doctor details and advice."
)


def extract_medicines(image_bytes):
    b64 = base64.b64encode(image_bytes).decode()
    res = Groq().chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=[{"role": "user", "content": [
            {"type": "text", "text": PROMPT},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ]}],
    )
    text = re.sub(r"<think>.*?</think>", "", res.choices[0].message.content, flags=re.S)
    m = re.search(r"\[.*\]", text, re.S)
    return json.loads(m.group(0)) if m else []