import React from 'react';
import { X, ShieldAlert, ShieldCheck, Eye, Cpu, Clock, DollarSign, CreditCard } from 'lucide-react';
import type { EnrichedTransactionEvent } from '../types';

interface TransactionDrawerProps {
  transaction: EnrichedTransactionEvent | null;
  onClose: () => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isBlocked = transaction.decision === 'BLOCKED';
  const isReview = transaction.decision === 'MANUAL_REVIEW';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-radar-dark border-l border-radar-border h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-radar-border pb-4">
          <div className="flex items-center space-x-2">
            {isBlocked ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : isReview ? (
              <Eye className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h2 className="text-lg font-bold text-white">Transaction Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6 flex-1">
          {/* Risk Score Card */}
          <div className="bg-radar-card border border-radar-border p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                ML Anomaly Risk
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {transaction.processing_time_ms}ms latency
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span
                className={`text-3xl font-extrabold ${
                  isBlocked
                    ? 'text-rose-400'
                    : isReview
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {Math.round(transaction.risk_score * 100)}%
              </span>
              <span className="text-xs text-slate-400">calculated by Isolation Forest</span>
            </div>
          </div>

          {/* Decision Rationale */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Decision Rationale & Rules Triggered
            </h3>
            <div className="space-y-1.5">
              {transaction.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300"
                >
                  ⚡ {reason}
                </div>
              ))}
            </div>
          </div>

          {/* Key Attributes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Transaction Metadata
            </h3>
            <div className="bg-radar-card border border-radar-border rounded-xl divide-y divide-radar-border text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Amount</span>
                <span className="text-white font-bold">${transaction.amount.toFixed(2)}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Card</span>
                <span className="font-mono text-slate-200">•••• •••• •••• {transaction.card_last4}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Transaction ID</span>
                <span className="font-mono text-slate-300">{transaction.transaction_id}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Emitted At</span>
                <span className="text-slate-300">{new Date(transaction.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 border-t border-radar-border pt-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};