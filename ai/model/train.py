"""
Trains a churn classifier on the cleaned dataset and saves it, together with
its preprocessing pipeline, to churn_model.pkl.

Run:  python model/train.py
"""
import os
import json
from datetime import datetime, timezone
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

import preprocess

MODEL_PATH = os.path.join(os.path.dirname(__file__), "churn_model.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "metrics.json")
MODEL_VERSION = "1.0.0"

NUMERIC_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges"]
CATEGORICAL_FEATURES = [
    "Contract", "InternetService", "PaymentMethod", "TechSupport", "OnlineSecurity",
    "OnlineBackup", "DeviceProtection", "StreamingTV", "StreamingMovies",
    "PaperlessBilling", "gender", "SeniorCitizen", "Partner", "Dependents", "MultipleLines",
]
TARGET = "Churn"


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )
    model = RandomForestClassifier(n_estimators=300, max_depth=8, random_state=42, class_weight="balanced")
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def run():
    if not os.path.exists(preprocess.PROCESSED_PATH):
        print("Processed data not found — running preprocess.py first…")
        preprocess.run()

    df = pd.read_csv(preprocess.PROCESSED_PATH)

    features = [c for c in NUMERIC_FEATURES + CATEGORICAL_FEATURES if c in df.columns]
    df = df.dropna(subset=features + [TARGET])

    X = df[features]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    probs = pipeline.predict_proba(X_test)[:, 1]

    print(classification_report(y_test, preds))
    auc = round(roc_auc_score(y_test, probs), 4)
    acc = round(accuracy_score(y_test, preds), 4)
    print("ROC AUC:", auc)

    joblib.dump({"pipeline": pipeline, "features": features}, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

    metrics = {
        "version": MODEL_VERSION,
        "auc": auc,
        "accuracy": acc,
        "trainingRows": len(df),
        "trainedAt": datetime.now(timezone.utc).isoformat(),
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics to {METRICS_PATH}")


if __name__ == "__main__":
    run()
