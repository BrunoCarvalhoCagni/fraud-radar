import logging
import os
import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("fraud-detector-train")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "creditcard.csv"
ARTIFACTS_DIR = BASE_DIR / "model" / "artifacts"


def load_dataset(file_path: Path) -> pd.DataFrame:
    """Load transaction dataset from CSV."""
    if not file_path.exists():
        logger.error(f"Dataset not found at: {file_path}")
        logger.info("Please download creditcard.csv from Kaggle and place it in the data/ directory.")
        sys.exit(1)

    logger.info(f"Loading dataset from {file_path}...")
    df = pd.read_csv(file_path)
    logger.info(f"Dataset successfully loaded. Shape: {df.shape}")
    return df


def preprocess_data(df: pd.DataFrame):
    """
    Scale features and split dataset into training and testing sets.
    Features used: Scaled Amount + PCA components (V1 to V28).
    """
    logger.info("Starting data preprocessing...")
    scaler = RobustScaler()

    # RobustScaler is less prone to outliers than StandardScaler
    df["scaled_amount"] = scaler.fit_transform(df["Amount"].values.reshape(-1, 1))

    # Features: V1 through V28 + scaled_amount
    feature_columns = [f"V{i}" for i in range(1, 29)] + ["scaled_amount"]

    X = df[feature_columns]
    y = df["Class"]  # 0 = Normal, 1 = Fraud

    # Split: 80% train, 20% test (stratified because dataset is highly imbalanced)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    logger.info(
        f"Train set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples"
    )
    return X_train, X_test, y_train, y_test, scaler, feature_columns


def train_isolation_forest(X_train: pd.DataFrame, contamination_rate: float = 0.0017) -> IsolationForest:
    """
    Train Isolation Forest model.
    contamination_rate ~ 0.17% matching real-world credit card fraud frequency.
    """
    logger.info(f"Training Isolation Forest (contamination={contamination_rate})...")
    
    model = IsolationForest(
        n_estimators=150,
        max_samples="auto",
        contamination=contamination_rate,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train)
    logger.info("Model training completed successfully.")
    return model


def evaluate_model(model: IsolationForest, X_test: pd.DataFrame, y_test: pd.Series):
    """
    Evaluate anomaly detection performance against ground truth labels.
    """
    logger.info("Evaluating model against test set...")

    # Isolation Forest outputs: -1 for anomaly/fraud, 1 for normal
    raw_preds = model.predict(X_test)
    y_pred = np.where(raw_preds == -1, 1, 0)

    # Decision function: lower values mean more anomalous
    scores = model.decision_function(X_test)
    # Invert score so higher value = higher risk (fraud likelihood)
    risk_scores = -scores

    roc_auc = roc_auc_score(y_test, risk_scores)
    logger.info(f"ROC-AUC Score: {roc_auc:.4f}")
    logger.info("\nClassification Report:\n" + classification_report(y_test, y_pred, digits=4))


def save_artifacts(model: IsolationForest, scaler: RobustScaler, feature_names: list):
    """Persist trained artifacts to disk."""
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    model_path = ARTIFACTS_DIR / "isolation_forest.joblib"
    scaler_path = ARTIFACTS_DIR / "amount_scaler.joblib"
    metadata_path = ARTIFACTS_DIR / "features.joblib"

    logger.info(f"Saving artifacts to: {ARTIFACTS_DIR}")
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(feature_names, metadata_path)
    logger.info("All artifacts successfully saved!")


def main():
    df = load_dataset(DATA_PATH)
    X_train, X_test, y_train, y_test, scaler, feature_columns = preprocess_data(df)
    
    model = train_isolation_forest(X_train)
    evaluate_model(model, X_test, y_test)
    save_artifacts(model, scaler, feature_columns)


if __name__ == "__main__":
    main()