import React from 'react';
import { ShieldAlert, Activity, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  return (
    <header className="border-b border-radar-border bg-radar-card/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 p-2.5 rounded-xl border border-indigo-500/30">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Stripe Radar Clone</h1>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">
                Real-Time ML
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Event-driven Fraud Detection Engine & Decision Stream
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Gateway Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};