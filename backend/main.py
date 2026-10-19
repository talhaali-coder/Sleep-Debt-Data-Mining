
from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any

from preprocessing import (
    load_dataset,
    TARGET,
    EXCLUDED_COLUMNS
)

from analysis import (
    get_overview,
    get_histogram,
    get_boxplot,
    get_scatterplot,
    get_correlation,
    get_clustering
)


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "best_model.joblib"
OUTPUT_DIR = BASE_DIR / "outputs"

app = FastAPI(
    title="Sleep Debt Data Mining API",
    description=(
        "Data preprocessing, visualization, "
        "machine learning, and prediction."
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class PredictionRequest(BaseModel):
    features: dict[str, Any]


@app.get("/")
def home():
    return {
        "message": "Sleep Debt Data Mining API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "model_exists": MODEL_PATH.exists()
    }


@app.get("/api/overview")
def overview():
    return get_overview()


@app.get("/api/histogram")
def histogram(column: str):
    try:
        return get_histogram(column)
    except ValueError as error:
        raise HTTPException(400, str(error))


@app.get("/api/boxplot")
def boxplot(column: str):
    try:
        return get_boxplot(column)
    except ValueError as error:
        raise HTTPException(400, str(error))


@app.get("/api/scatterplot")
def scatterplot(x_column: str, y_column: str):
    try:
        return get_scatterplot(x_column, y_column)
    except ValueError as error:
        raise HTTPException(400, str(error))


@app.get("/api/correlation")
def correlation():
    return get_correlation()


@app.get("/api/clustering")
def clustering(n_clusters: int = 4):
    if not 2 <= n_clusters <= 10:
        raise HTTPException(
            400, "Choose between 2 and 10 clusters."
        )

    return get_clustering(n_clusters)


@app.get("/api/model-comparison")
def model_comparison():
    path = OUTPUT_DIR / "model_comparison.csv"

    if not path.exists():
        raise HTTPException(
            404, "Train the models first."
        )

    df = pd.read_csv(path)

    return {
        "results": df.to_dict(orient="records")
    }

@app.get("/api/prediction-options")
def prediction_options():
    df = load_dataset()

    features = [
        "age",
        "gender",
        "occupation_type",
        "chronotype",
        "bedtime_phone_minutes",
        "primary_bedtime_app",
        "screen_brightness_pct",
        "blue_light_filter_active",
        "caffeine_post_5pm_mg",
        "physical_activity_min",
        "sleep_latency_min",
        "total_sleep_hours",
        "deep_sleep_pct",
        "rem_sleep_pct",
        "morning_alarm_snoozes",
    ]

    categorical_columns = [
        "gender",
        "occupation_type",
        "chronotype",
        "primary_bedtime_app",
        "blue_light_filter_active",
    ]

    options = {}

    for column in categorical_columns:
        if column in df.columns:
            options[column] = sorted(
                df[column]
                .dropna()
                .astype(str)
                .unique()
                .tolist()
            )

    return {
        "features": features,
        "options": options,
    }


@app.post("/api/predict")
def predict(request: PredictionRequest):
    if not MODEL_PATH.exists():
        raise HTTPException(
            503, "The trained model is unavailable."
        )

    try:
        model = joblib.load(MODEL_PATH)
        expected_features = list(
            model.feature_names_in_
        )

        missing = [
            name for name in expected_features
            if name not in request.features
        ]

        if missing:
            raise HTTPException(
                400,
                f"Missing input features: {missing}"
            )

        row = pd.DataFrame(
            [request.features],
            columns=expected_features
        )

        prediction = model.predict(row)[0]

        result = {
            "prediction": str(prediction)
        }

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(row)[0]

            result["probabilities"] = {
                str(label): round(float(probability), 4)
                for label, probability in zip(
                    model.classes_, probabilities
                )
            }

        return result

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            400, f"Prediction failed: {str(error)}"
        )

@app.get("/api/dataset-preview")
def dataset_preview(limit: int = 100):
    df = load_dataset()

    limit = max(1, min(limit, 500))
    preview = df.head(limit).astype(object)
    preview = preview.where(pd.notna(preview), None)

    return {
        "rows": len(df),
        "columns": list(df.columns),
        "column_count": len(df.columns),
        "missing_values": int(df.isna().sum().sum()),
        "preview_count": len(preview),
        "records": preview.to_dict(orient="records"),
    }


@app.get("/api/dataset-preview")
def dataset_preview(limit: int = 100):
    df = load_dataset()

    limit = max(1, min(limit, 500))
    preview = df.head(limit).astype(object)
    preview = preview.where(pd.notna(preview), None)

    return {
        "rows": len(df),
        "columns": list(df.columns),
        "column_count": len(df.columns),
        "missing_values": int(df.isna().sum().sum()),
        "preview_count": len(preview),
        "records": preview.to_dict(orient="records"),
    }
