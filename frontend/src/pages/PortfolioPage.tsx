import React, { useState } from 'react';
import { PieChart, Info, X, ShieldAlert, ArrowUpRight, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import { Portfolio, Holding } from '../types';
import { formatINR, formatPct, formatNum } from '../utils/formatters';

interface PortfolioPageProps {
  portfolio: Portfolio | null;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ portfolio }) => {
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  const holdings = portfolio?.holdings || [];
  const metrics = portfolio?.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-obsidian-900 border border-obsidian-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            Institutional Portfolio Holdings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time asset allocations, individual risk contributions, and concentration limits
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded bg-obsidian-950 border border-obsidian-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Portfolio Capital</span>
            <span className="text-sm font-bold text-slate-100">{formatINR(portfolio?.total_capital || 0)}</span>
          </div>
          <div className="px-3 py-2 rounded bg-obsidian-950 border border-obsidian-800">
            <span className="text-[10px] text-slate-400 block uppercase">Cash Reserves</span>
            <span className="text-sm font-bold text-emerald-400">{formatINR(portfolio?.cash_balance || 0)}</span>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            All Monitored Assets ({holdings.length})
          </h3>
          <span className="text-xs text-slate-400">Click any asset for risk drill-down</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-obsidian-800 text-slate-400 text-left">
                <th className="pb-3 font-semibold">Asset Class</th>
                <th className="pb-3 font-semibold">Allocation</th>
                <th className="pb-3 font-semibold">Current Value</th>
                <th className="pb-3 font-semibold">Units Held</th>
                <th className="pb-3 font-semibold">Unit Price</th>
                <th className="pb-3 font-semibold">Exp. Return</th>
                <th className="pb-3 font-semibold">Volatility</th>
                <th className="pb-3 font-semibold">Liquidity</th>
                <th className="pb-3 font-semibold">Policy Bounds</th>
                <th className="pb-3 font-semibold text-right">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              {holdings.map((h) => (
                <tr
                  key={h.symbol}
                  onClick={() => setSelectedHolding(h)}
                  className="hover:bg-obsidian-850/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5">
                    <div className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {h.symbol}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans truncate max-w-[170px]">
                      {h.name}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-sm font-bold text-slate-100">{formatPct(h.allocation)}</span>
                  </td>
                  <td className="py-3.5 text-slate-200 font-semibold">{formatINR(h.current_value)}</td>
                  <td className="py-3.5 text-slate-400">{h.quantity.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                  <td className="py-3.5 text-slate-300">₹{h.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="py-3.5 text-emerald-400 font-semibold">{formatPct(h.expected_return)}</td>
                  <td className="py-3.5 text-rose-400">{formatPct(h.volatility)}</td>
                  <td className="py-3.5 text-cyan-400">{formatPct(h.liquidity_score, 0)}</td>
                  <td className="py-3.5 text-slate-400 text-[11px]">
                    [{formatPct(h.minimum_allocation, 0)} – {formatPct(h.maximum_allocation, 0)}]
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : h.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal / Drawer */}
      {selectedHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-obsidian-900 border border-obsidian-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-obsidian-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                  {selectedHolding.asset_class}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{selectedHolding.name} ({selectedHolding.symbol})</h3>
              </div>
              <button
                onClick={() => setSelectedHolding(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                <span className="text-[10px] text-slate-400 block">Current Allocation</span>
                <span className="text-base font-bold text-slate-100">{formatPct(selectedHolding.allocation)}</span>
              </div>
              <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                <span className="text-[10px] text-slate-400 block">Policy Ceiling</span>
                <span className="text-base font-bold text-slate-200">{formatPct(selectedHolding.maximum_allocation)}</span>
              </div>
              <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                <span className="text-[10px] text-slate-400 block">Market Position Value</span>
                <span className="text-sm font-bold text-slate-100">{formatINR(selectedHolding.current_value)}</span>
              </div>
              <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                <span className="text-[10px] text-slate-400 block">Annualized Volatility</span>
                <span className="text-sm font-bold text-rose-400">{formatPct(selectedHolding.volatility)}</span>
              </div>
            </div>

            {/* Diagnostic Reason */}
            {selectedHolding.reason && (
              <div className="p-3.5 rounded bg-amber-950/30 border border-amber-800/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Concentration Policy Warning</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedHolding.reason}</p>
              </div>
            )}

            {!selectedHolding.reason && (
              <div className="p-3.5 rounded bg-emerald-950/30 border border-emerald-800/60 text-xs">
                <p className="text-emerald-300">
                  ✓ Holding complies with institutional risk limits and minimum liquidity allocations.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedHolding(null)}
                className="px-4 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-xs font-semibold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
