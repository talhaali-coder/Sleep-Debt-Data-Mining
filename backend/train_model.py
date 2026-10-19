
from pathlib import Path
import json
import time

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)
from sklearn.ensemble import (
    RandomForestClassifier,
    ExtraTreesClassifier,
    GradientBoostingClassifier
)
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression

from preprocessing import (
    load_dataset,
    build_preprocessor,
    TARGET,
    EXCLUDED_COLUMNS
)


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
OUTPUT_DIR = BASE_DIR / "outputs"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    print("Loading dataset...")

    df = load_dataset()

    excluded = [
        column for column in EXCLUDED_COLUMNS
        if column in df.columns
    ]

    X = df.drop(columns=[TARGET] + excluded)
    y = df[TARGET].astype(str)

    print("Features:", list(X.columns))
    print("Target:", TARGET)
    print("Records:", len(df))

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=42
        ),

        "Decision Tree": DecisionTreeClassifier(
            class_weight="balanced",
            random_state=42
        ),

        "Random Forest": RandomForestClassifier(
            n_estimators=250,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        ),

        "Extra Trees": ExtraTreesClassifier(
            n_estimators=250,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        ),

        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=100,
            random_state=42
        )
    }

    results = []
    fitted_models = {}

    for name, estimator in models.items():
        print(f"\nTraining {name}...")

        pipeline = Pipeline([
            ("preprocessing", build_preprocessor(X_train)),
            ("model", estimator)
        ])

        start = time.perf_counter()
        pipeline.fit(X_train, y_train)
        training_seconds = time.perf_counter() - start

        start = time.perf_counter()
        predictions = pipeline.predict(X_test)
        prediction_seconds = time.perf_counter() - start

        metrics = {
            "model": name,
            "accuracy": accuracy_score(y_test, predictions),
            "precision_macro": precision_score(
                y_test, predictions,
                average="macro", zero_division=0
            ),
            "recall_macro": recall_score(
                y_test, predictions,
                average="macro", zero_division=0
            ),
            "f1_macro": f1_score(
                y_test, predictions,
                average="macro", zero_division=0
            ),
            "training_seconds": training_seconds,
            "prediction_seconds": prediction_seconds
        }

        results.append(metrics)
        fitted_models[name] = pipeline

        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Macro F1: {metrics['f1_macro']:.4f}")
        print(
            f"Training time: {training_seconds:.2f} seconds"
        )

    results_df = pd.DataFrame(results).sort_values(
        by="f1_macro",
        ascending=False
    )

    results_df.to_csv(
        OUTPUT_DIR / "model_comparison.csv",
        index=False
    )

    best_name = results_df.iloc[0]["model"]
    best_model = fitted_models[best_name]
    best_predictions = best_model.predict(X_test)

    joblib.dump(
        best_model,
        MODEL_DIR / "best_model.joblib"
    )

    report = classification_report(
        y_test,
        best_predictions,
        output_dict=True,
        zero_division=0
    )

    with open(
        OUTPUT_DIR / "classification_report.json",
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(report, file, indent=4)

    labels = list(best_model.named_steps["model"].classes_)

    matrix = confusion_matrix(
        y_test,
        best_predictions,
        labels=labels
    )

    pd.DataFrame(
        matrix,
        index=labels,
        columns=labels
    ).to_csv(OUTPUT_DIR / "confusion_matrix.csv")

    with open(
        MODEL_DIR / "model_info.json",
        "w",
        encoding="utf-8"
    ) as file:
        json.dump({
            "best_model": best_name,
            "target": TARGET,
            "excluded_features": excluded,
            "training_records": len(X_train),
            "testing_records": len(X_test),
            "selection_metric": "macro F1-score",
            "best_model_metrics": results_df.iloc[0].to_dict()
        }, file, indent=4)

    print("\n" + "=" * 50)
    print("MODEL COMPARISON")
    print("=" * 50)
    print(results_df.to_string(index=False))

    print("\nBEST MODEL:", best_name)
    print("Saved to:", MODEL_DIR / "best_model.joblib")
    print("Results saved to:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
