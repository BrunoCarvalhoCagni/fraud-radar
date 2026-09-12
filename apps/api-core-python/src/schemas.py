from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid


class TransactionPayload(BaseModel):
    """Payload for manual transaction scoring."""
    transaction_id: str = Field(default_factory=lambda: f"tx_{uuid.uuid4().hex[:10]}")
    amount: float = Field(..., gt=0, description="Transaction monetary amount")
    currency: str = Field(default="USD", max_length=3)
    card_last4: str = Field(default="4242", min_length=4, max_length=4)
    customer_id: Optional[str] = Field(default=None)
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    features: Dict[str, float] = Field(
        default_factory=dict,
        description="Dictionary with PCA components V1 to V28"
    )


class ScoredTransactionEvent(BaseModel):
    """Schema for messages published to Kafka."""
    event_id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    transaction_id: str
    amount: float
    currency: str
    card_last4: str
    customer_id: Optional[str] = None
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk: 0.0 to 1.0")
    is_anomaly: bool
    timestamp: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SimulationStartRequest(BaseModel):
    """Configuration to start streaming Kaggle dataset rows."""
    speed_seconds: float = Field(
        default=0.5,
        ge=0.05,
        le=5.0,
        description="Delay between transaction emissions in seconds"
    )
    include_fraud_only: bool = Field(
        default=False,
        description="If True, filters dataset to stream only fraudulent rows for testing"
    )


class SimulationStatusResponse(BaseModel):
    is_running: bool
    emitted_count: int
    speed_seconds: float