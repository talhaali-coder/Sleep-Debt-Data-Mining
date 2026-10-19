
import pandas as pd

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from preprocessing import load_dataset, TARGET, EXCLUDED_COLUMNS


def get_overview():
    df = load_dataset()

    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": df.columns.tolist(),
        "missing_values": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "class_distribution": {
            str(k): int(v)
            for k, v in df[TARGET].value_counts().items()
        },
        "numeric_columns": df.select_dtypes(
            include="number"
        ).columns.tolist(),
        "categorical_columns": df.select_dtypes(
            exclude="number"
        ).columns.tolist(),
        "preview": df.head(10).fillna("").to_dict(
            orient="records"
        )
    }


def get_histogram(column):
    df = load_dataset()

    if column not in df.select_dtypes(
        include="number"
    ).columns:
        raise ValueError("Select a numerical column.")

    values = df[column].dropna()

    counts, edges = pd.cut(
        values, bins=15, retbins=True
    )
    frequencies = counts.value_counts().sort_index()

    return {
        "column": column,
        "labels": [
            str(interval) for interval in frequencies.index
        ],
        "values": [
            int(value) for value in frequencies.values
        ],
        "mean": float(values.mean()),
        "median": float(values.median()),
        "std": float(values.std())
    }


def get_boxplot(column):
    df = load_dataset()

    if column not in df.select_dtypes(
        include="number"
    ).columns:
        raise ValueError("Select a numerical column.")

    values = df[column].dropna()

    q1 = values.quantile(0.25)
    q3 = values.quantile(0.75)
    iqr = q3 - q1

    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr

    return {
        "column": column,
        "min": float(values.min()),
        "q1": float(q1),
        "median": float(values.median()),
        "q3": float(q3),
        "max": float(values.max()),
        "lower_fence": float(lower),
        "upper_fence": float(upper),
        "outlier_count": int(
            ((values < lower) | (values > upper)).sum()
        )
    }


def get_scatterplot(x_column, y_column):
    df = load_dataset()

    numeric_columns = df.select_dtypes(
        include="number"
    ).columns

    if (
        x_column not in numeric_columns
        or y_column not in numeric_columns
    ):
        raise ValueError(
            "Both scatterplot columns must be numerical."
        )

    sample = df[[x_column, y_column]].dropna()

    if len(sample) > 1500:
        sample = sample.sample(
            n=1500, random_state=42
        )

    return {
        "x_column": x_column,
        "y_column": y_column,
        "points": [
            {"x": float(x), "y": float(y)}
            for x, y in zip(
                sample[x_column], sample[y_column]
            )
        ]
    }


def get_correlation():
    df = load_dataset()

    numeric = df.select_dtypes(
        include="number"
    )

    correlation = numeric.corr().fillna(0)

    return {
        "columns": correlation.columns.tolist(),
        "matrix": correlation.values.tolist()
    }


def get_clustering(n_clusters=4):
    df = load_dataset()

    excluded = [
        column for column in EXCLUDED_COLUMNS
        if column in df.columns
    ]

    X = df.drop(
        columns=[TARGET] + excluded
    )

    X = pd.get_dummies(
        X, dummy_na=True, dtype=float
    )

    X = X.fillna(X.median()).fillna(0)

    scaled = StandardScaler().fit_transform(X)

    model = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10
    )

    labels = model.fit_predict(scaled)

    counts = pd.Series(labels).value_counts().sort_index()

    return {
        "clusters": int(n_clusters),
        "cluster_sizes": {
            str(k): int(v)
            for k, v in counts.items()
        },
        "records": int(len(labels)),
        "inertia": float(model.inertia_),
        "note": (
            "Clusters are unsupervised groups, not "
            "the actual sleep-debt categories."
        )
    }
