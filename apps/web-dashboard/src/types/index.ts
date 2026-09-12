export type DecisionAction = 'APPROVED' | 'MANUAL_REVIEW' | 'BLOCKED';

export interface EnrichedTransactionEvent {
  event_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  card_last4: string;
  customer_id?: string;
  risk_score: number;
  is_anomaly: boolean;
  timestamp: string;
  decision: DecisionAction;
  reasons: string[];
  processed_at: string;
  processing_time_ms: number;
  metadata?: Record<string, unknown>;
}

export interface SystemMetrics {
  totalProcessed: number;
  totalApproved: number;
  totalReviewed: number;
  totalBlocked: number;
  totalBlockedAmount: number;
  fraudRatePercentage: number;
}

export interface SimulationState {
  isRunning: boolean;
  speedSeconds: number;
  includeFraudOnly: boolean;
}