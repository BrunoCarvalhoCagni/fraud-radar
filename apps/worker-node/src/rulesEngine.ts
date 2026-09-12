import { RawScoredEvent, EnrichedTransactionEvent, DecisionAction } from './types.js';

export class RulesEngine {
  /**
   * Applies business rules to scored transaction and outputs final decision.
   */
  public evaluate(rawEvent: RawScoredEvent): EnrichedTransactionEvent {
    const startTime = Date.now();
    const reasons: string[] = [];
    let decision: DecisionAction = 'APPROVED';

    // Rule 1: High ML Anomaly / Risk Score Threshold
    if (rawEvent.risk_score >= 0.85) {
      decision = 'BLOCKED';
      reasons.push('CRITICAL_RISK_SCORE_THRESHOLD');
    } else if (rawEvent.is_anomaly && rawEvent.risk_score >= 0.70) {
      decision = 'BLOCKED';
      reasons.push('ISOLATION_FOREST_HIGH_ANOMALY_CONFIDENCE');
    }

    // Rule 2: Manual Review Thresholds (Medium Risk or High Volume Value)
    if (decision !== 'BLOCKED') {
      if (rawEvent.risk_score >= 0.50) {
        decision = 'MANUAL_REVIEW';
        reasons.push('ELEVATED_RISK_SUSPICION');
      }

      if (rawEvent.amount > 3000) {
        decision = 'MANUAL_REVIEW';
        reasons.push('HIGH_VALUE_TRANSACTION_AMOUNT');
      }
    }

    // Default Approved Reason
    if (reasons.length === 0) {
      reasons.push('WITHIN_NORMAL_BEHAVIORAL_PARAMETERS');
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      ...rawEvent,
      decision,
      reasons,
      processed_at: new Date().toISOString(),
      processing_time_ms: processingTimeMs,
    };
  }
}

export const rulesEngine = new RulesEngine();