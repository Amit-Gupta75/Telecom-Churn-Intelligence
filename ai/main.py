"""
FastAPI AI service.

POST /predict — accepts a customer profile, scores churn probability with
the trained sklearn model, then runs it through the reason → retention
agent pipeline to produce an explanation and a retention offer.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import json
import os

from model.predict import predict
from agents.response_agent import build_response

app = FastAPI(title="Telecom Churn AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

METRICS_PATH = os.path.join(os.path.dirname(__file__), "model", "metrics.json")


class CustomerProfile(BaseModel):
    tenure: float = Field(..., ge=0)
    monthlyCharges: float = Field(..., ge=0)
    totalCharges: float = Field(..., ge=0)
    contract: str = "Month-to-month"
    internetService: str = "Fiber optic"
    paymentMethod: str = "Electronic check"
    techSupport: str = "No"
    onlineSecurity: str = "No"
    onlineBackup: str = "No"
    deviceProtection: str = "No"
    streamingTV: str = "No"
    streamingMovies: str = "No"
    paperlessBilling: str = "Yes"
    gender: str = "Female"
    seniorCitizen: str = "0"
    partner: str = "No"
    dependents: str = "No"
    multipleLines: str = "No"
    customerId: Optional[str] = None


def to_model_row(profile: CustomerProfile) -> dict:
    return {
        "tenure": profile.tenure,
        "MonthlyCharges": profile.monthlyCharges,
        "TotalCharges": profile.totalCharges,
        "Contract": profile.contract,
        "InternetService": profile.internetService,
        "PaymentMethod": profile.paymentMethod,
        "TechSupport": profile.techSupport,
        "OnlineSecurity": profile.onlineSecurity,
        "OnlineBackup": profile.onlineBackup,
        "DeviceProtection": profile.deviceProtection,
        "StreamingTV": profile.streamingTV,
        "StreamingMovies": profile.streamingMovies,
        "PaperlessBilling": profile.paperlessBilling,
        "gender": profile.gender,
        "SeniorCitizen": profile.seniorCitizen,
        "Partner": profile.partner,
        "Dependents": profile.dependents,
        "MultipleLines": profile.multipleLines,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/model-info")
def model_info():
    if not os.path.exists(METRICS_PATH):
        return {"trained": False}
    with open(METRICS_PATH) as f:
        metrics = json.load(f)
    return {"trained": True, **metrics}


@app.post("/predict")
def predict_churn(profile: CustomerProfile):
    try:
        row = to_model_row(profile)
        raw = predict(row)  # { probability, factors }
        result = build_response(raw["probability"], raw["factors"], row)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    
    


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
