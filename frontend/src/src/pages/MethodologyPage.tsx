import React from 'react';
import { BookOpen, ShieldCheck, Activity, Cpu, Lock, CheckCircle2 } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Quantitative Methodology & Financial Engineering
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous mathematical foundations, optimization formulations, risk metrics, and closed-loop control logic.
        </p>
      </div>

      {/* 1. Closed-Loop Risk Management Paradigm */}
      <div className="p-6 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <h3>1. Closed-Loop Institutional Paradigm</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Traditional risk management relies on human intervention after daily close reports. CapitalGuard shifts the workflow to an autonomous closed-loop feedback loop:
        </p>

        <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 font-mono text-xs text-indigo-300 text-center tracking-wider">
          OBSERVE &rarr; ANALYZE &rarr; DETECT &rarr; OPTIMIZE &rarr; RESPOND &rarr; EXPLAIN &rarr; RECORD
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Every mark-to-market tick or external shock triggers an automated risk scan against policy limits. Upon breach detection, the optimization engine solves for the safest defensive reallocation, generates a structured 5-point explanation, and commits an immutable entry to the decision history.
        </p>
      </div>

      {/* 2. Portfolio Optimization Formulation */}
      <div className="p-6 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <h3>2. Constrained Mean-Variance Optimization (SLSQP)</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The optimizer maximizes risk-adjusted return penalizing portfolio variance and turnover transaction costs using Sequential Least Squares Programming (SciPy SLSQP):
        </p>

        <div className="p-4 rounded-lg bg-obsidian-950 border border-obsidian-800 font-mono text-xs text-slate-200 space-y-2">
          <div className="text-indigo-400 font-bold">Objective Function:</div>
          <div className="pl-4">
            Maximize E(Rp) - &lambda; &middot; &sigma;p&sup2; - TransactionCost(w, w_current)
          </div>
          <div className="text-slate-400 text-[11px] pl-4">
            where &lambda; is the risk-aversion parameter (&lambda; = 6.0 for Conservative, 3.0 for Balanced, 1.2 for Aggressive).
          </div>

          <div className="text-indigo-400 font-bold pt-2">Subject to Constraints:</div>
          <ul className="list-disc list-inside pl-4 text-slate-300 space-y-1">
            <li><strong>Full Investment:</strong> &sum; wi = 1.0</li>
            <li><strong>Asset Bounds:</strong> w_min,i &le; wi &le; w_max,i</li>
            <li><strong>Volatility Ceiling:</strong> &sigma;p &le; MaxVolatility (e.g. 18.0%)</li>
            <li><strong>Liquidity Buffer Floor:</strong> &sum; wi &middot; Li &ge; MinLiquidity (e.g. 20.0%)</li>
            <li><strong>Concentration Cap:</strong> wi &le; MaxConcentration (e.g. 30.0%)</li>
          </ul>
        </div>
      </div>

      {/* 3. Core Financial Formulas */}
      <div className="p-6 rounded-xl bg-obsidian-900 border border-obsidian-800 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <h3>3. Mathematical Financial Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-1.5">
            <span className="text-indigo-400 font-bold block">Expected Portfolio Return (Rp)</span>
            <div className="text-slate-200 text-sm">Rp = &sum; wi &middot; Ri = w&#7488; R</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Weighted average of annualized individual asset class expected returns.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-1.5">
            <span className="text-indigo-400 font-bold block">Portfolio Volatility (&sigma;p)</span>
            <div className="text-slate-200 text-sm">&sigma;p = &radic;(w&#7488; &Sigma; w)</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Covariance-adjusted portfolio risk incorporating cross-asset correlations.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-1.5">
            <span className="text-indigo-400 font-bold block">Sharpe Ratio</span>
            <div className="text-slate-200 text-sm">Sharpe = (Rp - Rf) / &sigma;p</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Risk-adjusted performance above the sovereign risk-free rate (Rf = 6.50%).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-1.5">
            <span className="text-indigo-400 font-bold block">Value at Risk (VaR 95%)</span>
            <div className="text-slate-200 text-sm">VaR_&alpha; = Z_&alpha; &middot; &sigma;p - Rp</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Estimated maximum threshold capital loss at 95% confidence level (Z = 1.645).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-1.5">
            <span className="text-indigo-400 font-bold block">Expected Shortfall (CVaR 95%)</span>
            <div className="text-slate-200 text-sm">ES_&alpha; = [&phi;(Z_&alpha;) / (1 - &alpha;)] &middot; &sigma;p - Rp</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Conditional tail expectation: average magnitude of loss when VaR is breached.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-1.5">
            <span className="text-indigo-400 font-bold block">Concentration (Herfindahl HHI)</span>
            <div className="text-slate-200 text-sm">HHI = &sum; wi&sup2;</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Measures asset concentration (0.166 for equal 6-asset spread, 1.0 for monolithic exposure).
            </p>
          </div>
        </div>
      </div>

      {/* 4. Product Disclaimer */}
      <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-800 text-[11px] text-slate-400 font-mono">
        <strong className="text-slate-300">Regulatory & Institutional Notice:</strong> CapitalGuard is a financial decision-support and simulation platform developed for institutional demonstration purposes. It does not provide personalized investment advice or execute unverified financial transactions.
      </div>
    </div>
  );
};
