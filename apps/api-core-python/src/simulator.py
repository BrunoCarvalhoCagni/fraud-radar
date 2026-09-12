import asyncio
import logging
import random
import uuid
from datetime import datetime, timezone
import pandas as pd
from model.predictor import FraudDetector
from src.config import settings
from src.kafka_producer import kafka_producer_service
from src.schemas import ScoredTransactionEvent

logger = logging.getLogger("fraud-radar-simulator")


class TransactionSimulator:
    def __init__(self, detector: FraudDetector):
        self.detector = detector
        self.is_running: bool = False
        self.speed_seconds: float = 0.5
        self.emitted_count: int = 0
        self._task: asyncio.Task | None = None

    async def start(self, speed_seconds: float = 0.5, include_fraud_only: bool = False) -> None:
        """Start the background streaming worker."""
        if self.is_running:
            logger.warning("Simulation is already running.")
            return

        self.is_running = True
        self.speed_seconds = speed_seconds
        self.emitted_count = 0
        self._task = asyncio.create_task(self._stream_dataset(include_fraud_only))
        logger.info(f"Transaction simulation started (interval: {speed_seconds}s).")

    async def stop(self) -> None:
        """Stop the background streaming worker."""
        if not self.is_running:
            return

        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                logger.info("Simulation background task successfully cancelled.")
        logger.info(f"Simulation stopped. Total events streamed: {self.emitted_count}")

    async def _stream_dataset(self, include_fraud_only: bool) -> None:
        """Iterate over Kaggle dataset and emit scored transactions."""
        try:
            logger.info(f"Loading dataset from {settings.DATASET_PATH} for simulation replay...")
            df = pd.read_csv(settings.DATASET_PATH)

            if include_fraud_only:
                df = df[df["Class"] == 1]
                logger.info(f"Filtered dataset to fraud-only transactions. Total rows: {len(df)}")

            # Shuffle rows for realistic varied stream
            df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

            for _, row in df.iterrows():
                if not self.is_running:
                    break

                # Prepare feature dictionary
                tx_dict = {f"V{i}": float(row[f"V{i}"]) for i in range(1, 29)}
                tx_dict["amount"] = float(row["Amount"])

                # Run Machine Learning inference
                risk_score, is_anomaly = self.detector.predict(tx_dict)

                tx_id = f"tx_{uuid.uuid4().hex[:10]}"
                card_last4 = f"{random.randint(1000, 9999)}"
                customer_id = f"cus_{uuid.uuid4().hex[:8]}"

                event = ScoredTransactionEvent(
                    transaction_id=tx_id,
                    amount=round(float(row["Amount"]), 2),
                    currency="USD",
                    card_last4=card_last4,
                    customer_id=customer_id,
                    risk_score=risk_score,
                    is_anomaly=is_anomaly,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    metadata={
                        "kaggle_ground_truth": int(row.get("Class", 0)),
                        "source": "kaggle_stream_replay",
                    },
                )

                # Produce to Kafka topic
                await kafka_producer_service.publish_event(
                    topic=settings.KAFKA_TOPIC_TRANSACTIONS,
                    key=tx_id,
                    event_data=event.model_dump(),
                )

                self.emitted_count += 1
                if self.emitted_count % 10 == 0:
                    logger.info(
                        f"Streamed {self.emitted_count} txs | Last Tx: {tx_id} | Risk: {risk_score * 100:.1f}%"
                    )

                await asyncio.sleep(self.speed_seconds)

        except asyncio.CancelledError:
            logger.info("Stream loop cancelled by user.")
        except Exception as exc:
            logger.error(f"Error during dataset simulation stream: {exc}", exc_info=True)
            self.is_running = False