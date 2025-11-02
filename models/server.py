from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("C:/Users/Lenovo/Desktop/university/labs/Lab5.1_Mobiles/gesture_model.pkl")
encoder = joblib.load("C:/Users/Lenovo/Desktop/university/labs/Lab5.1_Mobiles/label_encoder.pkl")

class SensorData(BaseModel):
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float

@app.post("/predict")
def predict(data: SensorData):
    features = np.array([[data.ax, data.ay, data.az, data.gx, data.gy, data.gz]])

    probs = model.predict_proba(features)[0]
    classes = encoder.inverse_transform(model.classes_)

    prediction = classes[np.argmax(probs)]

    return {
        "prediction": prediction,
        "probs": {cls: float(prob) for cls, prob in zip(classes, probs)}
    }
