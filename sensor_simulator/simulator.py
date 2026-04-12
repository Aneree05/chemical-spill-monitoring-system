import requests
import random
import time

URL = "http://localhost:8000/api/spills"

while True:
    data = {
        "location": "Plant 1",
        "gas_level": round(random.uniform(10, 100), 2),
        "temperature": round(random.uniform(20, 80), 2),
        "ph": round(random.uniform(5, 9), 2)
    }

    try:
        res = requests.post(URL, json=data)
        print("Sent:", data)
    except Exception as e:
        print("Error:", e)

    time.sleep(5)  # every 5 seconds