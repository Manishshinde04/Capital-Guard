export function formatINR(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0.00';
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (absVal >= 10000000) {
    return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
  }
  if (absVal >= 100000) {
    return `${sign}₹${(absVal / 100000).toFixed(2)} Lakh`;
  }
  return `${sign}₹${absVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatPct(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  return `${(val * 100).toFixed(decimals)}%`;
}

export function formatNum(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return val.toFixed(decimals);
}

export function getStatusBadge(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status?.toUpperCase()) {
    case 'NORMAL':
      return {
        bg: 'bg-emerald-950/70',
        text: 'text-emerald-400',
        border: 'border-emerald-700/60',
        dot: 'bg-emerald-400'
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-950/70',
        text: 'text-amber-400',
        border: 'border-amber-700/60',
        dot: 'bg-amber-400'
      };
    case 'CRITICAL':
      return {
        bg: 'bg-rose-950/70',
        text: 'text-rose-400',
        border: 'border-rose-700/60',
        dot: 'bg-rose-400'
      };
    case 'EMERGENCY RISK MODE':
      return {
        bg: 'bg-red-950',
        text: 'text-red-300 font-bold animate-pulse',
        border: 'border-red-600',
        dot: 'bg-red-500 animate-ping'
      };
    default:
      return {
        bg: 'bg-slate-800/80',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400'
      };
  }
}
