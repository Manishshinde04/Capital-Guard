import React, { useState } from 'react';
import { Activity, Play, Pause, FastForward, RotateCcw, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { Portfolio } from '../types';
import { api } from '../services/api';
import { formatINR, formatPct } from '../utils/formatters';

interface MarketSimulationPageProps {
  portfolio: Portfolio | null;
  isSimulating: boolean;
  onToggleSim: (running: boolean) => void;
  onRefreshPortfolio: () => void;
}

export const MarketSimulationPage: React.FC<MarketSimulationPageProps> = ({
  portfolio,
  isSimulating,
  onToggleSim,
  onRefreshPortfolio
}) => {
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const [lastTickData, setLastTickData] = useState<any>(null);

  const handleStepTick = async () => {
    setIsStepping(true);
    try {
      const res = await api.stepSimulation();
      setLastTickData(res);
      onRefreshPortfolio();
    } catch (err) {
      console.error('Simulation step error:', err);
    } finally {
      setIsStepping(false);
    }
  };

  const holdings = portfolio?.holdings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              {isSimulating ? '● LIVE MARKET SIMULATION RUNNING' : '❚❚ SIMULATION PAUSED'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Stochastic Market Price Simulation</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuously tests the closed-loop sentinel against live volatility, price drift, and tail breaches.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSim(!isSimulating)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${
              isSimulating
                ? 'bg-amber-950/60 text-amber-300 border border-amber-700/80 hover:bg-amber-950'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-950'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isSimulating ? 'PAUSE SIMULATION' : 'RESUME SIMULATION'}</span>
          </button>

          <button
            onClick={handleStepTick}
            disabled={isStepping}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold font-mono bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 shadow-sm transition-all"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isStepping ? 'DRIFTING...' : 'STEP 1 TICK'}</span>
          </button>
        </div>
      </div>

      {/* Live Assets Ticker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {holdings.map((h) => (
          <div key={h.symbol} className="p-3.5 rounded-lg bg-obsidian-900 border border-obsidian-800 font-mono">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-slate-200">{h.symbol}</span>
              <span className="text-[10px] text-slate-400">{h.asset_class}</span>
            </div>
            <div className="text-sm font-bold text-slate-100">
              ₹{h.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 pt-2 border-t border-obsidian-850">
              <span>Alloc: {formatPct(h.allocation, 1)}</span>
              <span className={h.status === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'}>
                {h.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulation Feedback Card */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Simulation Telemetry & Closed-Loop Response Protocol
        </h3>

        <div className="p-4 rounded-lg bg-obsidian-950 border border-obsidian-800 text-xs font-mono space-y-2 text-slate-300">
          <p className="text-indigo-300 font-bold">After every simulated market tick:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Update spot asset prices using correlated Gaussian drift</li>
            <li>Recalculate total mark-to-market portfolio valuation and cash reserves</li>
            <li>Recompute portfolio variance σp², annualized volatility, and 95% Parametric VaR</li>
            <li>Evaluate institutional Risk Policy thresholds (Volatility ceiling, concentration limits)</li>
            <li>Generate ACTIVE threshold breach alerts if policy boundaries are violated</li>
            <li>Signal the optimization engine when defensive rebalancing is warranted</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
