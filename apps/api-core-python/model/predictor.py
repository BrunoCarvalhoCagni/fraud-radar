import logging
from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger("fraud-detector-predictor")

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"


class FraudDetector:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Load serialized ML artifacts from disk."""
        try:
            model_path = ARTIFACTS_DIR / "isolation_forest.joblib"
            scaler_path = ARTIFACTS_DIR / "amount_scaler.joblib"
            features_path = ARTIFACTS_DIR / "features.joblib"

            logger.info("Loading ML model and scaler artifacts...")
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.feature_names = joblib.load(features_path)
            logger.info("ML engine successfully initialized and ready for inference.")
        except Exception as exc:
            logger.error(f"Failed to load model artifacts: {exc}")
            raise RuntimeError(
                "Model artifacts not found. Please run 'python model/train.py' first."
            ) from exc

    def calculate_risk_score(self, decision_score: float) -> float:
        """
        Normalize raw decision function output into a 0.0 - 1.0 risk range.
        IsolationForest decision_function outputs negative values for anomalies,
        typically in the range [-0.5, 0.5].
        """
        # Invert score: lower decision score -> higher anomaly likelihood
        inverted_score = -decision_score
        
        # Sigmoid-like min-max normalization mapping to [0.0, 1.0]
        # Standard anomaly threshold is around 0.5
        normalized_score = 1.0 / (1.0 + np.exp(-12.0 * inverted_score))
        return float(np.clip(normalized_score, 0.0, 1.0))

    def predict(self, transaction: Dict[str, Any]) -> Tuple[float, bool]:
        """
        Run inference on a single transaction payload.
        
        Returns:
            Tuple[float, bool]: (risk_score, is_flagged_anomaly)
        """
        # 1. Scale Amount
        raw_amount = float(transaction.get("amount", 0.0))
        scaled_amount = self.scaler.transform([[raw_amount]])[0][0]

        # 2. Build feature vector matching training order
        features_dict = {f"V{i}": transaction.get(f"V{i}", 0.0) for i in range(1, 29)}
        features_dict["scaled_amount"] = scaled_amount

        features_df = pd.DataFrame([features_dict])[self.feature_names]

        # 3. Model Inference
        raw_prediction = self.model.predict(features_df)[0]  # -1 = anomaly, 1 = normal
        decision_score = self.model.decision_function(features_df)[0]

        # 4. Normalize risk score
        risk_score = self.calculate_risk_score(decision_score)
        is_anomaly = bool(raw_prediction == -1)

        return round(risk_score, 4), is_anomaly