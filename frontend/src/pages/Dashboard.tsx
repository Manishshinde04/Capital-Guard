import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Award,
  Droplets,
  ShieldAlert,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Portfolio, MarketShockResult, Alert, Decision } from '../types';
import { KPICard } from '../components/KPICard';
import { ControlLoopRibbon } from '../components/ControlLoopRibbon';
import { AllocationDonut } from '../components/AllocationDonut';
import { MarketCrashModal } from '../components/MarketCrashModal';
import { formatINR, formatPct, formatNum, getStatusBadge } from '../utils/formatters';

interface DashboardProps {
  portfolio: Portfolio | null;
  alerts: Alert[];
  decisions: Decision[];
  onTriggerMarketCrash: () => Promise<MarketShockResult>;
  onApplyRebalance: (allocations: Record<string, number>) => Promise<void>;
  onNavigate: (tab: string) => void;
  isLoadingPortfolio: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  portfolio,
  alerts,
  decisions,
  onTriggerMarketCrash,
  onApplyRebalance,
  onNavigate,
  isLoadingPortfolio
}) => {
  const [isCrashModalOpen, setIsCrashModalOpen] = useState(false);
  const [crashResult, setCrashResult] = useState<MarketShockResult | null>(null);
  const [isCrashing, setIsCrashing] = useState(false);
  const [isApplyingRebalance, setIsApplyingRebalance] = useState(false);

  const metrics = portfolio?.metrics;
  const holdings = portfolio?.holdings || [];
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  const handleSimulateCrash = async () => {
    setIsCrashModalOpen(true);
    setIsCrashing(true);
    try {
      const res = await onTriggerMarketCrash();
      setCrashResult(res);
    } catch (err) {
      console.error('Market crash simulation error:', err);
    } finally {
      setIsCrashing(false);
    }
  };

  const handleApplyRebalanceFromCrash = async (allocations: Record<string, number>) => {
    setIsApplyingRebalance(true);
    try {
      await onApplyRebalance(allocations);
      setIsCrashModalOpen(false);
    } catch (err) {
      console.error('Rebalance error:', err);
    } finally {
      setIsApplyingRebalance(false);
    }
  };

  if (!portfolio && isLoadingPortfolio) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Loading CapitalGuard portfolio baseline...</p>
      </div>
    );
  }

  const riskBadge = getStatusBadge(metrics?.risk_status || 'NORMAL');

  return (
    <div className="space-y-6">
      {/* Top Banner with One-Click Hackathon Demo Action */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border border-obsidian-750 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-700/60 uppercase font-mono">
              Autonomous Risk Sentinel
            </span>
            <span className="text-xs text-slate-400">Portfolio Status:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${riskBadge.bg} ${riskBadge.text} ${riskBadge.border}`}>
              {metrics?.risk_status || 'NORMAL'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Institutional Capital Allocation & Risk Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time portfolio optimization, tail-risk monitoring, and automated stress intervention.
          </p>
        </div>

        {/* ⚡ SIMULATE MARKET CRASH Primary Hackathon Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateCrash}
            className="flex items-center gap-2.5 px-5 py-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-500 border border-rose-400 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] font-mono tracking-wide"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
            <span>⚡ SIMULATE MARKET CRASH</span>
          </button>
        </div>
      </div>

      {/* Six KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KPICard
          title="Total Capital"
          value={formatINR(metrics?.total_capital || 100000000)}
          subtitle="Total managed capital"
          icon={Wallet}
          trend={metrics?.risk_status === 'CRITICAL' ? '-11.4%' : 'Baseline'}
          trendType={metrics?.risk_status === 'CRITICAL' ? 'negative' : 'neutral'}
        />
        <KPICard
          title="Expected Return"
          value={formatPct(metrics?.expected_return || 0.124)}
          subtitle="Annualized expected return"
          icon={TrendingUp}
          trend="Rp = Σ wiRi"
          trendType="neutral"
        />
        <KPICard
          title="Portfolio Risk"
          value={formatPct(metrics?.portfolio_risk || 0.142)}
          subtitle="Annualized volatility σp"
          icon={AlertTriangle}
          trend={metrics?.portfolio_risk && metrics.portfolio_risk > 0.18 ? 'CRITICAL' : 'Within Limit'}
          trendType={metrics?.portfolio_risk && metrics.portfolio_risk > 0.18 ? 'critical' : 'positive'}
          highlight={metrics?.portfolio_risk ? metrics.portfolio_risk > 0.18 : false}
        />
        <KPICard
          title="Sharpe Ratio"
          value={formatNum(metrics?.sharpe_ratio || 1.31)}
          subtitle="Risk-adjusted return (Rf=6.5%)"
          icon={Award}
          trend={(metrics?.sharpe_ratio || 0) > 1.0 ? 'Optimal' : 'Sub-optimal'}
          trendType={(metrics?.sharpe_ratio || 0) > 1.0 ? 'positive' : 'warning'}
        />
        <KPICard
          title="Liquidity Ratio"
          value={formatPct(metrics?.liquidity_ratio || 0.27)}
          subtitle="Liquid asset buffer"
          icon={Droplets}
          trend="Min 20%"
          trendType={(metrics?.liquidity_ratio || 0) >= 0.20 ? 'positive' : 'warning'}
        />
        <KPICard
          title="Value at Risk (95%)"
          value={formatPct(metrics?.var_95 || 0.058)}
          subtitle="1-Year Parametric VaR"
          icon={ShieldAlert}
          trend={(metrics?.var_95 || 0) > 0.08 ? 'CRITICAL' : 'Monitored'}
          trendType={(metrics?.var_95 || 0) > 0.08 ? 'critical' : 'neutral'}
          highlight={(metrics?.var_95 || 0) > 0.08}
        />
      </div>

      {/* Closed-Loop Control Ribbon */}
      <ControlLoopRibbon
        activeStep={
          metrics?.risk_status === 'CRITICAL' || metrics?.risk_status === 'EMERGENCY RISK MODE'
            ? 3
            : 1
        }
      />

      {/* Main Grid: Portfolio Allocation Donut + Holdings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Donut Chart */}
        <div className="p-5 rounded-lg bg-obsidian-900 border border-obsidian-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Asset Allocation
            </h3>
            <span className="text-xs font-mono text-slate-400">6 Core Classes</span>
          </div>

          <AllocationDonut holdings={holdings} totalValue={metrics?.total_capital || 100000000} />

          {/* Allocation Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-obsidian-800 text-xs font-mono">
            {holdings.map((h) => (
              <div key={h.symbol} className="flex items-center justify-between text-slate-300">
                <span className="truncate">{h.symbol}:</span>
                <span className="font-bold text-slate-100">{formatPct(h.allocation, 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Holdings Table */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-obsidian-900 border border-obsidian-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Current Portfolio Positions
              </h3>
              <p className="text-xs text-slate-400">Asset classes, market values, and individual risk statuses</p>
            </div>
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>View All</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-obsidian-800 text-slate-400 text-left">
                  <th className="pb-2.5 font-semibold">Asset</th>
                  <th className="pb-2.5 font-semibold">Alloc</th>
                  <th className="pb-2.5 font-semibold">Current Value</th>
                  <th className="pb-2.5 font-semibold">Exp Return</th>
                  <th className="pb-2.5 font-semibold">Volatility</th>
                  <th className="pb-2.5 font-semibold">Liquidity</th>
                  <th className="pb-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-850">
                {holdings.map((h) => {
                  const isBreach = h.status !== 'NORMAL';
                  return (
                    <tr
                      key={h.symbol}
                      className="hover:bg-obsidian-850/60 transition-colors cursor-pointer"
                      onClick={() => onNavigate('portfolio')}
                    >
                      <td className="py-2.5 font-bold text-slate-200">
                        {h.symbol}
                        <span className="text-[11px] text-slate-400 font-normal block font-sans truncate max-w-[140px]">
                          {h.name}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-200 font-bold">{formatPct(h.allocation)}</td>
                      <td className="py-2.5 text-slate-300">{formatINR(h.current_value)}</td>
                      <td className="py-2.5 text-slate-400">{formatPct(h.expected_return)}</td>
                      <td className="py-2.5 text-slate-400">{formatPct(h.volatility)}</td>
                      <td className="py-2.5 text-slate-400">{formatPct(h.liquidity_score, 0)}</td>
                      <td className="py-2.5 text-right">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Active Alerts & Recommended Actions & Recent Decisions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Alerts Card */}
        <div className="p-5 rounded-lg bg-obsidian-900 border border-obsidian-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Active Risk Alerts
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{activeAlerts.length} active</span>
          </div>

          <div className="space-y-2.5">
            {activeAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-md bg-obsidian-950 border border-obsidian-800 hover:border-obsidian-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">{alert.message}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{alert.recommendation}</p>
              </div>
            ))}

            {activeAlerts.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mx-auto mb-2" />
                <p>No active risk alerts.</p>
                <p className="text-[11px] text-slate-400">Portfolio is currently within configured limits.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Actions Card */}
        <div className="p-5 rounded-lg bg-obsidian-900 border border-obsidian-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Recommended Actions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-indigo-400">Optimizer Ready</span>
            </div>

            <div className="p-3.5 rounded-md bg-obsidian-950 border border-obsidian-800 space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 block">
                Defensive Strategy
              </span>
              <p className="text-slate-300 leading-relaxed">
                {metrics?.risk_status === 'CRITICAL'
                  ? 'Urgent rebalancing required: Execute defensive capital rotation to trim high-beta equities and buffer sovereign debt reserves.'
                  : 'Maintain balanced risk parameters. Rebalance equity holdings to align with the 35% concentration threshold.'}
              </p>
              <div className="pt-2 border-t border-obsidian-850 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Target Volatility:</span>
                <strong className="text-slate-200">&lt; 14.50%</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('optimization')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all"
          >
            <span>Open Optimization Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Decisions Audit Trail */}
        <div className="p-5 rounded-lg bg-obsidian-900 border border-obsidian-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Recent Decisions
              </h3>
            </div>
            <button
              onClick={() => onNavigate('decisions')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              All History
            </button>
          </div>

          <div className="space-y-2.5">
            {decisions.slice(0, 3).map((dec) => (
              <div
                key={dec.id}
                className="p-3 rounded-md bg-obsidian-950 border border-obsidian-800 text-xs hover:border-obsidian-700 transition-colors cursor-pointer"
                onClick={() => onNavigate('decisions')}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span className="font-bold text-indigo-400">{dec.event_type}</span>
                  <span>{new Date(dec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="font-semibold text-slate-200 truncate">{dec.trigger}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{dec.action}</p>
              </div>
            ))}

            {decisions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p>No decision history recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Crash Modal */}
      <MarketCrashModal
        isOpen={isCrashModalOpen}
        onClose={() => setIsCrashModalOpen(false)}
        result={crashResult}
        isLoading={isCrashing}
        onApplyRebalance={handleApplyRebalanceFromCrash}
        isApplyingRebalance={isApplyingRebalance}
      />
    </div>
  );
};
