"""
Trains multiple churn classifiers on the cleaned dataset
and saves the best model together with its preprocessing pipeline.

Models:
1. Logistic Regression
2. Random Forest
3. Gradient Boosting

Run:
    python model/train.py
"""

import os
import json
from datetime import datetime, timezone

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer

from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier
)

from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    accuracy_score
)

from sklearn.model_selection import train_test_split

from sklearn.pipeline import Pipeline

from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler
)

import preprocess


# ============================================================
# PATHS
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "churn_model.pkl"
)

METRICS_PATH = os.path.join(
    os.path.dirname(__file__),
    "metrics.json"
)

MODEL_VERSION = "2.0.0"


# ============================================================
# FEATURES
# ============================================================

NUMERIC_FEATURES = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
    "AvgMonthlyCharges",
    "TotalServices",
]

CATEGORICAL_FEATURES = [
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
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "MultipleLines",
    "TenureGroup",
]

TARGET = "Churn"


# ============================================================
# PREPROCESSING PIPELINE
# ============================================================

def build_preprocessor(
    numeric_features,
    categorical_features
) -> ColumnTransformer:
    """
    Build preprocessing pipeline.
    """

    return ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                numeric_features
            ),
            (
                "cat",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                categorical_features
            ),
        ]
    )


# ============================================================
# MODELS
# ============================================================

def get_models():
    """
    Return all models for comparison.
    """

    return {

        "LogisticRegression":

        LogisticRegression(
            max_iter=1000,
            random_state=42
        ),


        "RandomForest":

        RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            random_state=42,
            class_weight="balanced"
        ),


        "GradientBoosting":

        GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=3,
            random_state=42
        )

    }


# ============================================================
# PIPELINE
# ============================================================

def build_pipeline(
    model,
    numeric_features,
    categorical_features
) -> Pipeline:
    """
    Combine preprocessing and ML model.
    """

    preprocessor = build_preprocessor(
        numeric_features,
        categorical_features
    )

    return Pipeline(
        steps=[
            (
                "preprocess",
                preprocessor
            ),
            (
                "model",
                model
            )
        ]
    )


# ============================================================
# TRAINING
# ============================================================

def run():

    # --------------------------------------------------------
    # Check processed data
    # --------------------------------------------------------

    if not os.path.exists(
        preprocess.PROCESSED_PATH
    ):

        print(
            "Processed data not found "
            "— running preprocess.py first..."
        )

        preprocess.run()


    # --------------------------------------------------------
    # Load processed data
    # --------------------------------------------------------

    df = pd.read_csv(
        preprocess.PROCESSED_PATH
    )


    # --------------------------------------------------------
    # Keep only available features
    # --------------------------------------------------------

    numeric_features = [
        column
        for column in NUMERIC_FEATURES
        if column in df.columns
    ]

    categorical_features = [
        column
        for column in CATEGORICAL_FEATURES
        if column in df.columns
    ]

    features = (
        numeric_features +
        categorical_features
    )


    if not features:
        raise ValueError(
            "No valid training features found."
        )


    # --------------------------------------------------------
    # Remove missing values
    # --------------------------------------------------------

    df = df.dropna(
        subset=features + [TARGET]
    )


    X = df[features]

    y = df[TARGET]


    # --------------------------------------------------------
    # Train / Test Split
    # --------------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )


    print("\n" + "=" * 60)
    print("TELCO CHURN MODEL TRAINING")
    print("=" * 60)

    print(f"\nTraining rows: {len(X_train)}")
    print(f"Testing rows: {len(X_test)}")


    # --------------------------------------------------------
    # Train all models
    # --------------------------------------------------------

    models = get_models()

    results = {}

    best_model_name = None
    best_pipeline = None
    best_auc = -1


    for model_name, model in models.items():

        print("\n" + "=" * 60)
        print(f"TRAINING: {model_name}")
        print("=" * 60)


        pipeline = build_pipeline(
            model,
            numeric_features,
            categorical_features
        )


        # Train
        pipeline.fit(
            X_train,
            y_train
        )


        # Predict
        preds = pipeline.predict(
            X_test
        )

        probs = pipeline.predict_proba(
            X_test
        )[:, 1]


        # Metrics
        auc = round(
            roc_auc_score(
                y_test,
                probs
            ),
            4
        )

        accuracy = round(
            accuracy_score(
                y_test,
                preds
            ),
            4
        )


        print("\nClassification Report:\n")

        print(
            classification_report(
                y_test,
                preds
            )
        )


        print(
            f"Accuracy: {accuracy}"
        )

        print(
            f"ROC AUC: {auc}"
        )


        results[model_name] = {
            "auc": auc,
            "accuracy": accuracy
        }


        # Select best model by ROC-AUC
        if auc > best_auc:

            best_auc = auc

            best_model_name = model_name

            best_pipeline = pipeline


    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    joblib.dump(
        {
            "pipeline": best_pipeline,
            "features": features,
            "model_name": best_model_name,
            "numeric_features": numeric_features,
            "categorical_features": categorical_features,
        },
        MODEL_PATH
    )


    print("\n" + "=" * 60)
    print("BEST MODEL")
    print("=" * 60)

    print(
        f"Model: {best_model_name}"
    )

    print(
        f"Best ROC AUC: {best_auc}"
    )

    print(
        f"\nSaved model to {MODEL_PATH}"
    )


    # ========================================================
    # SAVE METRICS
    # ========================================================

    metrics = {

        "version": MODEL_VERSION,

        "bestModel": best_model_name,

        "bestAUC": best_auc,

        "trainingRows": len(df),

        "trainedAt": datetime.now(
            timezone.utc
        ).isoformat(),

        "models": results

    }


    with open(
        METRICS_PATH,
        "w"
    ) as file:

        json.dump(
            metrics,
            file,
            indent=2
        )


    print(
        f"Saved metrics to {METRICS_PATH}"
    )


    # ========================================================
    # FINAL COMPARISON
    # ========================================================

    print("\n" + "=" * 60)
    print("MODEL COMPARISON")
    print("=" * 60)


    for model_name, result in results.items():

        print(f"\n{model_name}")

        print(
            f"Accuracy: {result['accuracy']}"
        )

        print(
            f"ROC AUC: {result['auc']}"
        )


if __name__ == "__main__":
    run()