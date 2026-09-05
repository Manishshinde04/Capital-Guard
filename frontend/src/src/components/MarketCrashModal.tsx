import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, X, TrendingDown, Layers, HelpCircle } from 'lucide-react';
import { MarketShockResult } from '../types';
import { formatINR, formatPct, formatNum, getStatusBadge } from '../utils/formatters';

interface MarketCrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MarketShockResult | null;
  isLoading: boolean;
  onApplyRebalance: (allocations: Record<string, number>) => void;
  isApplyingRebalance: boolean;
}

export const MarketCrashModal: React.FC<MarketCrashModalProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
  onApplyRebalance,
  isApplyingRebalance
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const simulationSteps = [
    'Initializing systemic market shock simulation...',
    'Applying equity drawdown (-25.0%) and credit spread shock (-10.0%)...',
    'Recalculating mark-to-market valuations across all holdings...',
    'Computing updated Covariance Matrix and Value at Risk (VaR)...',
    'Evaluating institutional Risk Policy constraints...',
    'CRITICAL breach detected: Volatility & VaR thresholds exceeded!',
    'Triggering automated optimization for defensive capital allocation...',
    'Synthesizing 5-point explainability rationale...',
    'Recording audit trail entry in institutional Decision History...'
  ];

  useEffect(() => {
    if (isLoading) {
      setCurrentStepIndex(0);
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < simulationSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-obsidian-900 border border-obsidian-700 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-600/60 flex items-center justify-center text-rose-400 font-bold">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Systemic Market Crash Simulation
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-700 font-mono font-semibold">
                  SHOCK TRIGGERED
                </span>
              </h2>
              <p className="text-xs text-slate-400">Autonomous Stress Detection & Defensive Optimization Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Loading Animation Progress */}
          {isLoading && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin flex items-center justify-center mb-6">
                <AlertOctagon className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Simulating Systemic Market Crash...</h3>
              <p className="text-xs font-mono text-rose-400 mb-8 max-w-md h-6">
                {simulationSteps[currentStepIndex]}
              </p>

              {/* Progress Steps List */}
              <div className="w-full max-w-lg space-y-2 text-left text-xs font-mono">
                {simulationSteps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCur = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 p-2 rounded border transition-all ${
                        isCur
                          ? 'bg-rose-950/40 border-rose-700/60 text-rose-300 font-semibold'
                          : isDone
                          ? 'bg-obsidian-950/60 border-obsidian-800 text-slate-400'
                          : 'opacity-30 border-transparent text-slate-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCur ? (
                        <RefreshCw className="w-4 h-4 text-rose-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span className="truncate">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results View */}
          {!isLoading && result && (
            <>
              {/* Top Impact Banner */}
              <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-xs font-bold text-rose-400 tracking-wider uppercase font-mono">
                      MARKET SHOCK DETECTED
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Capital Loss: <span className="text-rose-400 font-mono">-{formatINR(result.capital_loss)}</span> ({result.percentage_loss.toFixed(2)}%)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Triggered by 25% Equity drawdown and 10% credit contraction. Portfolio entered <strong className="text-rose-400 font-mono">CRITICAL</strong> risk state.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded bg-obsidian-950 border border-rose-900/80 text-center font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">Risk State</span>
                    <span className="text-xs font-bold text-rose-400">CRITICAL</span>
                  </div>
                  <div className="px-3 py-2 rounded bg-obsidian-950 border border-obsidian-800 text-center font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">Decision Logged</span>
                    <span className="text-xs font-bold text-slate-200">#{result.decision_recorded_id}</span>
                  </div>
                </div>
              </div>

              {/* Before vs After Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Portfolio Capital</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-xs text-slate-400 line-through">{formatINR(result.before_metrics.total_capital)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-rose-400">{formatINR(result.after_metrics.total_capital)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Portfolio Risk (Vol)</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-xs text-slate-400">{formatPct(result.before_metrics.portfolio_risk)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-rose-400">{formatPct(result.after_metrics.portfolio_risk)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Value at Risk (95%)</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-xs text-slate-400">{formatPct(result.before_metrics.var_95)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-rose-400">{formatPct(result.after_metrics.var_95)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Liquidity Buffer</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-xs text-slate-400">{formatPct(result.before_metrics.liquidity_ratio)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-bold text-slate-200">{formatPct(result.after_metrics.liquidity_ratio)}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Rebalance Orders Table */}
              <div className="p-4 rounded-lg bg-obsidian-950 border border-obsidian-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Automated Defensive Rebalancing Orders
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Est. Friction Cost: <strong className="text-slate-200">{formatINR(result.recommended_rebalance.estimated_transaction_cost)}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-obsidian-800 text-slate-400 text-left">
                        <th className="pb-2 font-semibold">Asset</th>
                        <th className="pb-2 font-semibold">Current</th>
                        <th className="pb-2 font-semibold">Target</th>
                        <th className="pb-2 font-semibold">Allocation Δ</th>
                        <th className="pb-2 font-semibold text-right">Order Value</th>
                        <th className="pb-2 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian-850">
                      {result.recommended_rebalance.allocations.map((item) => (
                        <tr key={item.symbol} className="hover:bg-obsidian-900/50">
                          <td className="py-2.5 font-bold text-slate-200">
                            {item.symbol} <span className="text-[11px] text-slate-400 font-normal">({item.asset_class})</span>
                          </td>
                          <td className="py-2.5 text-slate-300">{formatPct(item.current_allocation)}</td>
                          <td className="py-2.5 text-slate-200 font-bold">{formatPct(item.recommended_allocation)}</td>
                          <td className="py-2.5">
                            <span className={item.allocation_change > 0 ? 'text-emerald-400 font-semibold' : item.allocation_change < 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                              {item.allocation_change > 0 ? `+${(item.allocation_change*100).toFixed(1)}%` : `${(item.allocation_change*100).toFixed(1)}%`}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-200">
                            {formatINR(Math.abs(item.trade_value))}
                          </td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.action === 'BUY'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : item.action === 'SELL'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {item.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5-Point Explainability Section */}
              <div className="p-4 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-3">
                <div className="flex items-center gap-2 border-b border-obsidian-800 pb-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Institutional Risk Explainability Rationale
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">1. What Happened?</span>
                    <p className="text-slate-300 leading-relaxed">{result.explanation.what_happened}</p>
                  </div>

                  <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">2. Which Limit Was Breached?</span>
                    <p className="text-slate-300 leading-relaxed">{result.explanation.which_limit_breached}</p>
                  </div>

                  <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">3. Why Does It Matter?</span>
                    <p className="text-slate-300 leading-relaxed">{result.explanation.why_it_matters}</p>
                  </div>

                  <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">4. What Should We Do?</span>
                    <p className="text-slate-300 leading-relaxed">{result.explanation.what_should_we_do}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-obsidian-900 border border-obsidian-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">5. Projected Post-Rebalance Outcome</span>
                  <p className="text-slate-300 leading-relaxed">{result.explanation.what_will_happen_afterward}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isLoading && result && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-800 bg-obsidian-950/80">
            <span className="text-xs text-slate-400 font-mono">
              Status: <strong className="text-rose-400 font-bold">UNRESOLVED CRITICAL STATE</strong>
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700 transition-colors"
              >
                Dismiss
              </button>

              <button
                onClick={() => {
                  const targetAllocations: Record<string, number> = {};
                  result.recommended_rebalance.allocations.forEach((a) => {
                    targetAllocations[a.symbol] = a.recommended_allocation;
                  });
                  onApplyRebalance(targetAllocations);
                }}
                disabled={isApplyingRebalance}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" />
                {isApplyingRebalance ? 'Applying Rebalance...' : 'Execute Recommended Defensive Rebalance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
