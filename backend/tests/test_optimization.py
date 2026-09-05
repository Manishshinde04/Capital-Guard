import pytest
import numpy as np
from app.services.optimization_service import OptimizationService

def test_optimization_weights_and_constraints():
    current_weights = np.array([0.42, 0.25, 0.12, 0.08, 0.05, 0.08])
    exp_returns = np.array([0.160, 0.072, 0.088, 0.095, 0.105, 0.055])
    volatilities = np.array([0.220, 0.055, 0.090, 0.145, 0.165, 0.010])
    liquidity_scores = np.array([0.92, 0.98, 0.75, 0.88, 0.65, 1.00])
    symbols = ["EQUITY", "GBOND", "CBOND", "GOLD", "REIT", "CASH"]

    for profile in ["Conservative", "Balanced", "Aggressive"]:
        result = OptimizationService.optimize(
            current_weights=current_weights,
            expected_returns=exp_returns,
            volatilities=volatilities,
            liquidity_scores=liquidity_scores,
            asset_symbols=symbols,
            risk_profile=profile,
            portfolio_value=100000000.0
        )

        assert result["success"] is True
        weights = result["weights"]

        # 1. Total must equal 100% (within tolerance)
        assert np.isclose(np.sum(weights), 1.0, atol=1e-4), f"Weights sum to {np.sum(weights)}"

        # 2. All weights non-negative
        assert np.all(weights >= 0.0)

        # 3. Transaction cost must be positive when weights change
        assert result["estimated_transaction_cost"] >= 0.0

        # 4. Metrics exist
        assert "expected_return" in result["recommended_metrics"]
        assert "portfolio_risk" in result["recommended_metrics"]
        assert "sharpe_ratio" in result["recommended_metrics"]

    # In Conservative, equity weight must be significantly lower than in Aggressive
    cons_res = OptimizationService.optimize(
        current_weights=current_weights,
        expected_returns=exp_returns,
        volatilities=volatilities,
        liquidity_scores=liquidity_scores,
        asset_symbols=symbols,
        risk_profile="Conservative",
        portfolio_value=100000000.0
    )
    aggr_res = OptimizationService.optimize(
        current_weights=current_weights,
        expected_returns=exp_returns,
        volatilities=volatilities,
        liquidity_scores=liquidity_scores,
        asset_symbols=symbols,
        risk_profile="Aggressive",
        portfolio_value=100000000.0
    )
    assert cons_res["weights"][0] <= aggr_res["weights"][0]
    assert cons_res["recommended_metrics"]["portfolio_risk"] <= aggr_res["recommended_metrics"]["portfolio_risk"]
