import requests
import random
import time

URL = "http://127.0.0.1:8000/data"

while True:
    data = {
        "gas": random.uniform(20, 100),
        "temperature": random.uniform(20, 80),
        "ph": random.uniform(5, 9)
    }

    try:
        requests.post(URL, json=data)
        print("Sent:", data)
    except:
        print("Error sending data")

    time.sleep(3)