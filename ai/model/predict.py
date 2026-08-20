"""
Loads the trained churn_model.pkl and scores a single customer profile.

Returns:
1. Churn probability
2. Top factors that increased or decreased churn risk

Used by reason_agent.py to create a human-readable explanation.
"""

import os

import joblib
import numpy as np
import pandas as pd


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "churn_model.pkl"
)


_cache = {}


# ============================================================
# LOAD MODEL
# ============================================================

def _load():

    if "bundle" not in _cache:

        if not os.path.exists(
            MODEL_PATH
        ):

            raise FileNotFoundError(
                "churn_model.pkl not found — "
                "run `python model/train.py` first."
            )


        _cache["bundle"] = joblib.load(
            MODEL_PATH
        )


    return _cache["bundle"]


# ============================================================
# RISK DIRECTION RULES
# ============================================================

RISK_DIRECTION_RULES = {

    "tenure":
        lambda v: "down" if v >= 24 else "up",

    "MonthlyCharges":
        lambda v: "up" if v >= 70 else "down",

    "TotalCharges":
        lambda v: "down" if v >= 1500 else "up",

    "AvgMonthlyCharges":
        lambda v: "up" if v >= 70 else "down",

    "TotalServices":
        lambda v: "down" if v >= 4 else "up",

    "TenureGroup":
        lambda v: (
            "up"
            if v in ["New", "Regular"]
            else "down"
        ),

    "Contract":
        lambda v: (
            "up"
            if v == "Month-to-month"
            else "down"
        ),

    "InternetService":
        lambda v: (
            "up"
            if v == "Fiber optic"
            else "down"
        ),

    "PaymentMethod":
        lambda v: (
            "up"
            if v == "Electronic check"
            else "down"
        ),

    "TechSupport":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "OnlineSecurity":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "OnlineBackup":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "DeviceProtection":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "StreamingTV":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "StreamingMovies":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "PaperlessBilling":
        lambda v: (
            "up"
            if v == "Yes"
            else "down"
        ),

    "Partner":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "Dependents":
        lambda v: (
            "up"
            if v == "No"
            else "down"
        ),

    "MultipleLines":
        lambda v: (
            "up"
            if v == "Yes"
            else "down"
        ),

    "SeniorCitizen":
        lambda v: (
            "up"
            if str(v) == "1"
            else "down"
        ),

}


# ============================================================
# FRIENDLY FEATURE NAMES
# ============================================================

FRIENDLY_NAMES = {

    "tenure":
        "Tenure",

    "MonthlyCharges":
        "Monthly charges",

    "TotalCharges":
        "Total charges",

    "AvgMonthlyCharges":
        "Average monthly charges",

    "TotalServices":
        "Total services",

    "TenureGroup":
        "Customer tenure group",

    "Contract":
        "Contract type",

    "InternetService":
        "Internet service",

    "PaymentMethod":
        "Payment method",

    "TechSupport":
        "Tech support",

    "OnlineSecurity":
        "Online security",

    "OnlineBackup":
        "Online backup",

    "DeviceProtection":
        "Device protection",

    "StreamingTV":
        "Streaming TV",

    "StreamingMovies":
        "Streaming movies",

    "PaperlessBilling":
        "Paperless billing",

    "gender":
        "Gender",

    "SeniorCitizen":
        "Senior citizen",

    "Partner":
        "Has partner",

    "Dependents":
        "Has dependents",

    "MultipleLines":
        "Multiple lines",

}


# ============================================================
# FEATURE ENGINEERING FOR SINGLE PREDICTION
# ============================================================

def add_engineered_features(
    row: dict
) -> dict:
    """
    Create the same engineered features
    used during model training.
    """

    row = row.copy()


    # --------------------------------------------------------
    # AvgMonthlyCharges
    # --------------------------------------------------------

    if (
        row.get("AvgMonthlyCharges") is None
    ):

        tenure = row.get("tenure")

        total_charges = row.get(
            "TotalCharges"
        )


        try:

            tenure = float(tenure)

            total_charges = float(
                total_charges
            )


            row["AvgMonthlyCharges"] = (
                total_charges /
                (tenure + 1)
            )

        except (
            TypeError,
            ValueError
        ):

            row["AvgMonthlyCharges"] = 0


    # --------------------------------------------------------
    # TenureGroup
    # --------------------------------------------------------

    if (
        row.get("TenureGroup") is None
    ):

        try:

            tenure = float(
                row.get("tenure", 0)
            )


            if tenure <= 12:

                row["TenureGroup"] = "New"


            elif tenure <= 24:

                row["TenureGroup"] = "Regular"


            elif tenure <= 48:

                row["TenureGroup"] = "Loyal"


            else:

                row["TenureGroup"] = (
                    "Very Loyal"
                )


        except (
            TypeError,
            ValueError
        ):

            row["TenureGroup"] = "New"


    # --------------------------------------------------------
    # TotalServices
    # --------------------------------------------------------

    if (
        row.get("TotalServices") is None
    ):

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


        row["TotalServices"] = sum(

            row.get(column) == "Yes"

            for column in service_columns

        )


    return row


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

