"""
Loads the trained churn_model.pkl and scores a single customer profile.

Returns both the churn probability and a simple, explainable breakdown of
which features pushed the prediction up or down — used by reason_agent.py
to build the human-readable narrative.
"""
import os
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "churn_model.pkl")

_cache = {}


def _load():
    if "bundle" not in _cache:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "churn_model.pkl not found — run `python model/train.py` first."
            )
        _cache["bundle"] = joblib.load(MODEL_PATH)
    return _cache["bundle"]


# Heuristic "risky value" reference points, used only to decide whether a
# feature pushed risk up or down for this particular customer.
RISK_DIRECTION_RULES = {
    "tenure": lambda v: "down" if v >= 24 else "up",
    "MonthlyCharges": lambda v: "up" if v >= 70 else "down",
    "TotalCharges": lambda v: "down" if v >= 1500 else "up",
    "Contract": lambda v: "up" if v == "Month-to-month" else "down",
    "InternetService": lambda v: "up" if v == "Fiber optic" else "down",
    "PaymentMethod": lambda v: "up" if v == "Electronic check" else "down",
    "TechSupport": lambda v: "up" if v == "No" else "down",
    "OnlineSecurity": lambda v: "up" if v == "No" else "down",
    "OnlineBackup": lambda v: "up" if v == "No" else "down",
    "DeviceProtection": lambda v: "up" if v == "No" else "down",
    "StreamingTV": lambda v: "up" if v == "No" else "down",
    "StreamingMovies": lambda v: "up" if v == "No" else "down",
    "PaperlessBilling": lambda v: "up" if v == "Yes" else "down",
    "Partner": lambda v: "up" if v == "No" else "down",
    "Dependents": lambda v: "up" if v == "No" else "down",
    "MultipleLines": lambda v: "up" if v == "Yes" else "down",
    "SeniorCitizen": lambda v: "up" if str(v) == "1" else "down",
}

FRIENDLY_NAMES = {
    "tenure": "Tenure",
    "MonthlyCharges": "Monthly charges",
    "TotalCharges": "Total charges",
    "Contract": "Contract type",
    "InternetService": "Internet service",
    "PaymentMethod": "Payment method",
    "TechSupport": "Tech support",
    "OnlineSecurity": "Online security",
    "OnlineBackup": "Online backup",
    "DeviceProtection": "Device protection",
    "StreamingTV": "Streaming TV",
    "StreamingMovies": "Streaming movies",
    "PaperlessBilling": "Paperless billing",
    "gender": "Gender",
    "SeniorCitizen": "Senior citizen",
    "Partner": "Has partner",
    "Dependents": "Has dependents",
    "MultipleLines": "Multiple lines",
}


def predict(profile: dict) -> dict:
    bundle = _load()
    pipeline, features = bundle["pipeline"], bundle["features"]

    row = {f: profile.get(f) for f in features}

    # Defensive coercion: numeric fields may arrive as strings depending on
    # the caller (e.g. raw JSON) — normalize them so the comparisons in
    # RISK_DIRECTION_RULES never crash on a str/int comparison.
    for f in ("tenure", "MonthlyCharges", "TotalCharges"):
        if f in row and row[f] is not None:
            try:
                row[f] = float(row[f])
            except (TypeError, ValueError):
                pass

    X = pd.DataFrame([row])

    probability = float(pipeline.predict_proba(X)[0][1])

    # Global feature importances from the trained model, mapped back onto
    # this customer's actual values to produce a rough per-feature impact.
    model = pipeline.named_steps["model"]
    preprocessor = pipeline.named_steps["preprocess"]
    try:
        importances = model.feature_importances_
        feature_names = preprocessor.get_feature_names_out()
    except Exception:
        importances, feature_names = [], []

    # Aggregate one-hot importances back to their source column
    agg_importance = {f: 0.0 for f in features}
    for name, imp in zip(feature_names, importances):
        for f in features:
            if name.endswith(f) or f"__{f}" in name or name.split("__")[-1].startswith(f):
                agg_importance[f] += float(imp)
                break

    total = sum(agg_importance.values()) or 1.0
    factors = []
    for f in features:
        value = row.get(f)
        direction_fn = RISK_DIRECTION_RULES.get(f)
        direction = direction_fn(value) if direction_fn and value is not None else "up"
        factors.append({
            "name": FRIENDLY_NAMES.get(f, f),
            "impact": round(agg_importance[f] / total, 3),
            "direction": direction,
        })

    factors.sort(key=lambda x: x["impact"], reverse=True)

    return {
        "probability": round(probability, 4),
        "factors": factors[:5],
    }


if __name__ == "__main__":
    sample = {
        "tenure": 3,
        "MonthlyCharges": 89.5,
        "TotalCharges": 260.0,
        "Contract": "Month-to-month",
        "InternetService": "Fiber optic",
        "PaymentMethod": "Electronic check",
        "TechSupport": "No",
        "OnlineSecurity": "No",
    }
    print(predict(sample))
