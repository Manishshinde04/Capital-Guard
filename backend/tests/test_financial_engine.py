import pytest
import numpy as np
from app.services.financial_engine import FinancialEngine

def test_financial_calculations():
    weights = np.array([0.42, 0.25, 0.12, 0.08, 0.05, 0.08])
    exp_returns = np.array([0.160, 0.072, 0.088, 0.095, 0.105, 0.055])
    volatilities = np.array([0.220, 0.055, 0.090, 0.145, 0.165, 0.010])
    liquidity_scores = np.array([0.92, 0.98, 0.75, 0.88, 0.65, 1.00])

    # 1. Expected Return
    exp_ret = FinancialEngine.calculate_expected_return(weights, exp_returns)
    assert 0.11 <= exp_ret <= 0.14, f"Expected return out of bounds: {exp_ret}"

    # 2. Covariance and Volatility
    cov_matrix = FinancialEngine.calculate_covariance_matrix(volatilities)
    assert cov_matrix.shape == (6, 6)
    assert np.all(np.diag(cov_matrix) > 0)

    port_vol = FinancialEngine.calculate_portfolio_volatility(weights, cov_matrix)
    assert 0.08 <= port_vol <= 0.16, f"Portfolio volatility out of bounds: {port_vol}"

    # 3. Sharpe Ratio
    sharpe = FinancialEngine.calculate_sharpe_ratio(exp_ret, port_vol, risk_free_rate=0.065)
    assert sharpe > 0.0, f"Sharpe ratio should be positive: {sharpe}"

    # 4. VaR and CVaR
    var_95 = FinancialEngine.calculate_var(exp_ret, port_vol, confidence_level=0.95)
    cvar_95 = FinancialEngine.calculate_expected_shortfall(exp_ret, port_vol, confidence_level=0.95)
    assert var_95 > 0.0
    assert cvar_95 >= var_95, "CVaR (Expected Shortfall) must be >= VaR"

    # 5. HHI Concentration
    hhi = FinancialEngine.calculate_concentration_hhi(weights)
    assert 0.15 <= hhi <= 0.35

    # 6. Liquidity Ratio
    liq = FinancialEngine.calculate_liquidity_ratio(weights, liquidity_scores)
    assert 0.80 <= liq <= 1.00
