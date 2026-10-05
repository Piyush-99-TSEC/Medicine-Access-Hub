from fastapi import APIRouter, UploadFile, File
from app.core.state import state
from app.ocr.pipeline import identify
from app.ocr.prescription import identify_prescription, identify_handwritten

router = APIRouter()


@router.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    return identify(await file.read(), state["matcher"])

@router.post("/prescription")
async def prescription(file: UploadFile = File(...)):
    return identify_prescription(await file.read(), state["matcher"])

@router.post("/prescription/handwritten")
async def handwritten(file: UploadFile = File(...)):
    return identify_handwritten(await file.read(), state["matcher"])