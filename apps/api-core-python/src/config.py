import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "FraudRadar-CoreEngine"
    ENVIRONMENT: str = "development"
    
    # Kafka Configuration
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_TRANSACTIONS: str = "transactions.scored"

    # Dataset & Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATASET_PATH: Path = BASE_DIR / "data" / "creditcard.csv"

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()