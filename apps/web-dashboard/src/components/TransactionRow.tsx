import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Eye, CreditCard } from 'lucide-react';
import type { EnrichedTransactionEvent } from '../types';

interface TransactionRowProps {
  transaction: EnrichedTransactionEvent;
  onSelect: (tx: EnrichedTransactionEvent) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onSelect }) => {
  const isBlocked = transaction.decision === 'BLOCKED';
  const isReview = transaction.decision === 'MANUAL_REVIEW';

  const riskPercent = Math.round(transaction.risk_score * 100);

  return (
    <motion.tr
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(transaction)}
      className={`cursor-pointer border-b border-radar-border/60 transition-colors text-sm ${
        isBlocked
          ? 'bg-rose-950/20 hover:bg-rose-950/30'
          : isReview
          ? 'bg-amber-950/20 hover:bg-amber-950/30'
          : 'hover:bg-slate-900/50'
      }`}
    >
      {/* Decision Status Badge */}
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          {isBlocked ? (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Blocked</span>
            </span>
          ) : isReview ? (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Eye className="w-3.5 h-3.5" />
              <span>Review</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approved</span>
            </span>
          )}
        </div>
      </td>

      {/* Amount & Currency */}
      <td className="py-3 px-4 font-semibold text-white">
        ${transaction.amount.toFixed(2)}
      </td>

      {/* Risk Score Meter */}
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                riskPercent > 75
                  ? 'bg-rose-500'
                  : riskPercent > 45
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${riskPercent}%` }}
            />
          </div>
          <span
            className={`text-xs font-bold ${
              riskPercent > 75
                ? 'text-rose-400'
                : riskPercent > 45
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {riskPercent}%
          </span>
        </div>
      </td>

      {/* Card Info */}
      <td className="py-3 px-4 text-slate-400">
        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
          <span>•••• {transaction.card_last4}</span>
        </div>
      </td>

      {/* Transaction ID */}
      <td className="py-3 px-4 font-mono text-xs text-slate-400">
        {transaction.transaction_id}
      </td>

      {/* Timestamp */}
      <td className="py-3 px-4 text-xs text-slate-400">
        {new Date(transaction.timestamp).toLocaleTimeString()}
      </td>
    </motion.tr>
  );
};