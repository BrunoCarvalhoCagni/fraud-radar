import React, { useState } from 'react';
import { Play, Square, Gauge, Zap } from 'lucide-react';
import { apiService } from '../services/api';

export const SimulationControls: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [fraudOnly, setFraudOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleSimulation = async () => {
    setLoading(true);
    try {
      if (isRunning) {
        await apiService.stopSimulation();
        setIsRunning(false);
      } else {
        await apiService.startSimulation(speed, fraudOnly);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Failed to toggle simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-radar-card border border-radar-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleToggleSimulation}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${
            isRunning
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/25'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Halt Simulation</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Stream Kaggle Dataset</span>
            </>
          )}
        </button>

        <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Zap className={`w-3.5 h-3.5 ${isRunning ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-slate-300">
            {isRunning ? 'Replaying transactions via Kafka' : 'Replay idle'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-xs text-slate-300">
        {/* Speed Slider */}
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-slate-400" />
          <span>Interval: {speed}s</span>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.1"
            value={speed}
            disabled={isRunning}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Fraud Only Checkbox */}
        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={fraudOnly}
            disabled={isRunning}
            onChange={(e) => setFraudOnly(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 accent-indigo-500 cursor-pointer disabled:opacity-50"
          />
          <span className="text-slate-300">Stream Frauds Only</span>
        </label>
      </div>
    </div>
  );
};