from fastapi import APIRouter
from src.config.db import db
from src.models.spill import Spill

router = APIRouter()

# CREATE spill
@router.post("/spills")
def create_spill(spill: Spill):
    data = spill.dict()
    db.spills.insert_one(data)
    return {"message": "Stored"}

# GET all spills
@router.get("/spills")
def get_spills():
    latest = db.spills.find().sort("_id", -1).limit(1)
    latest = list(latest)

    if not latest:
        return {
            "gas_level": 0,
            "temperature": 0,
            "ph": 7
        }

    data = latest[0]

    return {
        "gas_level": data.get("gas_level", 0),
        "temperature": data.get("temperature", 0),
        "ph": data.get("ph", 7)
    }