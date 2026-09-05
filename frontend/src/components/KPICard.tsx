import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical';
  highlight?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral',
  highlight = false
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'negative':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      case 'warning':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'critical':
        return 'text-rose-400 bg-rose-950/80 border-rose-700 animate-pulse';
      default:
        return 'text-slate-400 bg-obsidian-800/50 border-obsidian-700/50';
    }
  };

  return (
    <div
      className={`relative p-5 rounded-lg border bg-obsidian-900 transition-all hover:border-obsidian-700 shadow-sm ${
        highlight
          ? 'border-indigo-500/50 ring-1 ring-indigo-500/20'
          : 'border-obsidian-800'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-7 h-7 rounded bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-slate-400">
          <Icon className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
          {value}
        </div>
        {trend && (
          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${getTrendColor()}`}
          >
            {trend}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
    </div>
  );
};
