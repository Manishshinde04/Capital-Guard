import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatINR, formatPct } from '../utils/formatters';

interface AllocationDonutProps {
  holdings: Array<{
    symbol: string;
    name: string;
    allocation: number;
    current_value: number;
  }>;
  totalValue: number;
}

const ASSET_COLORS: Record<string, string> = {
  EQUITY: '#6366f1', // Indigo
  GBOND: '#10b981',  // Emerald
  CBOND: '#06b6d4',  // Cyan
  GOLD: '#f59e0b',   // Amber
  REIT: '#ec4899',   // Pink
  CASH: '#64748b'    // Slate
};

export const AllocationDonut: React.FC<AllocationDonutProps> = ({ holdings, totalValue }) => {
  const data = holdings.map((h) => ({
    name: h.symbol,
    fullName: h.name,
    value: h.current_value,
    allocation: h.allocation,
    color: ASSET_COLORS[h.symbol] || '#94a3b8'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-obsidian-950 border border-obsidian-700 p-2.5 rounded shadow-xl text-xs font-mono z-50">
          <p className="font-bold text-slate-100">{d.name} — {d.fullName}</p>
          <div className="mt-1 space-y-0.5 text-slate-300">
            <p>Allocation: <strong className="text-indigo-400">{formatPct(d.allocation)}</strong></p>
            <p>Value: <strong className="text-slate-200">{formatINR(d.value)}</strong></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            stroke="#0a0e1a"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total Capital</span>
        <span className="text-sm font-bold font-mono text-slate-100">{formatINR(totalValue)}</span>
        <span className="text-[10px] text-emerald-400 font-mono">100% Allocated</span>
      </div>
    </div>
  );
};
