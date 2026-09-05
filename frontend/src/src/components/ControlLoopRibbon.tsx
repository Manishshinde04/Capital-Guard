import React from 'react';
import { ArrowRight, Eye, ShieldCheck, Sliders, MessageSquare, Save, Activity, AlertOctagon } from 'lucide-react';

interface ControlLoopRibbonProps {
  activeStep?: number;
}

export const ControlLoopRibbon: React.FC<ControlLoopRibbonProps> = ({ activeStep = 0 }) => {
  const steps = [
    { label: 'MARKET', desc: 'Price Shocks & Drift', icon: Activity },
    { label: 'MONITOR', desc: 'Exposure & Metrics', icon: Eye },
    { label: 'DETECT', desc: 'Policy Breaches', icon: AlertOctagon },
    { label: 'OPTIMIZE', desc: 'Constrained SLSQP', icon: Sliders },
    { label: 'RESPOND', desc: 'Rebalance Orders', icon: ShieldCheck },
    { label: 'EXPLAIN', desc: '5-Point Rationale', icon: MessageSquare },
    { label: 'RECORD', desc: 'Audit Trail Entry', icon: Save },
  ];

  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Closed-Loop Autonomous Risk Architecture
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          Continuous Institutional Feedback Loop
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = activeStep === idx;
          return (
            <div
              key={step.label}
              className={`relative flex flex-col items-center text-center p-2.5 rounded-md border transition-all ${
                isCurrent
                  ? 'bg-indigo-950/60 border-indigo-500/80 ring-1 ring-indigo-500/40 text-indigo-200'
                  : 'bg-obsidian-950/40 border-obsidian-800 text-slate-400 hover:border-obsidian-700'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-obsidian-850 flex items-center justify-center mb-1.5 border border-obsidian-700/60">
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-xs font-bold font-mono tracking-tight text-slate-200">{step.label}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{step.desc}</span>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-obsidian-700">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
