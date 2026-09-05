import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-widest text-slate-100 uppercase">CapitalGuard</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider">SECURE TERMINAL INITIALIZING...</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex flex-col gap-2 text-xs font-mono text-slate-400 min-w-[240px]">
        {[
          'Checking authentication...',
          'Loading portfolio...',
          'Loading risk telemetry...',
          'Initializing risk engine...',
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
            <span>{step}</span>
          </div>
        ))}
      </div>

      {/* Animated bar */}
      <div className="w-64 h-0.5 bg-obsidian-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
