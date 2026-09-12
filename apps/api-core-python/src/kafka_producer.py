import json
import logging
from typing import Any, Dict
from aiokafka import AIOKafkaProducer
from src.config import settings

logger = logging.getLogger("fraud-radar-producer")


class AsyncKafkaProducerService:
    def __init__(self):
        self._producer: AIOKafkaProducer | None = None

    async def start(self) -> None:
        """Initialize and start async Kafka producer client."""
        logger.info(f"Connecting to Kafka brokers at: {settings.KAFKA_BOOTSTRAP_SERVERS}")
        self._producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            retry_backoff_ms=500,
        )
        await self._producer.start()
        logger.info("Kafka producer successfully connected and ready.")

    async def stop(self) -> None:
        """Gracefully disconnect Kafka producer."""
        if self._producer:
            logger.info("Closing Kafka producer connection...")
            await self._producer.stop()
            logger.info("Kafka producer stopped.")

    async def publish_event(self, topic: str, key: str, event_data: Dict[str, Any]) -> None:
        """Publish a scored transaction event to the specified topic."""
        if not self._producer:
            raise RuntimeError("Kafka producer is not running. Call start() first.")

        try:
            await self._producer.send_and_wait(topic=topic, key=key, value=event_data)
            logger.debug(f"Event successfully published to topic [{topic}] with key [{key}]")
        except Exception as exc:
            logger.error(f"Failed to produce message to Kafka topic [{topic}]: {exc}")
            raise


kafka_producer_service = AsyncKafkaProducerService()