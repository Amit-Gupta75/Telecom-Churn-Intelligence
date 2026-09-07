"""
FastAPI AI service.

POST /predict   — churn probability + agent pipeline (summary + offers)
POST /shap      — SHAP explanation for a customer profile
GET  /health    — liveness probe
GET  /model-info — training metrics
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import json
import os

from model.predict import predict, add_engineered_features, _load
from agents.response_agent import build_response

app = FastAPI(title="Telecom Churn AI Service", version="2.0.0")

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
        raw = predict(row)
        result = build_response(raw["probability"], raw["factors"], row)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/shap")
def shap_explain(profile: CustomerProfile):
    """
    Returns SHAP values for the given customer profile.
    Response:
      {
        "shap_values": [{"feature": str, "shap": float}],
        "base_value": float,
        "probability": float
      }
    """
    try:
        import shap
        import pandas as pd
        import numpy as np

        row = to_model_row(profile)
        bundle = _load()
        pipeline = bundle["pipeline"]
        features = bundle["features"]

        row_eng = add_engineered_features(row)
        row_filtered = {f: row_eng.get(f) for f in features}

        for f in ["tenure", "MonthlyCharges", "TotalCharges", "AvgMonthlyCharges", "TotalServices"]:
            if f in row_filtered and row_filtered[f] is not None:
                try:
                    row_filtered[f] = float(row_filtered[f])
                except (TypeError, ValueError):
                    pass

        X = pd.DataFrame([row_filtered])
        preprocessor = pipeline.named_steps["preprocess"]
        model = pipeline.named_steps["model"]
        X_transformed = preprocessor.transform(X)

        explainer = shap.Explainer(model, X_transformed)
        shap_values = explainer(X_transformed)

        sv = shap_values.values[0]
        if sv.ndim == 2:
            sv = sv[:, 1]

        base = shap_values.base_values[0]
        base = float(base[1]) if np.ndim(base) > 0 else float(base)

        try:
            feat_names = preprocessor.get_feature_names_out().tolist()
        except Exception:
            feat_names = [f"f{i}" for i in range(len(sv))]

        shap_list = [
            {"feature": name, "shap": round(float(val), 5)}
            for name, val in sorted(zip(feat_names, sv), key=lambda x: abs(x[1]), reverse=True)
        ]

        probability = float(pipeline.predict_proba(X)[0][1])

        return {
            "shap_values": shap_list[:15],
            "base_value": round(base, 5),
            "probability": round(probability, 4),
        }

    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
