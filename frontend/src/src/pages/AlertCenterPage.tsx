import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertOctagon, CheckCircle2, Filter, ShieldCheck } from 'lucide-react';
import { Alert } from '../types';
import { formatPct } from '../utils/formatters';

interface AlertCenterPageProps {
  alerts: Alert[];
  onResolveAlert: (alertId: number) => Promise<void>;
}

export const AlertCenterPage: React.FC<AlertCenterPageProps> = ({ alerts, onResolveAlert }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  const handleResolve = async (id: number) => {
    setResolvingId(id);
    try {
      await onResolveAlert(id);
    } catch (err) {
      console.error('Error resolving alert:', err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Institutional Risk Alert Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications of policy boundary breaches, concentration violations, and tail-risk warnings.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-obsidian-950 px-3 py-1.5 rounded-lg border border-obsidian-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-obsidian-950">Status: All</option>
              <option value="ACTIVE" className="bg-obsidian-950">Active Only</option>
              <option value="RESOLVED" className="bg-obsidian-950">Resolved Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-obsidian-950 px-3 py-1.5 rounded-lg border border-obsidian-800">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-obsidian-950">Severity: All</option>
              <option value="CRITICAL" className="bg-obsidian-950">Critical</option>
              <option value="WARNING" className="bg-obsidian-950">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isResolved = alert.status === 'RESOLVED';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                isResolved
                  ? 'bg-obsidian-900/50 border-obsidian-800/60 opacity-60'
                  : isCritical
                  ? 'bg-rose-950/20 border-rose-800/70 ring-1 ring-rose-600/30'
                  : 'bg-obsidian-900 border-amber-800/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isResolved
                        ? 'bg-slate-800 text-slate-400'
                        : isCritical
                        ? 'bg-rose-950 text-rose-400 border border-rose-700'
                        : 'bg-amber-950 text-amber-400 border border-amber-700'
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCritical ? (
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {alert.metric}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">{alert.message}</h3>

                    <div className="mt-2 flex items-center gap-4 text-xs font-mono text-slate-300">
                      <span>
                        Current Value: <strong className={isCritical ? 'text-rose-400' : 'text-amber-400'}>{formatPct(alert.current_value)}</strong>
                      </span>
                      <span>
                        Policy Limit: <strong className="text-slate-200">{formatPct(alert.threshold)}</strong>
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-300 bg-obsidian-950/70 p-2.5 rounded border border-obsidian-800 font-sans">
                      <strong className="text-indigo-400 font-mono text-[11px] block mb-0.5">Recommended Action:</strong>
                      {alert.recommendation}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                      isResolved
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950/60 text-rose-400 border-rose-800'
                    }`}
                  >
                    {alert.status}
                  </span>

                  {!isResolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="px-3 py-1.5 rounded bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 text-xs font-mono border border-obsidian-700 transition-colors"
                    >
                      {resolvingId === alert.id ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-12 rounded-xl bg-obsidian-900 border border-obsidian-800 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No Risk Alerts Matching Filter</h3>
            <p className="text-xs">All monitored assets are within configured institutional risk boundaries.</p>
          </div>
        )}
      </div>
    </div>
  );
};
