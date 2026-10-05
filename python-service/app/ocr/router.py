from fastapi import APIRouter, UploadFile, File
from app.core.state import state
from app.ocr.pipeline import identify

router = APIRouter()


@router.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    return identify(await file.read(), state["matcher"])