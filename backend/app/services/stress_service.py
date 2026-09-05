import numpy as np
from typing import Dict, List, Any
from app.services.financial_engine import FinancialEngine, SYMBOL_ORDER
from app.services.risk_service import RiskService
from app.services.optimization_service import OptimizationService
from app.models.database import RiskPolicy

PREDEFINED_SCENARIOS = {
    "Market Crash": {
        "description": "Severe equity market collapse driven by macroeconomic crisis.",
        "shocks": {
            "EQUITY": -0.25,
            "CBOND": -0.10,
            "REIT": -0.15,
            "GOLD": 0.08,
            "GBOND": 0.03,
            "CASH": 0.00
        }
    },
    "Recession": {
        "description": "Protracted economic contraction with corporate earnings decline and credit spread widening.",
        "shocks": {
            "EQUITY": -0.18,
            "CBOND": -0.08,
            "REIT": -0.12,
            "GOLD": 0.05,
            "GBOND": 0.04,
            "CASH": 0.00
        }
    },
    "Interest Rate Shock": {
        "description": "Sudden 200 bps central bank rate hike reducing duration-heavy fixed income and capital assets.",
        "shocks": {
            "GBOND": -0.08,
            "CBOND": -0.12,
            "EQUITY": -0.10,
            "REIT": -0.06,
            "GOLD": 0.02,
            "CASH": 0.00
        }
    },
    "Inflation Shock": {
        "description": "Commodity-driven inflation surge with yield curve spikes and bond sell-off.",
        "shocks": {
            "EQUITY": -0.08,
            "GBOND": -0.10,
            "CBOND": -0.09,
            "GOLD": 0.15,
            "REIT": 0.05,
            "CASH": 0.00
        }
    },
    "Liquidity Crisis": {
        "description": "Severe systemic liquidity freeze, widened credit spreads, and high redemption pressure.",
        "shocks": {
            "EQUITY": -0.14,
            "CBOND": -0.11,
            "REIT": -0.16,
            "GOLD": -0.03,
            "GBOND": 0.01,
            "CASH": 0.00
        }
    }
}

