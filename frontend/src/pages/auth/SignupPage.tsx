import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CAPABILITIES = [
  { icon: '⚡', label: 'Portfolio Optimization', desc: 'SLSQP constrained allocation' },
  { icon: '🛡', label: 'Real-Time Risk Monitor', desc: 'VaR, volatility, drawdown' },
  { icon: '🌊', label: 'Stress Testing', desc: 'Market crash simulations' },
  { icon: '🤖', label: 'Automated Controls', desc: 'Closed-loop risk response' },
  { icon: '📋', label: 'Explainable Decisions', desc: 'Every action has a reason' },
  { icon: '📜', label: 'Audit Trail', desc: 'Persistent decision history' },
];

export function SignupPage() {
  const { signUp, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', org: '', role: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const validate = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!form.email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
    if (form.password.length < 8) return 'Password must contain at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    const { error: authError, needsVerification: nv } = await signUp(form.email, form.password, form.fullName, form.org, form.role);
    setLoading(false);
    if (authError) { setError(authError); return; }
    if (nv) { setNeedsVerification(true); return; }
    navigate('/dashboard', { replace: true });
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-700/50 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">CHECK YOUR EMAIL</h1>
          <p className="text-slate-400 mb-6">
            Your CapitalGuard account has been created. Please verify your email address before signing in.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            We sent a verification link to <strong className="text-slate-300">{form.email}</strong>
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors text-sm"
            >
              GO TO SIGN IN
            </Link>
            <button
              onClick={() => signUp(form.email, form.password, form.fullName, form.org, form.role)}
              className="py-3 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 font-semibold transition-colors text-sm border border-obsidian-700"
            >
              RESEND VERIFICATION EMAIL
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 flex">
      {/* ─── Left: Signup Form ─── */}
      <div className="w-full lg:w-[520px] flex flex-col justify-center px-8 py-12 lg:px-12 border-r border-obsidian-800 overflow-y-auto">
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
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">CREATE YOUR ACCOUNT</h1>
          <p className="text-slate-400 mt-1 text-sm">Build smarter portfolios. Monitor risk. Make better capital decisions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={update('fullName')}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="officer@fund.com"
                className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Organization</label>
              <input
                type="text"
                value={form.org}
                onChange={update('org')}
                placeholder="Apex Capital"
                className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Job Role</label>
              <select
                value={form.role}
                onChange={update('role')}
                className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
              >
                <option value="">Select role</option>
                <option value="Portfolio Manager">Portfolio Manager</option>
                <option value="Risk Officer">Risk Officer</option>
                <option value="CIO">Chief Investment Officer</option>
                <option value="CFO">Chief Financial Officer</option>
                <option value="Analyst">Financial Analyst</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className={`h-1 flex-1 rounded-full ${form.password.length >= 8 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className={`h-1 flex-1 rounded-full ${form.password.length >= 12 ? 'bg-emerald-500' : 'bg-obsidian-700'}`} />
                  <div className={`h-1 flex-1 rounded-full ${form.password.length >= 16 ? 'bg-emerald-500' : 'bg-obsidian-700'}`} />
                  <span className="text-[10px] text-slate-500">{form.password.length >= 16 ? 'Strong' : form.password.length >= 12 ? 'Good' : form.password.length >= 8 ? 'Weak' : 'Too short'}</span>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={update('confirm')}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-rose-400 mt-1">Passwords do not match.</p>
              )}
              {form.confirm && form.password === form.confirm && form.confirm.length > 0 && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm tracking-wide mt-2"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in</Link>
        </p>
      </div>

      {/* ─── Right: Capabilities Panel ─── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 bg-obsidian-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 max-w-md">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">BUILD YOUR RISK-AWARE PORTFOLIO</h2>
          <p className="text-slate-400 text-sm mb-8">Everything you need to manage capital intelligently and respond to risk in real time.</p>

          <div className="space-y-3">
            {CAPABILITIES.map((c, i) => (
              <div
                key={c.label}
                className="flex items-center gap-4 p-4 rounded-xl bg-obsidian-900/80 border border-obsidian-800 hover:border-indigo-700/40 transition-colors"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{c.label}</p>
                  <p className="text-xs text-slate-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
