import React, { useState } from 'react';
import {
  Zap,
  Play,
  TrendingDown,
  ShieldCheck,
  Layers,
  ArrowRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Portfolio, StressTestResult } from '../types';
import { api } from '../services/api';
import { formatINR, formatPct, getStatusBadge } from '../utils/formatters';

interface StressTestingPageProps {
  portfolio: Portfolio | null;
  onApplyRebalance: (allocations: Record<string, number>) => Promise<void>;
  isApplyingRebalance: boolean;
}

const PREDEFINED_CARDS = [
  {
    name: 'Market Crash',
    tag: 'Severe Equity Crisis',
    desc: 'Equity -25%, Corp Bonds -10%, REIT -15%, Gold +8%, Gov Bonds +3%',
    color: 'from-rose-950/60 to-rose-900/30 border-rose-800/60',
    shocks: { EQUITY: -0.25, CBOND: -0.10, REIT: -0.15, GOLD: 0.08, GBOND: 0.03, CASH: 0.00 }
  },
  {
    name: 'Recession',
    tag: 'Economic Downturn',
    desc: 'Equity -18%, Corp Bonds -8%, REIT -12%, Gold +5%, Gov Bonds +4%',
    color: 'from-amber-950/50 to-amber-900/20 border-amber-800/50',
    shocks: { EQUITY: -0.18, CBOND: -0.08, REIT: -0.12, GOLD: 0.05, GBOND: 0.04, CASH: 0.00 }
  },
  {
    name: 'Interest Rate Shock',
    tag: '200 bps Central Bank Hike',
    desc: 'Gov Bonds -8%, Corp Bonds -12%, Equity -10%, REIT -6%, Gold +2%',
    color: 'from-indigo-950/50 to-indigo-900/20 border-indigo-800/50',
    shocks: { GBOND: -0.08, CBOND: -0.12, EQUITY: -0.10, REIT: -0.06, GOLD: 0.02, CASH: 0.00 }
  },
  {
    name: 'Inflation Shock',
    tag: 'Commodity Price Spike',
    desc: 'Equity -8%, Gov Bonds -10%, Gold +15%, REIT +5%',
    color: 'from-purple-950/50 to-purple-900/20 border-purple-800/50',
    shocks: { EQUITY: -0.08, GBOND: -0.10, CBOND: -0.09, GOLD: 0.15, REIT: 0.05, CASH: 0.00 }
  },
  {
    name: 'Liquidity Crisis',
    tag: 'Credit Freeze & Friction',
    desc: 'REIT -16%, Equity -14%, Corp Bonds -11%, Gold -3%',
    color: 'from-cyan-950/50 to-cyan-900/20 border-cyan-800/50',
    shocks: { EQUITY: -0.14, CBOND: -0.11, REIT: -0.16, GOLD: -0.03, GBOND: 0.01, CASH: 0.00 }
  }
];

