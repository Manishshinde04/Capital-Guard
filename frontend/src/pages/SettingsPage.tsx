import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, CheckCircle2, ShieldAlert, User, Lock, Sliders, Sun, Moon, Monitor, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import { RiskPolicy } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SettingsPageProps {
  onPolicyUpdated?: () => void;
}

type Tab = 'account' | 'security' | 'preferences' | 'risk';

export const SettingsPage: React.FC<SettingsPageProps> = ({ onPolicyUpdated }) => {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'risk', label: 'Risk Policy', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account, preferences, and risk policy.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-obsidian-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? 'text-indigo-400 border-indigo-500'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-obsidian-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'account' && <AccountTab />}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'preferences' && <PreferencesTab />}
      {activeTab === 'risk' && <RiskPolicyTab onPolicyUpdated={onPolicyUpdated} />}
    </div>
  );
};

// ─── Account Tab ──────────────────────────────────────────────────────────────
function AccountTab() {
  const { user, profile, updateProfile, isDemoMode } = useAuth();
  const [form, setForm] = useState({ full_name: '', organization: '', job_role: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        organization: profile.organization || '',
        job_role: profile.job_role || '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error: err } = await updateProfile(form);
    setSaving(false);
    if (err) { setError(err); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const emailVerified = !!user?.email_confirmed_at;

  return (
    <div className="max-w-xl space-y-6">
      {isDemoMode && (
        <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-700/50 text-xs text-indigo-300">
          ⚡ Running in Demo Mode — profile changes are stored locally only.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="flex-1 px-4 py-3 rounded-lg bg-obsidian-950 border border-obsidian-800 text-slate-400 text-sm cursor-not-allowed"
            />
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              emailVerified
                ? 'bg-emerald-950/40 border border-emerald-700/50 text-emerald-400'
                : 'bg-amber-950/40 border border-amber-700/50 text-amber-400'
            }`}>
              {emailVerified ? <CheckCircle2 className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
              {emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Organization</label>
          <input
            type="text"
            value={form.organization}
            onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
            placeholder="Your fund or firm"
            className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Job Role</label>
          <select
            value={form.job_role}
            onChange={e => setForm(f => ({ ...f, job_role: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
          >
            <option value="">Select role</option>
            <option>Portfolio Manager</option>
            <option>Risk Officer</option>
            <option>Chief Investment Officer</option>
            <option>Chief Financial Officer</option>
            <option>Financial Analyst</option>
            <option>Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
        >
          {saved ? (
            <><CheckCircle2 className="w-4 h-4" /> SAVED</>
          ) : (
            <><Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE CHANGES'}</>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const { updatePassword, isDemoMode } = useAuth();
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.newPassword !== form.confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setSaving(true);
    const { error: err } = await updatePassword(form.newPassword);
    setSaving(false);
    if (err) { setError(err); return; }
    setSaved(true);
    setForm({ newPassword: '', confirm: '' });
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      {isDemoMode && (
        <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-700/50 text-xs text-indigo-300">
          ⚡ Demo Mode — password changes are simulated only.
        </div>
      )}

      <div className="p-5 rounded-xl bg-obsidian-900/60 border border-obsidian-800">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Change Password</h2>
        <form onSubmit={handleChange} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Password updated successfully.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 pr-12 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat new password"
              className="w-full px-4 py-3 rounded-lg bg-obsidian-900 border border-obsidian-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            {saving ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Preferences Tab ───────────────────────────────────────────────────────────
function PreferencesTab() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'dark' as const, icon: Moon, label: 'Dark', desc: 'Institutional terminal theme' },
    { value: 'light' as const, icon: Sun, label: 'Light', desc: 'Clean professional light mode' },
    { value: 'system' as const, icon: Monitor, label: 'System', desc: 'Follow OS preference' },
  ];

  return (
    <div className="max-w-xl space-y-6">
      <div className="p-5 rounded-xl bg-obsidian-900/60 border border-obsidian-800">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">Theme</h2>
        <p className="text-xs text-slate-500 mb-4">Choose your preferred visual theme.</p>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                theme === value
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-300'
                  : 'bg-obsidian-950/40 border-obsidian-700 text-slate-400 hover:border-obsidian-600 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-[10px] text-center leading-tight opacity-70">{desc}</span>
              {theme === value && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-xl bg-obsidian-900/60 border border-obsidian-800">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Application Disclaimer</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          CapitalGuard is a financial decision-support and simulation platform. All portfolio operations are simulated.
          No real financial transactions are executed. This platform does not constitute financial advice.
        </p>
      </div>
    </div>
  );
}

// ─── Risk Policy Tab (preserved from existing) ────────────────────────────────
function RiskPolicyTab({ onPolicyUpdated }: { onPolicyUpdated?: () => void }) {
  const [policy, setPolicy] = useState<RiskPolicy | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    api.getRiskPolicy().then(setPolicy).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateRiskPolicy(policy);
      setPolicy(updated);
      setSaveSuccess(true);
      if (onPolicyUpdated) onPolicyUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save policy error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setPolicy({
      id: policy?.id || 1,
      max_equity: 0.35,
      max_volatility: 0.18,
      warning_volatility: 0.14,
      warning_var: 0.05,
      critical_var: 0.08,
      max_concentration: 0.30,
      min_liquidity: 0.20,
      critical_liquidity: 0.15,
      max_drawdown: 0.15,
      warning_drawdown: 0.10,
      transaction_cost_rate: 0.0015
    });
  };

  if (!policy) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-6">
        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading risk policy...
      </div>
    );
  }

  const policyFields = [
    { key: 'max_equity' as keyof RiskPolicy, label: 'Maximum Equity Allocation', min: 0.1, max: 1, step: 0.01, format: (v: number) => `${(v * 100).toFixed(0)}%` },
    { key: 'max_volatility' as keyof RiskPolicy, label: 'Maximum Portfolio Volatility', min: 0.05, max: 0.5, step: 0.005, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'warning_volatility' as keyof RiskPolicy, label: 'Volatility Warning Threshold', min: 0.05, max: 0.5, step: 0.005, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'warning_var' as keyof RiskPolicy, label: 'VaR Warning Threshold (95%)', min: 0.01, max: 0.2, step: 0.005, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'critical_var' as keyof RiskPolicy, label: 'VaR Critical Threshold (95%)', min: 0.01, max: 0.3, step: 0.005, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'max_concentration' as keyof RiskPolicy, label: 'Maximum Single Asset Concentration', min: 0.1, max: 1, step: 0.01, format: (v: number) => `${(v * 100).toFixed(0)}%` },
    { key: 'min_liquidity' as keyof RiskPolicy, label: 'Minimum Liquidity Score', min: 0.1, max: 1, step: 0.01, format: (v: number) => `${(v * 100).toFixed(0)}%` },
    { key: 'max_drawdown' as keyof RiskPolicy, label: 'Maximum Drawdown Limit', min: 0.01, max: 0.5, step: 0.005, format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'transaction_cost_rate' as keyof RiskPolicy, label: 'Transaction Cost Rate', min: 0, max: 0.05, step: 0.0001, format: (v: number) => `${(v * 100).toFixed(2)}%` },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Risk Policy Configuration</h2>
          <p className="text-slate-400 text-sm mt-1">Set your portfolio risk limits and alert thresholds.</p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 text-slate-300 text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {policyFields.map(({ key, label, min, max, step, format }) => {
          const val = policy[key] as number;
          return (
            <div key={key} className="p-4 rounded-xl bg-obsidian-900/60 border border-obsidian-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-200">{label}</label>
                <span className="text-sm font-bold font-mono text-indigo-400">{format(val)}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={val}
                onChange={e => setPolicy(p => p ? { ...p, [key]: parseFloat(e.target.value) } : p)}
                className="w-full h-1.5 appearance-none bg-obsidian-700 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                <span>{format(min)}</span>
                <span>{format(max)}</span>
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
        >
          {saveSuccess ? (
            <><CheckCircle2 className="w-4 h-4" /> SAVED</>
          ) : (
            <><Save className="w-4 h-4" /> {isSaving ? 'SAVING...' : 'SAVE RISK POLICY'}</>
          )}
        </button>
      </form>
    </div>
  );
}
