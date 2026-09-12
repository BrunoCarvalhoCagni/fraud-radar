export type DecisionAction = 'APPROVED' | 'MANUAL_REVIEW' | 'BLOCKED';

export interface RawScoredEvent {
  event_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  card_last4: string;
  customer_id?: string;
  risk_score: number;
  is_anomaly: boolean;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface EnrichedTransactionEvent extends RawScoredEvent {
  decision: DecisionAction;
  reasons: string[];
  processed_at: string;
  processing_time_ms: number;
}

export interface SystemMetrics {
  totalProcessed: number;
  totalApproved: number;
  totalReviewed: number;
  totalBlocked: number;
  totalBlockedAmount: number;
  fraudRatePercentage: number;
}