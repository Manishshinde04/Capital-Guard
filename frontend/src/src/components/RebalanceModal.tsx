import React from 'react';
import { X, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { AssetAllocationDiff, BeforeAfterMetrics } from '../types';
import { formatINR, formatPct } from '../utils/formatters';

interface RebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  allocations: AssetAllocationDiff[];
  txCost: number;
  currentMetrics?: BeforeAfterMetrics;
  recommendedMetrics?: BeforeAfterMetrics;
  riskProfile: string;
}

export const RebalanceModal: React.FC<RebalanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  allocations,
  txCost,
  currentMetrics,
  recommendedMetrics,
  riskProfile
}) => {
  if (!isOpen) return null;

  const reductions = allocations.filter((a) => a.allocation_change < -0.005);
  const additions = allocations.filter((a) => a.allocation_change > 0.005);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-obsidian-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Confirm Portfolio Rebalance</h3>
              <p className="text-xs text-slate-400">Institutional Simulated Execution ({riskProfile} Profile)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-obsidian-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Risk Metric Progression */}
          {currentMetrics && recommendedMetrics && (
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Portfolio Risk</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-slate-400">{formatPct(currentMetrics.portfolio_risk)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-400 font-bold">{formatPct(recommendedMetrics.portfolio_risk)}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Expected Return</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-slate-400">{formatPct(currentMetrics.expected_return)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-200 font-bold">{formatPct(recommendedMetrics.expected_return)}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Sharpe Ratio</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-slate-400">{currentMetrics.sharpe_ratio.toFixed(2)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-indigo-400 font-bold">{recommendedMetrics.sharpe_ratio.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Capital Movements Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Reductions */}
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40">
              <span className="text-[10px] uppercase font-bold text-rose-400 block mb-2">
                Capital Reductions (Sell Orders)
              </span>
              <div className="space-y-1.5 font-mono">
                {reductions.map((r) => (
                  <div key={r.symbol} className="flex justify-between items-center text-slate-300">
                    <span>{r.symbol} ({formatPct(r.current_allocation)} → {formatPct(r.recommended_allocation)})</span>
                    <strong className="text-rose-400">-{formatINR(Math.abs(r.trade_value))}</strong>
                  </div>
                ))}
                {reductions.length === 0 && <span className="text-slate-400">No sell orders</span>}
              </div>
            </div>

            {/* Additions */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-2">
                Capital Additions (Buy Orders)
              </span>
              <div className="space-y-1.5 font-mono">
                {additions.map((a) => (
                  <div key={a.symbol} className="flex justify-between items-center text-slate-300">
                    <span>{a.symbol} ({formatPct(a.current_allocation)} → {formatPct(a.recommended_allocation)})</span>
                    <strong className="text-emerald-400">+{formatINR(Math.abs(a.trade_value))}</strong>
                  </div>
                ))}
                {additions.length === 0 && <span className="text-slate-400">No buy orders</span>}
              </div>
            </div>
          </div>

          {/* Transaction Cost Note */}
          <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 flex items-center justify-between font-mono">
            <span className="text-slate-400">Estimated Turnover Friction Cost:</span>
            <span className="text-sm font-bold text-amber-400">{formatINR(txCost)}</span>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded bg-indigo-950/30 border border-indigo-900/50 text-[11px] text-indigo-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <span>
              This execution simulates realistic market orders, recalculating asset quantities and updating active portfolio risk metrics within the platform.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-obsidian-800 bg-obsidian-950/80">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 shadow-md shadow-indigo-600/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? 'Executing Rebalance...' : 'Confirm & Apply Rebalance'}
          </button>
        </div>
      </div>
    </div>
  );
};
