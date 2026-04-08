from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Chemical Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# -------------------------------
# In-memory storage
# -------------------------------
data_store = []
alerts_store = []

MAX_RECORDS = 100


# -------------------------------
# DATA MODEL
# -------------------------------
class SensorData(BaseModel):
    gas: float
    temperature: float
    ph: float


# -------------------------------
# RISK LOGIC
# -------------------------------
def calculate_risk(gas, temp, ph):
    if gas > 80 or temp > 70 or ph < 5 or ph > 9:
        return "CRITICAL"
    elif gas > 50 or temp > 50:
        return "HIGH"
    else:
        return "SAFE"


# -------------------------------
# ROUTES
# -------------------------------

@app.get("/")
def home():
    return {"message": "Chemical Monitoring Backend Running"}


# -------- RECEIVE DATA --------
@app.post("/data")
def receive_data(data: SensorData):
    risk = calculate_risk(data.gas, data.temperature, data.ph)

    record = {
        "timestamp": datetime.now().isoformat(),
        "time": datetime.now().strftime("%H:%M:%S"),
        "gas": round(data.gas, 2),
        "temperature": round(data.temperature, 2),
        "ph": round(data.ph, 2),
        "risk": risk
    }

    data_store.append(record)

    # keep only last N records
    if len(data_store) > MAX_RECORDS:
        data_store.pop(0)

    # -------- STORE ALERT --------
    if risk == "CRITICAL":
        alerts_store.append({
            "time": record["time"],
            "message": "Critical chemical levels detected",
            "data": record
        })

    return {"status": "stored", "risk": risk}


# -------- GET DATA --------
@app.get("/data")
def get_data():
    return data_store


# -------- ALERTS HISTORY --------
@app.get("/alerts")
def get_alerts():
    return alerts_store[-20:]


# -------- DATA LOGS --------
@app.get("/logs")
def get_logs():
    return {
        "total_records": len(data_store),
        "latest": data_store[-1] if data_store else None
    }


# -------- SYSTEM RESET --------
@app.post("/reset")
def reset_system():
    data_store.clear()
    alerts_store.clear()
    return {"message": "System reset successful"}


# -------- TRIGGER TEST ALERT --------
@app.post("/trigger-alert")
def trigger_alert():
    fake = {
        "gas": 95,
        "temperature": 85,
        "ph": 3,
        "time": datetime.now().strftime("%H:%M:%S"),
        "risk": "CRITICAL"
    }

    data_store.append(fake)

    alerts_store.append({
        "time": fake["time"],
        "message": "Manual test alert",
        "data": fake
    })

    return {"message": "Test alert triggered"}


# -------- SUMMARY (EXTRA) --------
@app.get("/summary")
def get_summary():
    if not data_store:
        return {"message": "No data"}

    latest = data_store[-1]

    avg_gas = sum(d["gas"] for d in data_store) / len(data_store)
    avg_temp = sum(d["temperature"] for d in data_store) / len(data_store)
    avg_ph = sum(d["ph"] for d in data_store) / len(data_store)

    return {
        "latest": latest,
        "averages": {
            "gas": round(avg_gas, 2),
            "temperature": round(avg_temp, 2),
            "ph": round(avg_ph, 2)
        },
        "total_records": len(data_store)
    }