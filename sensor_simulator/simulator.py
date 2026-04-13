import requests
import csv
import time

URL = "http://127.0.0.1:8000/api/spills"

DEVICE_LOCATIONS = {
    "b8:27:eb:bf:9d:51": "Plant 1",
    "00:0f:00:70:91:0a": "Plant 2",
    "1c:bf:ce:15:ec:4d": "Plant 3"
}

def read_csv_and_send():
    with open("iot_telemetry_data.csv", "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Map device ID to a plant location name
            device = row["device"].strip()
            location = DEVICE_LOCATIONS.get(device, "Plant 1")

            # co and smoke → gas_level (scaled to 0-100)
            co = float(row["co"])
            smoke = float(row["smoke"])
            gas_level = round((co + smoke) * 1000, 2)

            # temp → temperature
            temperature = round(float(row["temp"]), 2)

            # humidity → ph (scaled from 0-100 humidity to 4-9 pH range)
            humidity = float(row["humidity"])
            ph = round(4 + (humidity / 100) * 5, 2)

            data = {
                "location": location,
                "gas_level": gas_level,
                "temperature": temperature,
                "ph": ph
            }

            try:
                res = requests.post(URL, json=data)
                print("Sent:", data)
            except Exception as e:
                print("Error:", e)

            time.sleep(2)  # one row every 2 seconds

while True:
    read_csv_and_send()