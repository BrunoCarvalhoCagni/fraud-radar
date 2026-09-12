import React from 'react';
import { ShieldCheck, ShieldX, Eye, AlertTriangle } from 'lucide-react';
import type { SystemMetrics } from '../types';

interface MetricCardsProps {
  metrics: SystemMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Processed */}
      <div className="bg-radar-card border border-radar-border p-5 rounded-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Analyzed Transactions</span>
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white tracking-tight">
            {metrics.totalProcessed.toLocaleString()}
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            {metrics.totalApproved} approved
          </span>
        </div>
      </div>

      {/* Blocked Fraud Amount */}
      <div className="bg-radar-card border border-radar-border p-5 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Blocked Volume</span>
          <ShieldX className="w-5 h-5 text-rose-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-rose-400 tracking-tight">
            ${metrics.totalBlockedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-rose-400/80 font-medium">
            {metrics.totalBlocked} attempts
          </span>
        </div>
      </div>

      {/* Manual Review */}
      <div className="bg-radar-card border border-radar-border p-5 rounded-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Manual Review</span>
          <Eye className="w-5 h-5 text-amber-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-400 tracking-tight">
            {metrics.totalReviewed.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">Flagged for inspection</span>
        </div>
      </div>

      {/* Fraud Rate */}
      <div className="bg-radar-card border border-radar-border p-5 rounded-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Estimated Fraud Rate</span>
          <AlertTriangle className="w-5 h-5 text-purple-400" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white tracking-tight">
            {metrics.fraudRatePercentage}%
          </span>
          <span className="text-xs text-slate-400">Isolation Forest Score</span>
        </div>
      </div>
    </div>
  );
};