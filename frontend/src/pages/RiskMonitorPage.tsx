import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Activity,
  Droplets,
  Layers,
  CheckCircle2,
  TrendingDown,
  Info
} from 'lucide-react';
import { Portfolio, RiskScoreBreakdown, RiskHeatmapRow, RiskPolicy } from '../types';
import { api } from '../services/api';
import { formatPct, formatNum, getStatusBadge } from '../utils/formatters';

interface RiskMonitorPageProps {
  portfolio: Portfolio | null;
}

export const RiskMonitorPage: React.FC<RiskMonitorPageProps> = ({ portfolio }) => {
  const [scoreBreakdown, setScoreBreakdown] = useState<RiskScoreBreakdown | null>(null);
  const [heatmap, setHeatmap] = useState<RiskHeatmapRow[]>([]);
  const [policy, setPolicy] = useState<Partial<RiskPolicy>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const metrics = portfolio?.metrics;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [riskRes, heatRes] = await Promise.all([
          api.getRiskAnalysis(),
          api.getRiskHeatmap()
        ]);
        setScoreBreakdown(riskRes.score_breakdown);
        setPolicy(riskRes.policy);
        setHeatmap(heatRes);
      } catch (err) {
        console.error('Error fetching risk analysis:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [portfolio]);

  const badge = getStatusBadge(metrics?.risk_status || 'NORMAL');

  // Correlation Matrix across 6 assets
  const CORR_MATRIX = [
    { name: 'EQUITY', values: [1.00, -0.15, 0.25, -0.05, 0.55, 0.00] },
    { name: 'GBOND', values: [-0.15, 1.00, 0.60, 0.20, 0.10, 0.05] },
    { name: 'CBOND', values: [0.25, 0.60, 1.00, 0.10, 0.35, 0.05] },
    { name: 'GOLD', values: [-0.05, 0.20, 0.10, 1.00, 0.05, 0.00] },
    { name: 'REIT', values: [0.55, 0.10, 0.35, 0.05, 1.00, 0.00] },
    { name: 'CASH', values: [0.00, 0.05, 0.05, 0.00, 0.00, 1.00] }
  ];

  const getCorrColor = (val: number) => {
    if (val === 1.0) return 'bg-indigo-600/40 text-indigo-200 font-bold';
    if (val > 0.4) return 'bg-rose-950/60 text-rose-300 font-semibold';
    if (val > 0.1) return 'bg-amber-950/40 text-amber-300';
    if (val < -0.1) return 'bg-emerald-950/60 text-emerald-300 font-semibold';
    return 'bg-obsidian-950 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Institutional Risk Monitor & Sentinel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of portfolio volatility, Value at Risk, concentration indices, and asset risk matrices.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-mono ${badge.bg} ${badge.border}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`}></span>
          <span className={`text-xs font-bold ${badge.text}`}>STATUS: {metrics?.risk_status || 'NORMAL'}</span>
        </div>
      </div>

      {/* Overall Risk Score Card & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Dial / Bar Card */}
        <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Aggregate Risk Score
              </span>
              <span className="text-xs font-mono text-slate-400">Model: Parametric 4-Factor</span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold font-mono text-slate-100 tabular-nums">
                {scoreBreakdown?.total_score || metrics?.risk_score || 72}
              </span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
              <span
                className={`ml-auto text-xs font-mono font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
              >
                {metrics?.risk_status || 'ELEVATED'}
              </span>
            </div>

            <div className="w-full h-2.5 bg-obsidian-950 rounded-full mt-3 overflow-hidden border border-obsidian-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (scoreBreakdown?.total_score || 70) >= 80
                    ? 'bg-rose-500'
                    : (scoreBreakdown?.total_score || 70) >= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, scoreBreakdown?.total_score || 70)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed border-t border-obsidian-800 pt-3">
            {scoreBreakdown?.summary || 'Transparent 0-100 score synthesized from volatility, VaR, concentration, and liquidity deficit.'}
          </p>
        </div>

        {/* Transparent Score Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Transparent Risk Factor Attribution
            </h3>
            <span className="text-[11px] font-mono text-indigo-400">Zero Black-Box Scoring</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {/* Volatility Component */}
            <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
              <span className="text-[10px] text-slate-400 block uppercase">1. Volatility</span>
              <span className="text-lg font-bold text-rose-400 block mt-1">
                {scoreBreakdown?.volatility_component || 22.5} <span className="text-xs text-slate-400 font-normal">/ 30</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">σp = {formatPct(metrics?.portfolio_risk || 0.14)}</span>
            </div>

            {/* VaR Component */}
            <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
              <span className="text-[10px] text-slate-400 block uppercase">2. Tail VaR</span>
              <span className="text-lg font-bold text-amber-400 block mt-1">
                {scoreBreakdown?.var_component || 18.2} <span className="text-xs text-slate-400 font-normal">/ 25</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">VaR95 = {formatPct(metrics?.var_95 || 0.058)}</span>
            </div>

            {/* Concentration Component */}
            <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
              <span className="text-[10px] text-slate-400 block uppercase">3. Concentration</span>
              <span className="text-lg font-bold text-rose-400 block mt-1">
                {scoreBreakdown?.concentration_component || 21.0} <span className="text-xs text-slate-400 font-normal">/ 25</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">HHI = {formatNum(metrics?.concentration_hhi || 0.26, 3)}</span>
            </div>

            {/* Liquidity Deficit Component */}
            <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
              <span className="text-[10px] text-slate-400 block uppercase">4. Liquidity Deficit</span>
              <span className="text-lg font-bold text-emerald-400 block mt-1">
                {scoreBreakdown?.liquidity_deficit_component || 4.2} <span className="text-xs text-slate-400 font-normal">/ 20</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Buffer = {formatPct(metrics?.liquidity_ratio || 0.27)}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-obsidian-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Critical Risk Policy Threshold: &ge; 80.0</span>
            <span>Warning Policy Threshold: &ge; 60.0</span>
          </div>
        </div>
      </div>

      {/* Centralized Policy Thresholds Comparison Grid */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Centralized Risk Policy Compliance Check
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
            <span className="text-[10px] text-slate-400 block">PORTFOLIO VOLATILITY</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-bold text-slate-100">{formatPct(metrics?.portfolio_risk || 0)}</span>
              <span className="text-[10px] text-slate-400">Limit: {formatPct(policy.max_volatility || 0.18)}</span>
            </div>
            <span className={`text-[10px] font-bold block mt-1 ${metrics?.portfolio_risk && metrics.portfolio_risk > (policy.max_volatility || 0.18) ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics?.portfolio_risk && metrics.portfolio_risk > (policy.max_volatility || 0.18) ? '● BREACH' : '✓ OK'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
            <span className="text-[10px] text-slate-400 block">VALUE AT RISK (95%)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-bold text-slate-100">{formatPct(metrics?.var_95 || 0)}</span>
              <span className="text-[10px] text-slate-400">Limit: {formatPct(policy.critical_var || 0.08)}</span>
            </div>
            <span className={`text-[10px] font-bold block mt-1 ${metrics?.var_95 && metrics.var_95 > (policy.critical_var || 0.08) ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics?.var_95 && metrics.var_95 > (policy.critical_var || 0.08) ? '● BREACH' : '✓ OK'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
            <span className="text-[10px] text-slate-400 block">EXPECTED SHORTFALL (CVaR)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-bold text-slate-100">{formatPct(metrics?.expected_shortfall_95 || 0)}</span>
              <span className="text-[10px] text-slate-400">Tail ES</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Avg Tail Loss</span>
          </div>

          <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
            <span className="text-[10px] text-slate-400 block">LIQUIDITY BUFFER</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-bold text-slate-100">{formatPct(metrics?.liquidity_ratio || 0)}</span>
              <span className="text-[10px] text-slate-400">Min: {formatPct(policy.min_liquidity || 0.20)}</span>
            </div>
            <span className={`text-[10px] font-bold block mt-1 ${metrics?.liquidity_ratio && metrics.liquidity_ratio < (policy.min_liquidity || 0.20) ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics?.liquidity_ratio && metrics.liquidity_ratio < (policy.min_liquidity || 0.20) ? '● DEFICIT' : '✓ OK'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
            <span className="text-[10px] text-slate-400 block">CONCENTRATION (HHI)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-bold text-slate-100">{formatNum(metrics?.concentration_hhi || 0, 3)}</span>
              <span className="text-[10px] text-slate-400">Max: 0.300</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Div: Moderate</span>
          </div>
        </div>
      </div>

      {/* Asset Risk Heatmap */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Asset Risk Heatmap (Multi-Dimensional Risk Matrix)
            </h3>
            <p className="text-xs text-slate-400">Evaluates volatility, concentration, liquidity tier, and systematic market sensitivity</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-obsidian-800 text-slate-400 text-left">
                <th className="pb-2.5 font-semibold">Asset</th>
                <th className="pb-2.5 font-semibold">Alloc</th>
                <th className="pb-2.5 font-semibold">Volatility Level</th>
                <th className="pb-2.5 font-semibold">Concentration</th>
                <th className="pb-2.5 font-semibold">Liquidity Tier</th>
                <th className="pb-2.5 font-semibold">Sensitivity Profile</th>
                <th className="pb-2.5 font-semibold text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              {heatmap.map((row) => (
                <tr key={row.symbol} className="hover:bg-obsidian-850/50">
                  <td className="py-3 font-bold text-slate-200">
                    {row.symbol} <span className="text-[10px] text-slate-400 font-normal">({row.asset_class})</span>
                  </td>
                  <td className="py-3 text-slate-300 font-semibold">{formatPct(row.allocation)}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.volatility_level === 'Extreme' || row.volatility_level === 'High'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : row.volatility_level === 'Medium'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {row.volatility_level}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.concentration_level === 'Critical'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : row.concentration_level === 'High'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-obsidian-850 text-slate-300 border border-obsidian-750'
                      }`}
                    >
                      {row.concentration_level}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.liquidity_level === 'Very High' || row.liquidity_level === 'High'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {row.liquidity_level}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-sans text-[11px]">{row.market_sensitivity}</td>
                  <td className="py-3 text-right font-bold text-slate-200">{row.risk_score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Asset Correlation Matrix (Σij)
            </h3>
            <p className="text-xs text-slate-400">Pairwise correlation coefficients used by the Covariance Matrix in optimization</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-obsidian-800 text-slate-400">
                <th className="pb-2 text-left font-semibold">Asset</th>
                {CORR_MATRIX.map((r) => (
                  <th key={r.name} className="pb-2 text-center font-semibold">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              {CORR_MATRIX.map((row) => (
                <tr key={row.name}>
                  <td className="py-2.5 font-bold text-slate-200 text-left">{row.name}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="py-2.5 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-[11px] ${getCorrColor(val)}`}>
                        {val > 0 && val !== 1 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
