import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Demo telemetry values shown on the right panel
const DEMO_METRICS = [
  { label: 'Portfolio Risk', value: '10.16%', status: 'warning', trend: 'up' },
  { label: 'Liquidity Score', value: '90.45%', status: 'good', trend: 'stable' },
  { label: 'Value at Risk', value: '5.40%', status: 'warning', trend: 'up' },
  { label: 'Expected Return', value: '11.32%', status: 'good', trend: 'up' },
  { label: 'Sharpe Ratio', value: '1.42', status: 'good', trend: 'up' },
  { label: 'Max Drawdown', value: '8.60%', status: 'good', trend: 'down' },
];

export function LoginPage() {
  const { signIn, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) { setError(authError); return; }
    navigate(from, { replace: true });
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await signIn('demo@capitalguard.app', 'demo-password');
    setLoading(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex">
      {/* ─── Left: Login Form ─── */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 py-12 lg:px-12 border-r border-obsidian-800">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wider text-slate-100 uppercase">CapitalGuard</span>
            <p className="text-[10px] text-slate-400">Institutional Terminal</p>
          </div>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">WELCOME BACK</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your CapitalGuard risk terminal.</p>
        </div>

        {isDemoMode && (
          <div className="mb-6 p-4 rounded-lg bg-indigo-950/40 border border-indigo-700/50 text-sm">
            <p className="text-indigo-300 font-semibold mb-1">⚡ Demo Mode Active</p>
            <p className="text-slate-400 text-xs">No Supabase credentials configured. Running in demonstration mode with local data.</p>
            <button
              onClick={handleDemoLogin}
              className="mt-3 w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Enter Demo Terminal
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="officer@fund.com"
              className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm tracking-wide"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Create account
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-slate-600">
          CapitalGuard is a financial decision-support simulation platform. Not financial advice.
        </p>
      </div>

      {/* ─── Right: Live Risk Telemetry Panel ─── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 bg-obsidian-950 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative z-10 max-w-md">
          <div className="mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest">Demo Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Live Risk Terminal</h2>
          <p className="text-slate-400 text-sm mb-8">Monitor capital. Control risk. Make better decisions.</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {DEMO_METRICS.map((m) => (
              <div key={m.label} className="p-4 rounded-xl bg-obsidian-900/80 border border-obsidian-800">
                <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-bold font-mono ${m.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {m.value}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {m.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-rose-400" />
                  ) : m.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Activity className="w-3 h-3 text-slate-500" />
                  )}
                  <span className="text-[10px] text-slate-500">live</span>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture flow */}
          <div className="flex items-center gap-2 flex-wrap">
            {['MARKET', 'MONITOR', 'DETECT', 'OPTIMIZE', 'RESPOND', 'EXPLAIN', 'RECORD'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span className="px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-[11px] font-mono font-semibold">
                  {step}
                </span>
                {i < arr.length - 1 && <span className="text-slate-700 text-xs">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
