from model.predictor import FraudDetector

detector = FraudDetector()

# Sample mock transaction
mock_tx = {
    "amount": 1499.99,
    "V1": -1.3598,
    "V2": -0.0727,
    "V3": 2.5363,
    "V4": 1.3781,
    # Remaining V features will default to 0.0
}

risk_score, is_anomaly = detector.predict(mock_tx)
print(f"Risk Score: {risk_score * 100:.2f}% | Flagged as Anomaly: {is_anomaly}")