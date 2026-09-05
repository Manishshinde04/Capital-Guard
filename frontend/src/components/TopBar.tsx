import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Sun, Moon, Monitor, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { getStatusBadge } from '../utils/formatters';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  riskStatus: string;
  isSimulating: boolean;
  onToggleSim: (running: boolean) => void;
  onResetDemo: () => void;
  isResetting?: boolean;
  onNavigate?: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  riskStatus,
  isSimulating,
  onToggleSim,
  onResetDemo,
  isResetting = false,
  onNavigate,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const badge = getStatusBadge(riskStatus);
  const { user, profile, signOut, isDemoMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const handleResetClick = () => {
    if (resetConfirm) {
      setResetConfirm(false);
      onResetDemo();
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const themeOptions = [
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <header className="h-16 bg-obsidian-900/90 backdrop-blur-md border-b border-obsidian-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Title & Tagline */}
      <div className="flex items-center gap-4">
        <div>
          <img src={logo} alt="CapitalGuard" className="w-8 h-8 mr-2" />
          <h1 className="text-base lg:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            CapitalGuard
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-700/50">
              TERMINAL
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">Smart Capital Allocation. Real-Time Risk Control.</p>
        </div>
      </div>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-2 lg:gap-3 text-xs font-mono">
        {/* System Health Indicators */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-md bg-obsidian-950/70 border border-obsidian-800 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            API: <strong className="text-slate-200">OK</strong>
          </span>
          <span className="text-obsidian-700">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            DB: <strong className="text-slate-200">{isDemoMode ? 'LOCAL' : 'SUPABASE'}</strong>
          </span>
          <span className="text-obsidian-700">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ENGINE: <strong className="text-slate-200">SLSQP</strong>
          </span>
        </div>

        {/* Live Simulation Pill */}
        <button
          onClick={() => onToggleSim(!isSimulating)}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
            isSimulating
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-950/60'
              : 'bg-amber-950/40 text-amber-300 border-amber-700/60 hover:bg-amber-950/60'
          }`}
          title="Click to toggle continuous market drift"
        >
          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isSimulating ? 'LIVE' : 'PAUSED'}</span>
        </button>

        {/* Timestamp */}
        <div className="hidden lg:flex items-center gap-1 text-slate-400 bg-obsidian-950/60 px-2.5 py-1.5 rounded border border-obsidian-800/80">
          <span className="text-[11px] text-slate-400">T:</span>
          <span className="text-slate-200 font-semibold">{currentTime}</span>
        </div>

        {/* Risk Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-bold tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span className="hidden sm:inline">STATUS: </span>{riskStatus || 'NORMAL'}
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={handleResetClick}
          disabled={isResetting}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-colors ${
            resetConfirm
              ? 'bg-rose-950/50 border-rose-700/60 text-rose-300'
              : 'bg-obsidian-850 hover:bg-obsidian-800 border-obsidian-700 text-slate-300 hover:text-slate-100'
          }`}
          title="Reset portfolio to baseline demo configuration"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{resetConfirm ? 'CONFIRM?' : 'Reset'}</span>
        </button>

        {/* ─── User Menu ─── */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 text-xs font-bold">
              {initials}
            </div>
            <span className="hidden lg:inline text-xs text-slate-300 font-medium max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-obsidian-900 border border-obsidian-700 shadow-2xl shadow-black/50 z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-obsidian-800">
                <p className="text-sm font-semibold text-slate-100 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                {isDemoMode && (
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/50 text-indigo-400 font-mono">DEMO MODE</span>
                )}
              </div>

              {/* Profile & Settings */}
              <div className="py-1">
                <button
                  onClick={() => { setUserMenuOpen(false); onNavigate?.('settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-obsidian-800 hover:text-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  Profile & Settings
                </button>

                {/* Theme switcher */}
                <div className="px-4 py-2.5 border-t border-obsidian-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Theme</p>
                  <div className="flex gap-1.5">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                          theme === value
                            ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300'
                            : 'bg-obsidian-800 border border-obsidian-700 text-slate-500 hover:text-slate-300'
                        }`}
                        title={label}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <div className="py-1 border-t border-obsidian-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
