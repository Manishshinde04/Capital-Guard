import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Activity, Zap, ShieldAlert, BookOpen, History, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Animated Number Counter ─────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '', decimals = 0 }: { target: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const duration = 1500;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setValue(parseFloat((progress * target).toFixed(decimals)));
        if (progress < 1) requestAnimationFrame(step);
        else setValue(target);
      };
      requestAnimationFrame(step);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, decimals]);

  return <span ref={ref}>{prefix}{value.toFixed(decimals)}{suffix}</span>;
}

// ─── Hero Terminal Preview ────────────────────────────────────────────────────
function HeroTerminal() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % 5), 2000);
    return () => clearInterval(interval);
  }, []);

  const events = [
    { label: 'MARKET SHOCK DETECTED', color: 'text-rose-400', icon: '⚡' },
    { label: 'RISK ENGINE ACTIVATED', color: 'text-amber-400', icon: '🛡' },
    { label: 'RUNNING SLSQP OPTIMIZER', color: 'text-indigo-400', icon: '⚙' },
    { label: 'OPTIMIZATION COMPLETE', color: 'text-emerald-400', icon: '✓' },
    { label: 'DEFENSIVE ALLOCATION APPLIED', color: 'text-emerald-400', icon: '✓' },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Terminal window */}
      <div className="rounded-2xl bg-obsidian-900 border border-obsidian-700 shadow-2xl overflow-hidden">
        {/* Window bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-obsidian-950/80 border-b border-obsidian-800">
          <span className="w-3 h-3 rounded-full bg-rose-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="text-xs font-mono text-slate-500 ml-2">capitalguard — risk terminal</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {[
            { label: 'PORTFOLIO VALUE', value: '₹10.03 Cr', sub: '+0.32%', color: 'text-emerald-400' },
            { label: 'EXPECTED RETURN', value: '11.32%', sub: 'annualized', color: 'text-indigo-400' },
            { label: 'PORTFOLIO RISK', value: '14.2%', sub: 'volatility', color: 'text-amber-400' },
            { label: 'LIQUIDITY SCORE', value: '90.5%', sub: 'weighted avg', color: 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="p-3 rounded-xl bg-obsidian-950/60 border border-obsidian-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{k.label}</p>
              <p className={`text-xl font-bold font-mono mt-0.5 ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-slate-600">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Event Log */}
        <div className="px-4 pb-4 space-y-2">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">CLOSED-LOOP EVENT LOG</p>
          {events.map((ev, i) => (
            <div
              key={ev.label}
              className={`flex items-center gap-2 text-xs font-mono transition-all duration-500 ${i <= phase ? 'opacity-100' : 'opacity-20'}`}
            >
              <span className={`${i <= phase ? ev.color : 'text-slate-700'}`}>{ev.icon}</span>
              <span className={i <= phase ? ev.color : 'text-slate-700'}>{ev.label}</span>
              {i === phase && <span className="w-1.5 h-3 bg-indigo-400 animate-pulse rounded-sm" />}
            </div>
          ))}
        </div>

        {/* Flow strip */}
        <div className="px-4 pb-4 flex items-center gap-1.5 flex-wrap">
          {['MARKET', 'DETECT', 'OPTIMIZE', 'RESPOND', 'RECORD'].map((s, i, arr) => (
            <React.Fragment key={s}>
              <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-[10px] font-mono">{s}</span>
              {i < arr.length - 1 && <span className="text-slate-700 text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => navigate(user ? '/dashboard' : '/signup');

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 font-sans">
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-obsidian-800/80 bg-obsidian-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold text-base tracking-wider uppercase text-slate-100">CapitalGuard</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            {['Product', 'How It Works', 'Risk Intelligence', 'Optimization', 'Security'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-slate-200 transition-colors">{item}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center gap-2">
                GO TO DASHBOARD <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors">
                  LOGIN
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">
                  GET STARTED
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-400 hover:text-slate-200">
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-current" />
              <div className="w-5 h-0.5 bg-current" />
              <div className="w-5 h-0.5 bg-current" />
            </div>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-obsidian-800 px-6 py-4 flex flex-col gap-4">
            <Link to="/login" className="text-slate-300 text-sm">Login</Link>
            <Link to="/signup" className="text-indigo-400 font-semibold text-sm">Get Started</Link>
          </div>
        )}
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Intelligent Capital Risk Management
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-100 leading-tight mb-6">
              SMART CAPITAL<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ALLOCATION.</span><br />
              REAL-TIME RISK<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CONTROL.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
              Optimize capital allocation, detect portfolio risk, simulate market shocks, and generate explainable rebalancing decisions — all from one intelligent risk-control platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-900/40"
              >
                {user ? 'GO TO DASHBOARD' : 'GET STARTED'} <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-obsidian-800/80 hover:bg-obsidian-700 border border-obsidian-700 text-slate-300 font-semibold transition-colors"
              >
                VIEW DEMO
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-10 text-xs text-slate-500">
              {['SLSQP Optimizer', 'Real-Time Risk Engine', 'Supabase Auth', 'Row Level Security'].map(b => (
                <span key={b} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500" /> {b}
                </span>
              ))}
            </div>
          </div>

          {/* Terminal Visual */}
          <HeroTerminal />
        </div>
      </section>

      {/* ─── Stats Banner ───────────────────────────────────────────────────── */}
      <section className="border-y border-obsidian-800 bg-obsidian-900/40">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Portfolio Assets', value: 10, suffix: '+', prefix: '' },
            { label: 'Risk Metrics Tracked', value: 8, suffix: '', prefix: '' },
            { label: 'Demo Capital (₹ Cr)', value: 10, suffix: '', prefix: '₹' },
            { label: 'Optimization Accuracy', value: 99, suffix: '%', prefix: '' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-indigo-400 font-mono">
                <AnimatedNumber target={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Problem Section ────────────────────────────────────────────────── */}
      <section id="product" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">The Problem</p>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">TRADITIONAL CAPITAL MANAGEMENT IS REACTIVE</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Most portfolio tools tell you what happened. CapitalGuard tells you what to do next.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '⏱', title: 'Manual Rebalancing', desc: 'Human-driven portfolio adjustments that lag behind market movements by hours or days.' },
            { icon: '🔒', title: 'Static Risk Thresholds', desc: 'Fixed limits that don\'t adapt to changing market conditions or portfolio dynamics.' },
            { icon: '🕳', title: 'Hidden Concentration Risk', desc: 'Portfolio concentrations that aren\'t visible until they become a critical problem.' },
            { icon: '💧', title: 'Liquidity Pressure', desc: 'Illiquid positions that create forced selling scenarios during market stress.' },
            { icon: '🌩', title: 'Delayed Risk Response', desc: 'Risk detection and response cycles measured in hours when seconds matter.' },
            { icon: '🔭', title: 'Limited Scenario Visibility', desc: 'No way to stress-test portfolios against real market shock scenarios before they happen.' },
          ].map(p => (
            <div key={p.title} className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800 hover:border-rose-900/60 transition-colors group">
              <span className="text-2xl mb-3 block">{p.icon}</span>
              <h3 className="font-semibold text-slate-200 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Solution / Architecture ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-obsidian-900/40 border-y border-obsidian-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">The Solution</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-4">FROM PASSIVE MONITORING TO ACTIVE RISK CONTROL</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              CapitalGuard is not just a portfolio dashboard. It is a closed-loop capital risk management system.
            </p>
          </div>

          {/* Architecture flow */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
            {[
              { step: 'MARKET', color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60', desc: 'Price changes' },
              { step: 'MONITOR', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60', desc: 'Track metrics' },
              { step: 'DETECT', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/60', desc: 'Breach alerts' },
              { step: 'OPTIMIZE', color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/60', desc: 'SLSQP solve' },
              { step: 'RESPOND', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/60', desc: 'Rebalance' },
              { step: 'EXPLAIN', color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/60', desc: 'Reasoning' },
              { step: 'RECORD', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60', desc: 'Audit trail' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.step}>
                <div className={`flex flex-col items-center px-4 py-3 rounded-xl border ${s.bg} min-w-[90px]`}>
                  <span className={`text-sm font-bold font-mono ${s.color}`}>{s.step}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{s.desc}</span>
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-5 h-5 text-slate-700 shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          <p className="text-center text-slate-400 max-w-xl mx-auto text-sm">
            Every market event triggers an automated response chain — from detection to optimization to explainable recommendation, with a full audit trail.
          </p>
        </div>
      </section>

      {/* ─── Capabilities ───────────────────────────────────────────────────── */}
      <section id="risk-intelligence" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">Key Capabilities</p>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">EVERYTHING YOU NEED TO MANAGE RISK INTELLIGENTLY</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: 'Intelligent Optimization', desc: 'Find risk-adjusted allocations under real portfolio constraints using SLSQP constrained optimization.', badge: 'SLSQP' },
            { icon: ShieldAlert, title: 'Real-Time Risk Monitoring', desc: 'Track volatility, VaR, liquidity, concentration, and drawdown against configurable policy limits.', badge: 'LIVE' },
            { icon: Zap, title: 'Stress Testing', desc: 'Understand how your portfolio behaves during market shocks: crashes, rate spikes, sector failures.', badge: 'MONTE CARLO' },
            { icon: Activity, title: 'Automated Controls', desc: 'Detect threshold breaches and generate corrective rebalancing actions automatically.', badge: 'CLOSED-LOOP' },
            { icon: BookOpen, title: 'Explainable Decisions', desc: 'Every recommendation includes full reasoning: what happened, why it matters, what to do, expected outcome.', badge: 'EXPLAINABLE' },
            { icon: History, title: 'Audit Trail', desc: 'Maintain a transparent, persistent history of all risk events, decisions, and portfolio actions.', badge: 'PERSISTENT' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800 hover:border-indigo-700/50 transition-all group hover:shadow-lg hover:shadow-indigo-900/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center group-hover:bg-indigo-900/40 transition-colors">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-obsidian-950 border border-obsidian-700 text-slate-500">{c.badge}</span>
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Security Section ────────────────────────────────────────────────── */}
      <section id="security" className="bg-obsidian-900/40 border-y border-obsidian-800">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">Security</p>
            <h2 className="text-3xl font-bold text-slate-100 mb-4">BUILT WITH SECURITY AS A FOUNDATION</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              CapitalGuard is designed with strict data isolation and secure authentication from the ground up.
            </p>
            <div className="space-y-4">
              {[
                { title: 'Supabase Authentication', desc: 'Real token-based auth with automatic session refresh. No passwords stored manually.' },
                { title: 'Row Level Security', desc: 'PostgreSQL RLS enforced at database level — auth.uid() gates every query.' },
                { title: 'User Data Isolation', desc: 'Every portfolio, alert, decision, and setting belongs strictly to its owner.' },
                { title: 'Secure Sessions', desc: 'Sessions persist safely across refreshes, with proper token lifecycle management.' },
                { title: 'No Secret Exposure', desc: 'Service role keys never leave the server. Frontend uses only the public anon key.' },
              ].map(s => (
                <div key={s.title} className="flex gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{s.title}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-obsidian-900 border border-obsidian-700 p-6 font-mono text-xs space-y-2">
              <p className="text-slate-600 mb-4">-- Row Level Security Policy</p>
              <p className="text-indigo-400">CREATE POLICY</p>
              <p className="text-slate-300 pl-4">"users_own_portfolio"</p>
              <p className="text-indigo-400">ON</p>
              <p className="text-slate-300 pl-4">portfolios</p>
              <p className="text-indigo-400">FOR ALL</p>
              <p className="text-indigo-400">USING (</p>
              <p className="text-emerald-400 pl-4">auth.uid() = user_id</p>
              <p className="text-indigo-400">);</p>
              <div className="border-t border-obsidian-800 mt-4 pt-4">
                <p className="text-slate-600">-- User can only access</p>
                <p className="text-slate-600">-- their own data</p>
                <p className="text-emerald-400 mt-2">✓ Cross-user access: DENIED</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-slate-100 mb-4">
          READY TO TAKE CONTROL OF YOUR CAPITAL?
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Move from reactive portfolio monitoring to intelligent, explainable risk control.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-900/50"
          >
            START WITH CAPITALGUARD <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-700 text-slate-300 font-bold text-lg transition-colors"
          >
            EXPLORE DEMO
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-obsidian-800 bg-obsidian-900/40">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-slate-100 uppercase tracking-wider">CapitalGuard</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Smart Capital Allocation. Real-Time Risk Control.</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Product</p>
              <div className="space-y-2">
                {['Methodology', 'Risk Intelligence', 'Optimization', 'Stress Testing'].map(l => (
                  <a key={l} href="#" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Legal</p>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Access</p>
              <div className="space-y-2">
                <Link to="/login" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">Login</Link>
                <Link to="/signup" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign Up</Link>
                <Link to="/dashboard" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">Demo Dashboard</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-obsidian-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© 2026 CapitalGuard. Decision-support simulation platform.</p>
            <p className="text-xs text-slate-700 max-w-md text-center">
              CapitalGuard is a financial decision-support and simulation platform developed for demonstration purposes. It does not provide financial advice or execute real-world financial transactions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
