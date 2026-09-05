import React, { useState } from 'react';
import { History, ArrowRight, ShieldCheck, X, Zap, Clock, Info } from 'lucide-react';
import { Decision } from '../types';
import { formatINR, formatPct } from '../utils/formatters';

interface DecisionHistoryPageProps {
  decisions: Decision[];
}

export const DecisionHistoryPage: React.FC<DecisionHistoryPageProps> = ({ decisions }) => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'MARKET_SHOCK':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'OPTIMIZATION':
      case 'REBALANCE':
        return 'bg-indigo-950 text-indigo-400 border-indigo-800';
      case 'RISK_BREACH':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      default:
        return 'bg-obsidian-850 text-slate-400 border-obsidian-750';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Institutional Decision Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all autonomous risk interventions, optimization triggers, market shocks, and rebalances.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-obsidian-950 px-3 py-1.5 rounded-lg border border-obsidian-800">
          Total Recorded: <strong className="text-slate-200">{decisions.length}</strong>
        </span>
      </div>

      {/* Decisions Timeline Table */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-obsidian-800 text-slate-400 text-left">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Event Type</th>
                <th className="pb-3 font-semibold">Trigger Condition</th>
                <th className="pb-3 font-semibold">Action Executed</th>
                <th className="pb-3 font-semibold">Reasoning</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              {decisions.map((dec) => (
                <tr
                  key={dec.id}
                  onClick={() => setSelectedDecision(dec)}
                  className="hover:bg-obsidian-850/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3 text-slate-400 whitespace-nowrap">
                    {new Date(dec.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadge(dec.event_type)}`}>
                      {dec.event_type}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {dec.trigger}
                  </td>
                  <td className="py-3 text-slate-300 max-w-[220px] truncate">{dec.action}</td>
                  <td className="py-3 text-slate-400 max-w-[240px] truncate font-sans">{dec.reason}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {dec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {decisions.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p>No decision records in database.</p>
          </div>
        )}
      </div>

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-obsidian-900 border border-obsidian-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-obsidian-800 pb-3">
              <div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getEventBadge(selectedDecision.event_type)}`}>
                  {selectedDecision.event_type}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{selectedDecision.trigger}</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Recorded: {new Date(selectedDecision.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedDecision(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Action Executed</span>
                <p className="text-slate-200 font-mono">{selectedDecision.action}</p>
              </div>

              <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Institutional Rationale</span>
                <p className="text-slate-300 font-sans leading-relaxed">{selectedDecision.reason}</p>
              </div>

              {/* Before vs After Telemetry Comparison */}
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
                <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Metrics Before</span>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    {Object.entries(selectedDecision.before_metrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <strong className="text-slate-200">
                          {typeof v === 'number' && v > 1000 ? formatINR(v) : typeof v === 'number' && v <= 1 ? formatPct(v) : String(v)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded bg-obsidian-950 border border-obsidian-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Metrics After</span>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    {Object.entries(selectedDecision.after_metrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <strong className="text-slate-200">
                          {typeof v === 'number' && v > 1000 ? formatINR(v) : typeof v === 'number' && v <= 1 ? formatPct(v) : String(v)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDecision(null)}
                className="px-4 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-xs font-semibold text-slate-200"
              >
                Close Audit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
