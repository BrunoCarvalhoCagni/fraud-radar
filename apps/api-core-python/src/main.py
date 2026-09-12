import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from model.predictor import FraudDetector
from src.config import settings
from src.kafka_producer import kafka_producer_service
from src.schemas import (
    ScoredTransactionEvent,
    SimulationStartRequest,
    SimulationStatusResponse,
    TransactionPayload,
)
from src.simulator import TransactionSimulator

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("fraud-radar-api")

# Global instances
fraud_detector: FraudDetector | None = None
simulator: TransactionSimulator | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to handle startup and shutdown events."""
    global fraud_detector, simulator
    logger.info(f"Starting {settings.APP_NAME} in [{settings.ENVIRONMENT}] mode...")

    # 1. Load ML Model
    fraud_detector = FraudDetector()

    # 2. Connect Kafka Producer
    await kafka_producer_service.start()

    # 3. Instantiate Simulator
    simulator = TransactionSimulator(detector=fraud_detector)

    yield

    # Shutdown sequence
    logger.info("Executing shutdown sequence...")
    if simulator:
        await simulator.stop()
    await kafka_producer_service.stop()
    logger.info("Cleanup completed. Server shutdown.")


app = FastAPI(
    title="Fraud Radar Core API",
    description="Real-time ML-powered Fraud Detection Engine with Kafka Event Streaming",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "kafka_connected": kafka_producer_service._producer is not None,
    }


@app.post(
    "/api/v1/transactions/score",
    response_model=ScoredTransactionEvent,
    status_code=status.HTTP_201_CREATED,
    tags=["Transactions"],
)
async def score_single_transaction(payload: TransactionPayload):
    """
    Score a single transaction via ML model and publish the event to Kafka.
    """
    if not fraud_detector:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model engine is not ready.",
        )

    # Convert payload into feature map for predictor
    features_input = {**payload.features, "amount": payload.amount}
    risk_score, is_anomaly = fraud_detector.predict(features_input)

    event = ScoredTransactionEvent(
        transaction_id=payload.transaction_id,
        amount=payload.amount,
        currency=payload.currency,
        card_last4=payload.card_last4,
        customer_id=payload.customer_id,
        risk_score=risk_score,
        is_anomaly=is_anomaly,
        timestamp=payload.timestamp,
        metadata={"source": "direct_api_call"},
    )

    # Publish to Kafka
    await kafka_producer_service.publish_event(
        topic=settings.KAFKA_TOPIC_TRANSACTIONS,
        key=payload.transaction_id,
        event_data=event.model_dump(),
    )

    return event


@app.post("/api/v1/simulation/start", tags=["Simulation"])
async def start_simulation(body: SimulationStartRequest):
    """Start replaying Kaggle dataset transactions into Kafka."""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator engine not initialized.")

    if simulator.is_running:
        return {"message": "Simulation is already active.", "status": "running"}

    await simulator.start(
        speed_seconds=body.speed_seconds,
        include_fraud_only=body.include_fraud_only,
    )
    return {
        "message": "Dataset streaming simulation started successfully.",
        "speed_seconds": body.speed_seconds,
    }


@app.post("/api/v1/simulation/stop", tags=["Simulation"])
async def stop_simulation():
    """Stop the running dataset stream simulation."""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator engine not initialized.")

    await simulator.stop()
    return {
        "message": "Simulation halted.",
        "total_emitted": simulator.emitted_count,
    }


@app.get(
    "/api/v1/simulation/status",
    response_model=SimulationStatusResponse,
    tags=["Simulation"],
)
async def get_simulation_status():
    """Get the current state and metrics of the stream simulator."""
    if not simulator:
        return SimulationStatusResponse(is_running=False, emitted_count=0, speed_seconds=0.5)

    return SimulationStatusResponse(
        is_running=simulator.is_running,
        emitted_count=simulator.emitted_count,
        speed_seconds=simulator.speed_seconds,
    )