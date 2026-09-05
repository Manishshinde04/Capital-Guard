from typing import Dict, List, Tuple
from app.models.database import RiskPolicy

class RiskService:
    """
    Centralized Institutional Risk Control Service.
    Evaluates portfolio metrics against formal institutional policy limits.
    Classifies portfolio risk state: NORMAL, WARNING, CRITICAL, EMERGENCY RISK MODE.
    """

    @staticmethod
    def calculate_risk_score(
        volatility: float,
        var_95: float,
        concentration_max: float,
        liquidity: float,
        policy: RiskPolicy
    ) -> Dict:
        # 1. Volatility Component (0 to 30 points)
        # Normal <= 0.12 (10 pts), Warning 0.14 (20 pts), Critical >= 0.18 (30 pts)
        vol_ratio = min(1.5, volatility / max(1e-4, policy.warning_volatility))
        vol_score = min(30.0, vol_ratio * 20.0)

        # 2. VaR Component (0 to 25 points)
        # Warning 0.05 (15 pts), Critical >= 0.08 (25 pts)
        var_ratio = min(1.6, var_95 / max(1e-4, policy.warning_var))
        var_score = min(25.0, var_ratio * 15.0)

        # 3. Concentration Component (0 to 25 points)
        # Warning at 0.30 (15 pts), Critical at 0.40 (25 pts)
        conc_ratio = min(1.6, concentration_max / max(1e-4, policy.max_concentration))
        conc_score = min(25.0, conc_ratio * 16.0)

        # 4. Liquidity Deficit Component (0 to 20 points)
        # Safe >= min_liquidity (0 pts). Deficit increases score.
        if liquidity >= policy.min_liquidity:
            liq_score = max(0.0, 5.0 * (1.0 - liquidity))
        else:
            deficit = policy.min_liquidity - liquidity
            liq_score = min(20.0, 8.0 + (deficit / 0.10) * 12.0)

        total_score = round(min(100.0, vol_score + var_score + conc_score + liq_score), 1)

        if total_score >= 80.0:
            status = "CRITICAL"
        elif total_score >= 60.0:
            status = "WARNING"
        else:
            status = "NORMAL"

        return {
            "total_score": total_score,
            "status": status,
            "volatility_component": round(vol_score, 1),
            "var_component": round(var_score, 1),
            "concentration_component": round(conc_score, 1),
            "liquidity_deficit_component": round(liq_score, 1),
            "summary": f"Risk Score is {total_score}/100 ({status}). Volatility contributes {vol_score:.1f}pts, Concentration {conc_score:.1f}pts, VaR {var_score:.1f}pts, Liquidity {liq_score:.1f}pts."
        }

    @staticmethod
    def evaluate_risk_status(
        equity_allocation: float,
        portfolio_volatility: float,
        var_95: float,
        max_concentration: float,
        liquidity_ratio: float,
        max_drawdown: float,
        policy: RiskPolicy
    ) -> Tuple[str, List[Dict]]:
        """
        Evaluates portfolio status against policy thresholds.
        Returns:
          status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EMERGENCY RISK MODE'
          breaches: List of detected breach records
        """
        breaches = []
        critical_count = 0
        warning_count = 0

        # Equity concentration check
        if equity_allocation > policy.max_equity:
            is_crit = equity_allocation >= (policy.max_equity + 0.08)
            severity = "CRITICAL" if is_crit else "WARNING"
            if is_crit:
                critical_count += 1
            else:
                warning_count += 1
            breaches.append({
                "severity": severity,
                "metric": "EQUITY_EXPOSURE",
                "current_value": round(equity_allocation, 4),
                "threshold": round(policy.max_equity, 4),
                "message": f"Equity exposure ({equity_allocation*100:.1f}%) exceeds policy limit ({policy.max_equity*100:.1f}%)",
                "recommendation": "Reduce equity allocation and rotate proceeds into sovereign bonds or liquid cash."
            })

        # Portfolio Volatility check
        if portfolio_volatility >= policy.max_volatility:
            critical_count += 1
            breaches.append({
                "severity": "CRITICAL",
                "metric": "PORTFOLIO_VOLATILITY",
                "current_value": round(portfolio_volatility, 4),
                "threshold": round(policy.max_volatility, 4),
                "message": f"Annualized volatility ({portfolio_volatility*100:.2f}%) exceeds critical limit ({policy.max_volatility*100:.2f}%)",
                "recommendation": "Execute risk-dampening optimization to bring volatility below 14.50%."
            })
        elif portfolio_volatility >= policy.warning_volatility:
            warning_count += 1
            breaches.append({
                "severity": "WARNING",
                "metric": "PORTFOLIO_VOLATILITY",
                "current_value": round(portfolio_volatility, 4),
                "threshold": round(policy.warning_volatility, 4),
                "message": f"Annualized volatility ({portfolio_volatility*100:.2f}%) exceeds warning threshold ({policy.warning_volatility*100:.2f}%)",
                "recommendation": "Monitor market movements closely; evaluate defensive hedging."
            })

        # Value at Risk (VaR 95%) check
        if var_95 >= policy.critical_var:
            critical_count += 1
            breaches.append({
                "severity": "CRITICAL",
                "metric": "VALUE_AT_RISK",
                "current_value": round(var_95, 4),
                "threshold": round(policy.critical_var, 4),
                "message": f"Estimated 95% 1Y VaR ({var_95*100:.2f}%) exceeds critical ceiling ({policy.critical_var*100:.2f}%)",
                "recommendation": "Immediate reduction of high-beta assets to curtail maximum tail risk exposure."
            })
        elif var_95 >= policy.warning_var:
            warning_count += 1
            breaches.append({
                "severity": "WARNING",
                "metric": "VALUE_AT_RISK",
                "current_value": round(var_95, 4),
                "threshold": round(policy.warning_var, 4),
                "message": f"Estimated 95% 1Y VaR ({var_95*100:.2f}%) exceeds warning threshold ({policy.warning_var*100:.2f}%)",
                "recommendation": "Increase defensive cash buffers to buffer potential tail events."
            })

        # Single Asset Max Concentration check
        if max_concentration > policy.max_concentration:
            if max_concentration >= (policy.max_concentration + 0.10):
                critical_count += 1
                sev = "CRITICAL"
            else:
                warning_count += 1
                sev = "WARNING"
            breaches.append({
                "severity": sev,
                "metric": "CONCENTRATION_RISK",
                "current_value": round(max_concentration, 4),
                "threshold": round(policy.max_concentration, 4),
                "message": f"Single asset concentration ({max_concentration*100:.1f}%) exceeds policy threshold ({policy.max_concentration*100:.1f}%)",
                "recommendation": "Rebalance holdings to prevent idiosyncratic asset shock vulnerability."
            })

        # Liquidity Ratio check
        if liquidity_ratio < policy.critical_liquidity:
            critical_count += 1
            breaches.append({
                "severity": "CRITICAL",
                "metric": "LIQUIDITY_BUFFER",
                "current_value": round(liquidity_ratio, 4),
                "threshold": round(policy.critical_liquidity, 4),
                "message": f"Liquidity buffer ({liquidity_ratio*100:.1f}%) is below emergency floor ({policy.critical_liquidity*100:.1f}%)",
                "recommendation": "Mandatory liquidation into cash or sovereign treasury bills."
            })
        elif liquidity_ratio < policy.min_liquidity:
            warning_count += 1
            breaches.append({
                "severity": "WARNING",
                "metric": "LIQUIDITY_BUFFER",
                "current_value": round(liquidity_ratio, 4),
                "threshold": round(policy.min_liquidity, 4),
                "message": f"Liquidity buffer ({liquidity_ratio*100:.1f}%) is below minimum requirement ({policy.min_liquidity*100:.1f}%)",
                "recommendation": "Increase allocation to high-quality liquid assets."
            })

        # Determine aggregate status
        if critical_count >= 2:
            status = "EMERGENCY RISK MODE"
        elif critical_count == 1:
            status = "CRITICAL"
        elif warning_count > 0:
            status = "WARNING"
        else:
            status = "NORMAL"

        return status, breaches