def get_feature_importance(
    pipeline,
    features
):
    """
    Extract feature importance from different model types.

    Supports:
    - Random Forest
    - Gradient Boosting
    - Logistic Regression
    """

    model = pipeline.named_steps["model"]

    preprocessor = pipeline.named_steps[
        "preprocess"
    ]


    try:

        feature_names = (
            preprocessor.get_feature_names_out()
        )

    except Exception:

        return {
            feature: 1.0 / len(features)
            for feature in features
        }


    # --------------------------------------------------------
    # Tree models
    # --------------------------------------------------------

    if hasattr(
        model,
        "feature_importances_"
    ):

        importances = (
            model.feature_importances_
        )


    # --------------------------------------------------------
    # Logistic Regression
    # --------------------------------------------------------

    elif hasattr(
        model,
        "coef_"
    ):

        importances = np.abs(
            model.coef_[0]
        )


    else:

        return {
            feature: 1.0 / len(features)
            for feature in features
        }


    # Aggregate encoded features
    agg_importance = {

        feature: 0.0

        for feature in features

    }


    for name, importance in zip(
        feature_names,
        importances
    ):

        for feature in features:

            if (
                name.endswith(feature)

                or

                f"__{feature}" in name

                or

                name.split("__")[-1].startswith(
                    feature
                )

            ):

                agg_importance[
                    feature
                ] += float(
                    importance
                )

                break


    total = (

        sum(
            agg_importance.values()
        )

        or

        1.0

    )


    return {

        feature:

        value / total

        for feature, value

        in agg_importance.items()

    }


# ============================================================
# PREDICTION
# ============================================================

def predict(
    profile: dict
) -> dict:


    # Load trained model
    bundle = _load()


    pipeline = bundle["pipeline"]


    features = bundle["features"]


    model_name = bundle.get(

        "model_name",

        "Unknown"

    )


    # --------------------------------------------------------
    # Create engineered features
    # --------------------------------------------------------

    profile = add_engineered_features(
        profile
    )


    # --------------------------------------------------------
    # Keep only required features
    # --------------------------------------------------------

    row = {

        feature:

        profile.get(feature)

        for feature in features

    }


    # --------------------------------------------------------
    # Numeric conversion
    # --------------------------------------------------------

    numeric_fields = [

        "tenure",

        "MonthlyCharges",

        "TotalCharges",

        "AvgMonthlyCharges",

        "TotalServices"

    ]


    for field in numeric_fields:

        if (

            field in row

            and

            row[field] is not None

        ):

            try:

                row[field] = float(
                    row[field]
                )

            except (
                TypeError,
                ValueError
            ):

                pass


    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    X = pd.DataFrame([
        row
    ])


    # --------------------------------------------------------
    # Predict probability
    # --------------------------------------------------------

    probability = float(

        pipeline.predict_proba(
            X
        )[0][1]

    )


    # --------------------------------------------------------
    # Get feature importance
    # --------------------------------------------------------

    agg_importance = (
        get_feature_importance(
            pipeline,
            features
        )
    )


    # --------------------------------------------------------
    # Create explainable factors
    # --------------------------------------------------------

    factors = []


    for feature in features:


        value = row.get(
            feature
        )


        direction_function = (

            RISK_DIRECTION_RULES.get(
                feature
            )

        )


        direction = (

            direction_function(value)

            if (

                direction_function

                and

                value is not None

            )

            else

            "up"

        )


        factors.append({

            "name":

            FRIENDLY_NAMES.get(
                feature,
                feature
            ),

            "impact":

            round(

                agg_importance.get(
                    feature,
                    0
                ),

                3

            ),

            "direction":

            direction

        })


    # Sort by importance
    factors.sort(

        key=lambda item:

        item["impact"],

        reverse=True

    )


    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {

        "probability":

        round(
            probability,
            4
        ),

        "model":

        model_name,

        "factors":

        factors[:5]

    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    sample = {

        "tenure": 3,

        "MonthlyCharges": 89.5,

        "TotalCharges": 260.0,

        "Contract":
            "Month-to-month",

        "InternetService":
            "Fiber optic",

        "PaymentMethod":
            "Electronic check",

        "TechSupport":
            "No",

        "OnlineSecurity":
            "No",

        "OnlineBackup":
            "No",

        "DeviceProtection":
            "No",

        "StreamingTV":
            "No",

        "StreamingMovies":
            "No",

        "PaperlessBilling":
            "Yes",

        "gender":
            "Male",

        "SeniorCitizen":
            0,

        "Partner":
            "No",

        "Dependents":
            "No",

        "MultipleLines":
            "Yes",

        "PhoneService":
            "Yes"

    }


    result = predict(
        sample
    )


    print("\nPrediction Result:\n")


    print(
        result
    )