export const StressTestingPage: React.FC<StressTestingPageProps> = ({
  portfolio,
  onApplyRebalance,
  isApplyingRebalance
}) => {
  const [activeScenario, setActiveScenario] = useState<string>('Market Crash');
  const [customShocks, setCustomShocks] = useState<Record<string, number>>({
    EQUITY: -0.20,
    GBOND: 0.02,
    CBOND: -0.08,
    GOLD: 0.06,
    REIT: -0.12,
    CASH: 0.00
  });

  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunPredefined = async (scenario: typeof PREDEFINED_CARDS[0]) => {
    setActiveScenario(scenario.name);
    setIsRunning(true);
    try {
      const res = await api.runStressTest(scenario.name, scenario.shocks);
      setStressResult(res);
    } catch (err) {
      console.error('Stress test error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustom = async () => {
    setActiveScenario('Custom Stress Test');
    setIsRunning(true);
    try {
      const res = await api.runStressTest('Custom Stress Test', customShocks);
      setStressResult(res);
    } catch (err) {
      console.error('Custom stress test error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Macroeconomic Stress Testing & Scenario Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate tail-risk asset shocks, examine portfolio capital degradation, and generate automated defensive responses.
          </p>
        </div>
      </div>

      {/* Predefined Scenarios Cards */}
      <div>
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
          1. Institutional Benchmark Scenarios
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PREDEFINED_CARDS.map((sc) => (
            <button
              key={sc.name}
              onClick={() => handleRunPredefined(sc)}
              className={`p-4 rounded-xl border text-left transition-all bg-gradient-to-b ${sc.color} ${
                activeScenario === sc.name
                  ? 'ring-1 ring-amber-400/50 border-amber-500 shadow-md'
                  : 'hover:border-obsidian-700'
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                {sc.tag}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">{sc.name}</h3>
              <p className="text-[11px] text-slate-400 mt-2 font-mono leading-tight">{sc.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario Builder & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Shock Sliders */}
        <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Custom Shock Builder
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Arbitrary Asset Multipliers</span>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            {Object.entries(customShocks).map(([sym, shock]) => (
              <div key={sym}>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{sym} Shock:</span>
                  <strong className={shock < 0 ? 'text-rose-400' : shock > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                    {shock > 0 ? `+${(shock*100).toFixed(1)}%` : `${(shock*100).toFixed(1)}%`}
                  </strong>
                </div>
                <input
                  type="range"
                  min="-0.40"
                  max="0.30"
                  step="0.01"
                  value={shock}
                  onChange={(e) =>
                    setCustomShocks({ ...customShocks, [sym]: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-obsidian-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleRunCustom}
            disabled={isRunning}
            className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 border border-amber-400 shadow-md shadow-amber-600/30 flex items-center justify-center gap-2 transition-all font-mono tracking-wider"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isRunning ? 'CALCULATING STRESS IMPACT...' : 'RUN CUSTOM STRESS TEST'}
          </button>
        </div>

        {/* Stress Results View */}
        <div className="lg:col-span-2 space-y-5">
          {!stressResult && (
            <div className="p-12 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <Zap className="w-10 h-10 text-amber-400/60" />
              <h3 className="text-base font-bold text-slate-200">Select a Scenario Above to Run Stress Test</h3>
              <p className="text-xs max-w-md">
                Click any benchmark scenario card (Market Crash, Recession, Rate Shock...) or build custom shocks to simulate mark-to-market degradation.
              </p>
            </div>
          )}

          {stressResult && (
            <>
              {/* Scenario Impact Banner */}
              <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-obsidian-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                      SCENARIO IMPACT REPORT
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-0.5">{stressResult.scenario_name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded bg-obsidian-950 border border-obsidian-800 text-center font-mono">
                      <span className="text-[10px] text-slate-400 block">STATUS DELTA</span>
                      <span className="text-xs font-bold text-rose-400">{stressResult.status_before} → {stressResult.status_after}</span>
                    </div>
                  </div>
                </div>

                {/* 4 Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Capital Degradation</span>
                    <span className="text-base font-bold text-rose-400 block mt-1">
                      -{formatINR(stressResult.capital_loss)}
                    </span>
                    <span className="text-[10px] text-slate-400">{stressResult.percentage_loss.toFixed(2)}% loss</span>
                  </div>

                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Portfolio Risk (Vol)</span>
                    <div className="flex items-center gap-1 mt-1 font-bold">
                      <span className="text-slate-400">{formatPct(stressResult.risk_before)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-rose-400">{formatPct(stressResult.risk_after)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Value at Risk (95%)</span>
                    <div className="flex items-center gap-1 mt-1 font-bold">
                      <span className="text-slate-400">{formatPct(stressResult.var_95_before)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-rose-400">{formatPct(stressResult.var_95_after)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Post-Shock Capital</span>
                    <span className="text-base font-bold text-slate-200 block mt-1">
                      {formatINR(stressResult.portfolio_value_after)}
                    </span>
                    <span className="text-[10px] text-slate-400">Mark-to-Market</span>
                  </div>
                </div>

                {/* Most Affected Assets */}
                <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Most Vulnerable Positions:</span>
                  <div className="flex flex-wrap gap-2">
                    {stressResult.most_affected_assets.map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Response */}
                <div className="p-4 rounded bg-indigo-950/30 border border-indigo-800/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Automated Defensive Response Recommendation
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{stressResult.recommended_response}</p>

                  {stressResult.recommended_allocations && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => onApplyRebalance(stressResult.recommended_allocations!)}
                        disabled={isApplyingRebalance}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 shadow-md shadow-indigo-600/30 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {isApplyingRebalance ? 'Applying...' : 'Apply Defensive Allocation'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scenario Comparison Matrix */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Cross-Scenario Resilience Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-obsidian-800 text-slate-400 text-left">
                <th className="pb-2.5 font-semibold">Macroeconomic Scenario</th>
                <th className="pb-2.5 font-semibold">Portfolio Impact</th>
                <th className="pb-2.5 font-semibold">Capital Loss</th>
                <th className="pb-2.5 font-semibold">Post-Shock Volatility</th>
                <th className="pb-2.5 font-semibold">VaR (95%)</th>
                <th className="pb-2.5 font-semibold text-right">Resulting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              <tr className="hover:bg-obsidian-850/50">
                <td className="py-2.5 font-bold text-slate-200">Market Crash</td>
                <td className="py-2.5 text-rose-400 font-bold">-11.40%</td>
                <td className="py-2.5 text-slate-300">₹1.14 Cr</td>
                <td className="py-2.5 text-rose-400 font-bold">19.80%</td>
                <td className="py-2.5 text-rose-400">9.10%</td>
                <td className="py-2.5 text-right">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold text-[10px]">
                    CRITICAL
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-obsidian-850/50">
                <td className="py-2.5 font-bold text-slate-200">Recession</td>
                <td className="py-2.5 text-rose-400">-8.20%</td>
                <td className="py-2.5 text-slate-300">₹82.0 Lakh</td>
                <td className="py-2.5 text-amber-400">17.10%</td>
                <td className="py-2.5 text-amber-400">7.20%</td>
                <td className="py-2.5 text-right">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px]">
                    WARNING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-obsidian-850/50">
                <td className="py-2.5 font-bold text-slate-200">Interest Rate Shock</td>
                <td className="py-2.5 text-rose-400">-6.70%</td>
                <td className="py-2.5 text-slate-300">₹67.0 Lakh</td>
                <td className="py-2.5 text-amber-400">16.50%</td>
                <td className="py-2.5 text-amber-400">6.80%</td>
                <td className="py-2.5 text-right">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px]">
                    WARNING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-obsidian-850/50">
                <td className="py-2.5 font-bold text-slate-200">Inflation Shock</td>
                <td className="py-2.5 text-rose-400">-3.40%</td>
                <td className="py-2.5 text-slate-300">₹34.0 Lakh</td>
                <td className="py-2.5 text-emerald-400">14.80%</td>
                <td className="py-2.5 text-emerald-400">5.40%</td>
                <td className="py-2.5 text-right">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px]">
                    WARNING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-obsidian-850/50">
                <td className="py-2.5 font-bold text-slate-200">Liquidity Crisis</td>
                <td className="py-2.5 text-rose-400">-7.80%</td>
                <td className="py-2.5 text-slate-300">₹78.0 Lakh</td>
                <td className="py-2.5 text-amber-400">16.90%</td>
                <td className="py-2.5 text-amber-400">7.50%</td>
                <td className="py-2.5 text-right">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold text-[10px]">
                    CRITICAL
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
