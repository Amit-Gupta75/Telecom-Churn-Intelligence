"""
Cleans the raw Telco churn CSV into a model-ready dataframe.

Input:  ai/data/raw/telco_churn.csv   (IBM Telco Customer Churn schema)
Output: ai/data/processed/cleaned_data.csv
"""
import os
import pandas as pd

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "telco_churn.csv")
PROCESSED_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "cleaned_data.csv")

CATEGORICAL_COLS = [
    "Contract", "InternetService", "PaymentMethod",
    "TechSupport", "OnlineSecurity", "PaperlessBilling",
    "Partner", "Dependents", "PhoneService", "MultipleLines",
]

NUMERIC_COLS = ["tenure", "MonthlyCharges", "TotalCharges"]


def load_raw(path: str = RAW_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # TotalCharges sometimes arrives as blank strings for brand-new customers
    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
        df["TotalCharges"] = df["TotalCharges"].fillna(df["MonthlyCharges"])

    if "customerID" in df.columns:
        df = df.drop(columns=["customerID"])

    # Normalize target to 0/1
    if "Churn" in df.columns and df["Churn"].dtype == object:
        df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

    df = df.dropna()
    return df


def run():
    df = load_raw()
    cleaned = clean(df)
    os.makedirs(os.path.dirname(PROCESSED_PATH), exist_ok=True)
    cleaned.to_csv(PROCESSED_PATH, index=False)
    print(f"Wrote {len(cleaned)} rows to {PROCESSED_PATH}")


if __name__ == "__main__":
    run()
