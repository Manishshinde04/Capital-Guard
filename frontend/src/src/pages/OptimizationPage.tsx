import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Play,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Portfolio, OptimizationResponse } from '../types';
import { RebalanceModal } from '../components/RebalanceModal';
import { formatINR, formatPct, formatNum } from '../utils/formatters';

interface OptimizationPageProps {
  portfolio: Portfolio | null;
  onRunOptimization: (params: any) => Promise<OptimizationResponse>;
  onApplyRebalance: (allocations: Record<string, number>, riskProfile?: string) => Promise<void>;
  isApplyingRebalance: boolean;
}

export const OptimizationPage: React.FC<OptimizationPageProps> = ({
  portfolio,
  onRunOptimization,
  onApplyRebalance,
  isApplyingRebalance
}) => {
  const [profile, setProfile] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');
  const [maxEquity, setMaxEquity] = useState<number>(0.35);
  const [minCash, setMinCash] = useState<number>(0.05);
  const [maxVolatility, setMaxVolatility] = useState<number>(0.15);
  const [maxConcentration, setMaxConcentration] = useState<number>(0.30);
  const [minLiquidity, setMinLiquidity] = useState<number>(0.25);
  const [txSensitivity, setTxSensitivity] = useState<number>(1.0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState<boolean>(false);

  const handleProfileSelect = (p: 'Conservative' | 'Balanced' | 'Aggressive') => {
    setProfile(p);
    if (p === 'Conservative') {
      setMaxEquity(0.22);
      setMinCash(0.10);
      setMaxVolatility(0.11);
      setMaxConcentration(0.25);
      setMinLiquidity(0.32);
      setTxSensitivity(1.5);
    } else if (p === 'Aggressive') {
      setMaxEquity(0.45);
      setMinCash(0.05);
      setMaxVolatility(0.18);
      setMaxConcentration(0.35);
      setMinLiquidity(0.18);
      setTxSensitivity(0.7);
    } else {
      setMaxEquity(0.32);
      setMinCash(0.08);
      setMaxVolatility(0.145);
      setMaxConcentration(0.30);
      setMinLiquidity(0.25);
      setTxSensitivity(1.0);
    }
  };

  const handleRunOptimization = async () => {
    setIsLoading(true);
    try {
      const res = await onRunOptimization({
        risk_profile: profile,
        max_equity: maxEquity,
        min_cash: minCash,
        max_volatility: maxVolatility,
        max_concentration: maxConcentration,
        min_liquidity: minLiquidity,
        transaction_cost_sensitivity: txSensitivity
      });
      setOptimizationResult(res);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRebalance = async () => {
    if (!optimizationResult) return;
    const targetMap: Record<string, number> = {};
    optimizationResult.allocations.forEach((a) => {
      targetMap[a.symbol] = a.recommended_allocation;
    });
    try {
      await onApplyRebalance(targetMap, profile);
      setIsRebalanceModalOpen(false);
    } catch (err) {
      console.error('Rebalance application error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            Constrained Portfolio Optimization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Find the most efficient capital allocation under your institutional risk limits, liquidity floors, and transaction friction.
          </p>
        </div>
      </div>

      {/* Profile Selection & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Profiles & Controls */}
        <div className="lg:col-span-1 p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              1. Institutional Risk Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Conservative', 'Balanced', 'Aggressive'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handleProfileSelect(p)}
                  className={`py-3 px-2 rounded-lg border text-center transition-all ${
                    profile === p
                      ? 'bg-indigo-600/20 border-indigo-500/80 text-indigo-300 font-bold shadow-md shadow-indigo-600/20'
                      : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:border-obsidian-700'
                  }`}
                >
                  <span className="text-xs block">{p.toUpperCase()}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {p === 'Conservative' ? 'Defensive' : p === 'Aggressive' ? 'Growth' : 'Optimal'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Configurable Sliders */}
          <div className="space-y-4 pt-4 border-t border-obsidian-800 text-xs">
            <label className="font-bold text-slate-300 uppercase tracking-wider block">
              2. Quantitative Constraints
            </label>

            {/* Max Equity */}
            <div>
              <div className="flex justify-between text-slate-300 font-mono mb-1">
                <span>Maximum Equity:</span>
                <strong className="text-indigo-400">{formatPct(maxEquity, 0)}</strong>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.55"
                step="0.01"
                value={maxEquity}
                onChange={(e) => setMaxEquity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-obsidian-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Max Volatility */}
            <div>
              <div className="flex justify-between text-slate-300 font-mono mb-1">
                <span>Max Portfolio Volatility:</span>
                <strong className="text-rose-400">{formatPct(maxVolatility, 1)}</strong>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.22"
                step="0.005"
                value={maxVolatility}
                onChange={(e) => setMaxVolatility(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-obsidian-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Minimum Liquidity */}
            <div>
              <div className="flex justify-between text-slate-300 font-mono mb-1">
                <span>Minimum Liquidity Ratio:</span>
                <strong className="text-cyan-400">{formatPct(minLiquidity, 0)}</strong>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.45"
                step="0.01"
                value={minLiquidity}
                onChange={(e) => setMinLiquidity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-obsidian-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Max Concentration */}
            <div>
              <div className="flex justify-between text-slate-300 font-mono mb-1">
                <span>Max Single Asset Concentration:</span>
                <strong className="text-amber-400">{formatPct(maxConcentration, 0)}</strong>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.45"
                step="0.01"
                value={maxConcentration}
                onChange={(e) => setMaxConcentration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-obsidian-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Transaction Cost Sensitivity */}
            <div>
              <div className="flex justify-between text-slate-300 font-mono mb-1">
                <span>Turnover Friction Penalty:</span>
                <strong className="text-slate-200">{txSensitivity.toFixed(1)}x</strong>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={txSensitivity}
                onChange={(e) => setTxSensitivity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-obsidian-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunOptimization}
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] font-mono tracking-wider"
          >
            <Play className="w-4 h-4 fill-white" />
            {isLoading ? 'SOLVING SLSQP OPTIMIZER...' : 'RUN OPTIMIZATION'}
          </button>
        </div>

        {/* Right Columns: Results & Explanations */}
        <div className="lg:col-span-2 space-y-6">
          {!optimizationResult && (
            <div className="p-12 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <SlidersHorizontal className="w-10 h-10 text-indigo-400/60" />
              <h3 className="text-base font-bold text-slate-200">Optimization Engine Ready</h3>
              <p className="text-xs max-w-md">
                Select your risk profile and operational parameters, then click <strong className="text-indigo-400 font-mono">RUN OPTIMIZATION</strong> to solve for the mathematically optimal capital allocation.
              </p>
            </div>
          )}

          {optimizationResult && (
            <>
              {/* Before vs After Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-obsidian-900 border border-obsidian-800 font-mono">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Expected Return</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-400">{formatPct(optimizationResult.current_metrics.expected_return)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-slate-100">{formatPct(optimizationResult.recommended_metrics.expected_return)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-obsidian-900 border border-obsidian-800 font-mono">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Portfolio Volatility</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-rose-400">{formatPct(optimizationResult.current_metrics.portfolio_risk)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-emerald-400">{formatPct(optimizationResult.recommended_metrics.portfolio_risk)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-obsidian-900 border border-obsidian-800 font-mono">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Sharpe Ratio</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-400">{formatNum(optimizationResult.current_metrics.sharpe_ratio)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-indigo-400">{formatNum(optimizationResult.recommended_metrics.sharpe_ratio)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-obsidian-900 border border-obsidian-800 font-mono">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Est. Turnover Cost</span>
                  <div className="mt-1">
                    <span className="text-sm font-bold text-amber-400">{formatINR(optimizationResult.estimated_transaction_cost)}</span>
                  </div>
                </div>
              </div>

              {/* Allocation Delta Table */}
              <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Current vs Recommended Allocation
                  </h3>
                  <span className="text-xs font-mono text-emerald-400">Sum: 100.0%</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-obsidian-800 text-slate-400 text-left">
                        <th className="pb-2 font-semibold">Asset</th>
                        <th className="pb-2 font-semibold">Current</th>
                        <th className="pb-2 font-semibold">Target</th>
                        <th className="pb-2 font-semibold">Change Δ</th>
                        <th className="pb-2 font-semibold text-right">Order Amount</th>
                        <th className="pb-2 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian-850">
                      {optimizationResult.allocations.map((a) => (
                        <tr key={a.symbol} className="hover:bg-obsidian-850/50">
                          <td className="py-2.5 font-bold text-slate-200">
                            {a.symbol} <span className="text-[10px] text-slate-400 font-normal">({a.asset_class})</span>
                          </td>
                          <td className="py-2.5 text-slate-300">{formatPct(a.current_allocation)}</td>
                          <td className="py-2.5 text-slate-100 font-bold">{formatPct(a.recommended_allocation)}</td>
                          <td className="py-2.5">
                            <span className={a.allocation_change > 0 ? 'text-emerald-400 font-bold' : a.allocation_change < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {a.allocation_change > 0 ? `+${(a.allocation_change*100).toFixed(1)}%` : `${(a.allocation_change*100).toFixed(1)}%`}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-200">
                            {formatINR(Math.abs(a.trade_value))}
                          </td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                a.action === 'BUY'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : a.action === 'SELL'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {a.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Apply Rebalance CTA */}
                <div className="mt-4 pt-4 border-t border-obsidian-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Ready to execute simulated rebalance into the live fund state.
                  </span>
                  <button
                    onClick={() => setIsRebalanceModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>APPLY RECOMMENDED REBALANCE</span>
                  </button>
                </div>
              </div>

              {/* 5-Point Explainability Section: "WHY THIS ALLOCATION?" */}
              <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-3">
                <div className="flex items-center gap-2 border-b border-obsidian-800 pb-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    WHY THIS ALLOCATION? (Optimization Rationale)
                  </h3>
                </div>

                <p className="text-xs text-slate-300 italic">{optimizationResult.explanation.summary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">WHAT HAPPENED?</span>
                    <p className="text-slate-300 leading-relaxed">{optimizationResult.explanation.what_happened}</p>
                  </div>

                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">WHICH LIMIT WAS BREACHED / CONSTRAINED?</span>
                    <p className="text-slate-300 leading-relaxed">{optimizationResult.explanation.which_limit_breached}</p>
                  </div>

                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">WHY DOES IT MATTER?</span>
                    <p className="text-slate-300 leading-relaxed">{optimizationResult.explanation.why_it_matters}</p>
                  </div>

                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">WHAT SHOULD WE DO?</span>
                    <p className="text-slate-300 leading-relaxed">{optimizationResult.explanation.what_should_we_do}</p>
                  </div>
                </div>

                <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">WHAT WILL HAPPEN AFTERWARD?</span>
                  <p className="text-slate-300 leading-relaxed">{optimizationResult.explanation.what_will_happen_afterward}</p>
                </div>

                {/* Main Drivers */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="text-slate-400">Key Sensitivity Drivers:</span>
                  {optimizationResult.explanation.main_drivers.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded bg-obsidian-850 border border-obsidian-750 text-indigo-300">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {optimizationResult && (
        <RebalanceModal
          isOpen={isRebalanceModalOpen}
          onClose={() => setIsRebalanceModalOpen(false)}
          onConfirm={handleConfirmRebalance}
          isSubmitting={isApplyingRebalance}
          allocations={optimizationResult.allocations}
          txCost={optimizationResult.estimated_transaction_cost}
          currentMetrics={optimizationResult.current_metrics}
          recommendedMetrics={optimizationResult.recommended_metrics}
          riskProfile={profile}
        />
      )}
    </div>
  );
};