class StressService:
    """
    Stress Testing Engine evaluating systemic shocks, tail-risk events,
    and generating post-shock defensive capital recommendations.
    """

    @staticmethod
    def run_stress_test(
        scenario_name: str,
        shocks: Dict[str, float],
        assets: List[Any],
        holdings: List[Any],
        policy: RiskPolicy
    ) -> Dict:
        asset_map = {a.symbol: a for a in assets}
        holding_map = {h.asset.symbol: h for h in holdings}

        # Baseline metrics
        total_value_before = sum(h.current_value for h in holdings)
        symbols = [h.asset.symbol for h in holdings]
        weights_before = np.array([h.current_value / total_value_before for h in holdings])
        exp_returns = np.array([h.asset.expected_return for h in holdings])
        volatilities = np.array([h.asset.volatility for h in holdings])
        liquidity_scores = np.array([h.asset.liquidity_score for h in holdings])

        cov_matrix = FinancialEngine.calculate_covariance_matrix(volatilities)
        risk_before = FinancialEngine.calculate_portfolio_volatility(weights_before, cov_matrix)
        ret_before = FinancialEngine.calculate_expected_return(weights_before, exp_returns)
        var_before = FinancialEngine.calculate_var(ret_before, risk_before, 0.95)
        liq_before = FinancialEngine.calculate_liquidity_ratio(weights_before, liquidity_scores)

        # Apply Shocks
        asset_impacts = []
        new_values = []
        for h in holdings:
            sym = h.asset.symbol
            shock = shocks.get(sym, 0.0)
            val_before = h.current_value
            val_after = val_before * (1.0 + shock)
            val_loss = val_before - val_after
            new_values.append(val_after)
            asset_impacts.append({
                "symbol": sym,
                "name": h.asset.name,
                "asset_class": h.asset.asset_class,
                "shock_pct": shock,
                "value_before": val_before,
                "value_after": val_after,
                "value_loss": val_loss,
                "weight_before": h.allocation,
                "weight_after": 0.0 # Will compute once total is known
            })

        total_value_after = sum(new_values)
        capital_loss = total_value_before - total_value_after
        percentage_loss = (capital_loss / total_value_before) * 100.0

        # Post shock weights
        weights_after = np.array([v / total_value_after for v in new_values])
        for i, impact in enumerate(asset_impacts):
            impact["weight_after"] = float(weights_after[i])

        # Recalculate post-shock risk metrics
        # Post-shock volatility usually spikes due to stress; let's model stress volatility scaling
        shock_severity = max(0.0, -percentage_loss / 100.0)
        stress_vol_multiplier = 1.0 + (shock_severity * 0.5) # e.g. 10% loss increases vol by ~5%
        stressed_volatilities = volatilities * stress_vol_multiplier
        stressed_cov = FinancialEngine.calculate_covariance_matrix(stressed_volatilities)

        risk_after = FinancialEngine.calculate_portfolio_volatility(weights_after, stressed_cov)
        ret_after = FinancialEngine.calculate_expected_return(weights_after, exp_returns)
        var_after = FinancialEngine.calculate_var(ret_after, risk_after, 0.95)
        liq_after = FinancialEngine.calculate_liquidity_ratio(weights_after, liquidity_scores)

        # Status evaluation
        status_before, _ = RiskService.evaluate_risk_status(
            weights_before[symbols.index("EQUITY")] if "EQUITY" in symbols else 0.0,
            risk_before, var_before, float(np.max(weights_before)), liq_before, 0.05, policy
        )
        status_after, breaches = RiskService.evaluate_risk_status(
            weights_after[symbols.index("EQUITY")] if "EQUITY" in symbols else 0.0,
            risk_after, var_after, float(np.max(weights_after)), liq_after, 0.05 + (percentage_loss / 100.0), policy
        )

        # Sort asset impacts by loss amount descending
        sorted_impacts = sorted(asset_impacts, key=lambda x: x["value_loss"], reverse=True)
        most_affected = [f"{item['symbol']} ({item['shock_pct']*100:+.1f}%, ₹{item['value_loss']/1e5:.1f}L)" for item in sorted_impacts if item['value_loss'] > 0]

        # Generate recommended defensive allocation
        opt_res = OptimizationService.optimize(
            current_weights=weights_after,
            expected_returns=exp_returns,
            volatilities=stressed_volatilities,
            liquidity_scores=liquidity_scores,
            asset_symbols=symbols,
            risk_profile="Conservative" if "CRITICAL" in status_after or "EMERGENCY" in status_after else "Balanced",
            portfolio_value=total_value_after,
            user_constraints={"max_volatility": policy.max_volatility, "min_liquidity": policy.min_liquidity}
        )

        rec_allocations = {symbols[i]: float(opt_res["weights"][i]) for i in range(len(symbols))}

        rec_response = (
            f"Under the {scenario_name} scenario, portfolio capital contracts by ₹{capital_loss/1e7:.2f} Cr ({percentage_loss:.2f}%). "
            f"Annualized risk escalates from {risk_before*100:.2f}% to {risk_after*100:.2f}%, shifting risk status from {status_before} to {status_after}. "
            f"Recommended Action: Execute defensive reallocation towards sovereign bonds and liquidity buffers to restore portfolio risk below {policy.max_volatility*100:.1f}%."
        )

        return {
            "scenario_name": scenario_name,
            "portfolio_value_before": total_value_before,
            "portfolio_value_after": total_value_after,
            "capital_loss": capital_loss,
            "percentage_loss": percentage_loss,
            "risk_before": risk_before,
            "risk_after": risk_after,
            "var_95_before": var_before,
            "var_95_after": var_after,
            "liquidity_before": liq_before,
            "liquidity_after": liq_after,
            "status_before": status_before,
            "status_after": status_after,
            "asset_impacts": asset_impacts,
            "most_affected_assets": most_affected[:4],
            "recommended_response": rec_response,
            "recommended_allocations": rec_allocations
        }
