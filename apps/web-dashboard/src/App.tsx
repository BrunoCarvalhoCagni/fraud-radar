import React, { useState } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { SimulationControls } from './components/SimulationControls';
import { LiveFeed } from './components/LiveFeed';
import { TransactionDrawer } from './components/TransactionDrawer';
import { useSocket } from './hooks/useSocket';
import type { EnrichedTransactionEvent } from './types';

export const App: React.FC = () => {
  const { isConnected, transactions, metrics } = useSocket();
  const [selectedTx, setSelectedTx] = useState<EnrichedTransactionEvent | null>(null);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col font-sans">
      <Header isConnected={isConnected} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* KPI Metrics */}
        <MetricCards metrics={metrics} />

        {/* Simulator Control Bar */}
        <SimulationControls />

        {/* Live Stream Table */}
        <LiveFeed
          transactions={transactions}
          onSelectTransaction={(tx) => setSelectedTx(tx)}
        />
      </main>

      {/* Transaction Details Inspector Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};

export default App;