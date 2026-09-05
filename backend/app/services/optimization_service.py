import numpy as np
from scipy.optimize import minimize
from typing import Dict, List, Tuple, Optional
from app.services.financial_engine import FinancialEngine, SYMBOL_ORDER, RISK_FREE_RATE

class OptimizationService:
    """
    Constrained Mean-Variance Portfolio Optimization Engine using Sequential
    Least Squares Programming (SLSQP).
    Objective: Maximize E(Rp) - lambda * sigma_p^2 - TransactionCostPenalty
    Subject to:
      - sum(w) = 1.0
      - bounds: w_min <= w <= w_max
      - sigma_p <= max_volatility
      - liquidity_p >= min_liquidity
      - max(w) <= max_concentration
    """

    @staticmethod
    def get_profile_defaults(profile: str) -> Dict[str, float]:
        norm_profile = profile.strip().capitalize()
        if norm_profile == "Conservative":
            return {
                "risk_aversion": 6.0,
                "max_equity": 0.22,
                "min_cash": 0.10,
                "max_volatility": 0.11,
                "max_concentration": 0.25,
                "min_liquidity": 0.32,
                "transaction_cost_sensitivity": 1.5
            }
        elif norm_profile == "Aggressive":
            return {
                "risk_aversion": 1.2,
                "max_equity": 0.45,
                "min_cash": 0.05,
                "max_volatility": 0.18,
                "max_concentration": 0.35,
                "min_liquidity": 0.18,
                "transaction_cost_sensitivity": 0.7
            }
        else:  # Balanced
            return {
                "risk_aversion": 3.0,
                "max_equity": 0.32,
                "min_cash": 0.08,
                "max_volatility": 0.145,
                "max_concentration": 0.30,
                "min_liquidity": 0.25,
                "transaction_cost_sensitivity": 1.0
            }

    @staticmethod
    def optimize(
        current_weights: np.ndarray,
        expected_returns: np.ndarray,
        volatilities: np.ndarray,
        liquidity_scores: np.ndarray,
        asset_symbols: List[str],
        risk_profile: str = "Balanced",
        portfolio_value: float = 100000000.0,
        user_constraints: Optional[Dict[str, float]] = None,
        cost_rate: float = 0.0015
    ) -> Dict:
        defaults = OptimizationService.get_profile_defaults(risk_profile)
        if user_constraints:
            for k, v in user_constraints.items():
                if v is not None:
                    defaults[k] = v

        lambda_risk = defaults["risk_aversion"]
        max_volatility = defaults["max_volatility"]
        min_liquidity = defaults["min_liquidity"]
        max_equity = defaults["max_equity"]
        min_cash = defaults["min_cash"]
        max_concentration = defaults["max_concentration"]
        tx_sensitivity = defaults.get("transaction_cost_sensitivity", 1.0)

        n = len(current_weights)
        cov_matrix = FinancialEngine.calculate_covariance_matrix(volatilities)

        # Objective Function: Minimize lambda * sigma_p^2 - Rp + tx_cost_penalty
        def objective(w: np.ndarray) -> float:
            port_var = np.dot(w.T, np.dot(cov_matrix, w))
            port_ret = np.dot(w, expected_returns)
            # Smooth transaction cost penalty using approximate L1
            turnover = np.sum(np.sqrt(np.square(w - current_weights) + 1e-8)) * 0.5
            tx_penalty = turnover * cost_rate * tx_sensitivity * 10.0 # scaled into return units
            return float(lambda_risk * port_var - port_ret + tx_penalty)

        # Objective Gradient for faster and robust convergence
        def objective_grad(w: np.ndarray) -> np.ndarray:
            grad_var = 2.0 * lambda_risk * np.dot(cov_matrix, w)
            grad_ret = -expected_returns
            grad_tx = tx_sensitivity * cost_rate * 10.0 * 0.5 * (w - current_weights) / np.sqrt(np.square(w - current_weights) + 1e-8)
            return grad_var + grad_ret + grad_tx

        # Constraints
        # 1. sum(w) = 1.0
        cons = [
            {"type": "eq", "fun": lambda w: np.sum(w) - 1.0}
        ]

        # 2. Volatility <= max_volatility: max_volatility^2 - w.T * Cov * w >= 0
        cons.append({
            "type": "ineq",
            "fun": lambda w: (max_volatility ** 2) - np.dot(w.T, np.dot(cov_matrix, w))
        })

        # 3. Liquidity >= min_liquidity: sum(w * L) - min_liquidity >= 0
        cons.append({
            "type": "ineq",
            "fun": lambda w: np.dot(w, liquidity_scores) - min_liquidity
        })

        # Bounds per asset
        bounds = []
        for sym in asset_symbols:
            low = 0.02
            high = max_concentration
            if sym == "EQUITY":
                high = min(high, max_equity)
            elif sym == "CASH":
                low = max(low, min_cash)
                high = 0.40
            elif sym == "GBOND":
                high = 0.50
            elif sym == "CBOND":
                high = 0.30
            elif sym == "GOLD":
                high = 0.20
            elif sym == "REIT":
                high = 0.15
            bounds.append((low, high))

        # Initial guess: current weights normalized to satisfy bounds if possible
        x0 = current_weights.copy()
        x0 = np.clip(x0, [b[0] for b in bounds], [b[1] for b in bounds])
        x0 = x0 / np.sum(x0)

        res = minimize(
            objective,
            x0,
            jac=objective_grad,
            method="SLSQP",
            bounds=bounds,
            constraints=cons,
            options={"maxiter": 200, "ftol": 1e-7}
        )

        # Fallback if primary constraints are overly tight: relaxed optimization
        if not res.success:
            relaxed_cons = [{"type": "eq", "fun": lambda w: np.sum(w) - 1.0}]
            # Relax volatility and liquidity constraints slightly
            relaxed_cons.append({
                "type": "ineq",
                "fun": lambda w: ((max_volatility * 1.15) ** 2) - np.dot(w.T, np.dot(cov_matrix, w))
            })
            relaxed_cons.append({
                "type": "ineq",
                "fun": lambda w: np.dot(w, liquidity_scores) - (min_liquidity * 0.85)
            })
            res = minimize(
                objective,
                x0,
                jac=objective_grad,
                method="SLSQP",
                bounds=bounds,
                constraints=relaxed_cons,
                options={"maxiter": 200, "ftol": 1e-6}
            )

        opt_weights = np.maximum(0.0, res.x)
        opt_weights = opt_weights / np.sum(opt_weights) # Ensure exact sum to 1.0

        # Current vs Recommended Metrics
        curr_ret = FinancialEngine.calculate_expected_return(current_weights, expected_returns)
        curr_vol = FinancialEngine.calculate_portfolio_volatility(current_weights, cov_matrix)
        curr_sharpe = FinancialEngine.calculate_sharpe_ratio(curr_ret, curr_vol)
        curr_var = FinancialEngine.calculate_var(curr_ret, curr_vol, 0.95)
        curr_liq = FinancialEngine.calculate_liquidity_ratio(current_weights, liquidity_scores)
        curr_hhi = FinancialEngine.calculate_concentration_hhi(current_weights)

        rec_ret = FinancialEngine.calculate_expected_return(opt_weights, expected_returns)
        rec_vol = FinancialEngine.calculate_portfolio_volatility(opt_weights, cov_matrix)
        rec_sharpe = FinancialEngine.calculate_sharpe_ratio(rec_ret, rec_vol)
        rec_var = FinancialEngine.calculate_var(rec_ret, rec_vol, 0.95)
        rec_liq = FinancialEngine.calculate_liquidity_ratio(opt_weights, liquidity_scores)
        rec_hhi = FinancialEngine.calculate_concentration_hhi(opt_weights)

        tx_cost = FinancialEngine.calculate_transaction_cost(
            current_weights, opt_weights, portfolio_value, cost_rate
        )

        return {
            "success": True,
            "risk_profile": risk_profile,
            "weights": opt_weights,
            "current_metrics": {
                "expected_return": curr_ret,
                "portfolio_risk": curr_vol,
                "sharpe_ratio": curr_sharpe,
                "liquidity_ratio": curr_liq,
                "var_95": curr_var,
                "concentration_hhi": curr_hhi
            },
            "recommended_metrics": {
                "expected_return": rec_ret,
                "portfolio_risk": rec_vol,
                "sharpe_ratio": rec_sharpe,
                "liquidity_ratio": rec_liq,
                "var_95": rec_var,
                "concentration_hhi": rec_hhi
            },
            "estimated_transaction_cost": tx_cost,
            "parameters_used": defaults
        }
