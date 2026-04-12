from pydantic import BaseModel
from datetime import datetime
from typing import Optional

timestamp: Optional[datetime] = datetime.utcnow()

class Spill(BaseModel):
    location: str
    gas_level: float
    temperature: float
    ph: float
    