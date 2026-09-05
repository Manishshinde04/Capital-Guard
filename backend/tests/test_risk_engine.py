import pytest
from app.services.risk_service import RiskService
from app.models.database import RiskPolicy

def test_risk_status_transitions():
    policy = RiskPolicy(
        max_equity=0.35,
        max_volatility=0.18,
        warning_volatility=0.14,
        warning_var=0.05,
        critical_var=0.08,
        max_concentration=0.30,
        min_liquidity=0.20,
        critical_liquidity=0.15,
        max_drawdown=0.15
    )

    # 1. Normal State
    status, breaches = RiskService.evaluate_risk_status(
        equity_allocation=0.30,
        portfolio_volatility=0.11,
        var_95=0.04,
        max_concentration=0.28,
        liquidity_ratio=0.25,
        max_drawdown=0.05,
        policy=policy
    )
    assert status == "NORMAL"
    assert len(breaches) == 0

    # 2. Warning State (e.g. Equity 42% > 35%)
    status, breaches = RiskService.evaluate_risk_status(
        equity_allocation=0.42,
        portfolio_volatility=0.13,
        var_95=0.045,
        max_concentration=0.42,
        liquidity_ratio=0.25,
        max_drawdown=0.05,
        policy=policy
    )
    assert status in ["WARNING", "CRITICAL"]
    assert any(b["metric"] == "EQUITY_EXPOSURE" for b in breaches)

    # 3. Critical State (Volatility >= 18% or VaR >= 8%)
    status, breaches = RiskService.evaluate_risk_status(
        equity_allocation=0.45,
        portfolio_volatility=0.19,
        var_95=0.085,
        max_concentration=0.45,
        liquidity_ratio=0.18,
        max_drawdown=0.12,
        policy=policy
    )
    assert "CRITICAL" in status or "EMERGENCY" in status

    # 4. Transparent Risk Score
    score = RiskService.calculate_risk_score(0.12, 0.04, 0.25, 0.30, policy)
    assert 0.0 <= score["total_score"] <= 100.0
    assert "volatility_component" in score
    assert "concentration_component" in score
    assert "var_component" in score
    assert "liquidity_deficit_component" in score
