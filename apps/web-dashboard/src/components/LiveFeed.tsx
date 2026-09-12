import React from 'react';
import { Radio } from 'lucide-react';
import type { EnrichedTransactionEvent } from '../types';
import { TransactionRow } from './TransactionRow';

interface LiveFeedProps {
  transactions: EnrichedTransactionEvent[];
  onSelectTransaction: (tx: EnrichedTransactionEvent) => void;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ transactions, onSelectTransaction }) => {
  return (
    <div className="bg-radar-card border border-radar-border rounded-xl overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-radar-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
          <h2 className="text-sm font-bold text-white tracking-wide">Live Transaction Stream</h2>
        </div>
        <span className="text-xs text-slate-400">
          Showing last {transactions.length} events
        </span>
      </div>

      <div className="overflow-x-auto max-h-[520px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-radar-border bg-slate-900/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Risk Assessment</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4">Tx ID</th>
              <th className="py-3 px-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                  Waiting for transaction stream... Start the simulator above to begin.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <TransactionRow
                  key={tx.event_id || tx.transaction_id}
                  transaction={tx}
                  onSelect={onSelectTransaction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};