"""
Cleans the raw Telco churn CSV into a model-ready dataframe.

Input:
    ai/data/raw/telco_churn.csv

Output:
    ai/data/processed/cleaned_data.csv
"""

import os
import pandas as pd


# ============================================================
# FILE PATHS
# ============================================================

RAW_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "raw",
    "telco_churn.csv"
)

PROCESSED_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "processed",
    "cleaned_data.csv"
)


# ============================================================
# COLUMN GROUPS
# ============================================================

CATEGORICAL_COLS = [
    "Contract",
    "InternetService",
    "PaymentMethod",
    "TechSupport",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "StreamingTV",
    "StreamingMovies",
    "PaperlessBilling",
    "Partner",
    "Dependents",
    "PhoneService",
    "MultipleLines",
    "gender",
    "SeniorCitizen",
]

NUMERIC_COLS = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
]


# ============================================================
# EXTRACT
# ============================================================

def load_raw(path: str = RAW_PATH) -> pd.DataFrame:
    """
    Load the raw Telco churn dataset.
    """

    print("\n" + "=" * 60)
    print("EXTRACTING RAW DATA")
    print("=" * 60)

    df = pd.read_csv(path)

    print(f"Raw dataset shape: {df.shape}")

    return df


# ============================================================
# TRANSFORM + PREPROCESSING + FEATURE ENGINEERING
# ============================================================

def clean(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the dataset and create additional features.
    """

    df = df.copy()

    print("\n" + "=" * 60)
    print("DATA CLEANING AND FEATURE ENGINEERING")
    print("=" * 60)


    # --------------------------------------------------------
    # 1. Remove duplicate rows
    # --------------------------------------------------------

    duplicates = df.duplicated().sum()

    print(f"Duplicate rows found: {duplicates}")

    df = df.drop_duplicates()


    # --------------------------------------------------------
    # 2. Convert TotalCharges to numeric
    # --------------------------------------------------------

    if "TotalCharges" in df.columns:

        df["TotalCharges"] = pd.to_numeric(
            df["TotalCharges"],
            errors="coerce"
        )

        # Brand-new customers may have blank TotalCharges
        if "MonthlyCharges" in df.columns:

            df["TotalCharges"] = df["TotalCharges"].fillna(
                df["MonthlyCharges"]
            )


    # --------------------------------------------------------
    # 3. Drop customer ID
    # --------------------------------------------------------

    if "customerID" in df.columns:

        df = df.drop(
            columns=["customerID"]
        )

        print("Removed customerID")


    # --------------------------------------------------------
    # 4. Convert target Churn to 0/1
    # --------------------------------------------------------

    if "Churn" in df.columns:

        if df["Churn"].dtype == object:

            df["Churn"] = df["Churn"].map({
                "Yes": 1,
                "No": 0
            })

        print("Churn encoded successfully")


    # --------------------------------------------------------
    # 5. Remove remaining missing values
    # --------------------------------------------------------

    missing_before = df.isnull().sum().sum()

    print(f"Missing values before final cleaning: {missing_before}")

    df = df.dropna()


    # ========================================================
    # FEATURE ENGINEERING
    # ========================================================


    # --------------------------------------------------------
    # Feature 1: Average Monthly Charges
    # --------------------------------------------------------

    if (
        "TotalCharges" in df.columns
        and
        "tenure" in df.columns
    ):

        df["AvgMonthlyCharges"] = (
            df["TotalCharges"] /
            (df["tenure"] + 1)
        )

        print("Created: AvgMonthlyCharges")


    # --------------------------------------------------------
    # Feature 2: Tenure Group
    # --------------------------------------------------------

    if "tenure" in df.columns:

        df["TenureGroup"] = pd.cut(
            df["tenure"],
            bins=[-1, 12, 24, 48, 72],
            labels=[
                "New",
                "Regular",
                "Loyal",
                "Very Loyal"
            ]
        )

        print("Created: TenureGroup")


    # --------------------------------------------------------
    # Feature 3: Total Services
    # --------------------------------------------------------

    service_columns = [
        "PhoneService",
        "MultipleLines",
        "OnlineSecurity",
        "OnlineBackup",
        "DeviceProtection",
        "TechSupport",
        "StreamingTV",
        "StreamingMovies"
    ]

    existing_service_columns = [
        column
        for column in service_columns
        if column in df.columns
    ]

    if existing_service_columns:

        df["TotalServices"] = (
            df[existing_service_columns]
            .apply(
                lambda row: sum(
                    value == "Yes"
                    for value in row
                ),
                axis=1
            )
        )

        print("Created: TotalServices")


    print(f"\nFinal dataset shape: {df.shape}")

    return df


# ============================================================
# LOAD
# ============================================================

def run():
    """
    Complete ETL pipeline.

    Extract
        ->
    Transform
        ->
    Preprocess
        ->
    Feature Engineering
        ->
    Save Processed Data
    """

    print("\n" + "=" * 60)
    print("TELCO CHURN ETL PIPELINE")
    print("=" * 60)

    # Extract
    df = load_raw()

    # Transform + preprocessing + feature engineering
    cleaned = clean(df)

    # Create output directory
    os.makedirs(
        os.path.dirname(PROCESSED_PATH),
        exist_ok=True
    )

    # Save processed data
    cleaned.to_csv(
        PROCESSED_PATH,
        index=False
    )

    print("\n" + "=" * 60)
    print("ETL PIPELINE COMPLETED")
    print("=" * 60)

    print(
        f"Wrote {len(cleaned)} rows to {PROCESSED_PATH}"
    )


if __name__ == "__main__":
    run()