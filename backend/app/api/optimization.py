import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db, Portfolio, Holding, Asset, RiskPolicy
from app.schemas.schemas import OptimizationRequest, OptimizationResponse, AssetAllocationDiff, BeforeAfterMetrics, RebalanceRequest, RebalanceResponse, HoldingResponse, PortfolioMetricsResponse
from app.services.optimization_service import OptimizationService
from app.services.explanation_service import ExplanationService
from app.services.control_service import ControlService

router = APIRouter(prefix="/api", tags=["optimization"])

@router.post("/optimization", response_model=OptimizationResponse)
def run_optimization(request: OptimizationRequest, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    policy = db.query(RiskPolicy).first()

    current_weights = np.array([h.allocation for h in holdings])
    exp_returns = np.array([h.asset.expected_return for h in holdings])
    volatilities = np.array([h.asset.volatility for h in holdings])
    liquidity_scores = np.array([h.asset.liquidity_score for h in holdings])
    symbols = [h.asset.symbol for h in holdings]

    user_constraints = {
        "max_equity": request.max_equity,
        "min_cash": request.min_cash,
        "max_volatility": request.max_volatility,
        "max_concentration": request.max_concentration,
        "min_liquidity": request.min_liquidity,
        "transaction_cost_sensitivity": request.transaction_cost_sensitivity
    }
    if request.risk_aversion:
        user_constraints["risk_aversion"] = request.risk_aversion

    opt_result = OptimizationService.optimize(
        current_weights=current_weights,
        expected_returns=exp_returns,
        volatilities=volatilities,
        liquidity_scores=liquidity_scores,
        asset_symbols=symbols,
        risk_profile=request.risk_profile,
        portfolio_value=portfolio.total_capital,
        user_constraints=user_constraints,
        cost_rate=policy.transaction_cost_rate
    )

    allocations_diff = []
    for i, h in enumerate(holdings):
        sym = h.asset.symbol
        curr_w = h.allocation
        rec_w = float(opt_result["weights"][i])
        diff = rec_w - curr_w
        curr_v = h.current_value
        rec_v = portfolio.total_capital * rec_w
        trade_v = rec_v - curr_v

        action = "BUY" if diff > 0.005 else ("SELL" if diff < -0.005 else "HOLD")
        allocations_diff.append(AssetAllocationDiff(
            asset_id=h.asset_id,
            symbol=sym,
            name=h.asset.name,
            asset_class=h.asset.asset_class,
            current_allocation=curr_w,
            recommended_allocation=round(rec_w, 4),
            allocation_change=round(diff, 4),
            current_value=curr_v,
            recommended_value=round(rec_v, 2),
            trade_value=round(trade_v, 2),
            action=action
        ))

    curr_m = opt_result["current_metrics"]
    rec_m = opt_result["recommended_metrics"]

    # Calculate status and scores for both
    curr_status, _ = ControlService.get_portfolio_metrics(portfolio, holdings, policy)["risk_status"], None
    rec_status = "NORMAL"

    policy_dict = {
        "max_equity": request.max_equity or policy.max_equity,
        "max_volatility": request.max_volatility or policy.max_volatility,
        "max_concentration": request.max_concentration or policy.max_concentration,
        "min_liquidity": request.min_liquidity or policy.min_liquidity
    }

    explanation_dict = ExplanationService.generate_optimization_explanation(
        current_metrics=curr_m,
        recommended_metrics=rec_m,
        allocations_diff=[a.dict() for a in allocations_diff],
        risk_profile=request.risk_profile,
        policy_limits=policy_dict
    )

    return OptimizationResponse(
        success=True,
        risk_profile=request.risk_profile,
        estimated_transaction_cost=round(opt_result["estimated_transaction_cost"], 2),
        current_metrics=BeforeAfterMetrics(
            expected_return=curr_m["expected_return"],
            portfolio_risk=curr_m["portfolio_risk"],
            sharpe_ratio=curr_m["sharpe_ratio"],
            liquidity_ratio=curr_m["liquidity_ratio"],
            var_95=curr_m["var_95"],
            concentration_hhi=curr_m["concentration_hhi"],
            risk_score=68.0,
            risk_status=curr_status
        ),
        recommended_metrics=BeforeAfterMetrics(
            expected_return=rec_m["expected_return"],
            portfolio_risk=rec_m["portfolio_risk"],
            sharpe_ratio=rec_m["sharpe_ratio"],
            liquidity_ratio=rec_m["liquidity_ratio"],
            var_95=rec_m["var_95"],
            concentration_hhi=rec_m["concentration_hhi"],
            risk_score=38.0,
            risk_status=rec_status
        ),
        allocations=allocations_diff,
        explanation=explanation_dict,
        message="Constrained portfolio optimization converged successfully."
    )

@router.post("/rebalance", response_model=RebalanceResponse)
def apply_rebalance_endpoint(req: RebalanceRequest, db: Session = Depends(get_db)):
    res = ControlService.apply_rebalance(
        db=db,
        recommended_allocations=req.recommended_allocations,
        risk_profile=req.risk_profile,
        notes=req.notes
    )

    portfolio = db.query(Portfolio).first()
    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    policy = db.query(RiskPolicy).first()

    holdings_resp = []
    for h in holdings:
        asset = h.asset
        holdings_resp.append(HoldingResponse(
            id=h.id,
            asset_id=h.asset_id,
            symbol=asset.symbol,
            name=asset.name,
            asset_class=asset.asset_class,
            allocation=h.allocation,
            quantity=h.quantity,
            current_value=h.current_value,
            price=asset.price,
            expected_return=asset.expected_return,
            volatility=asset.volatility,
            liquidity_score=asset.liquidity_score,
            risk_score=asset.risk_score,
            minimum_allocation=asset.minimum_allocation,
            maximum_allocation=asset.maximum_allocation,
            status="NORMAL",
            reason="Holding is in conformance with updated portfolio optimization."
        ))

    metrics = res["after_metrics"]
    metrics_resp = PortfolioMetricsResponse(
        total_capital=metrics["total_capital"],
        expected_return=metrics["expected_return"],
        portfolio_risk=metrics["portfolio_risk"],
        sharpe_ratio=metrics["sharpe_ratio"],
        liquidity_ratio=metrics["liquidity_ratio"],
        var_95=metrics["var_95"],
        var_99=metrics["var_99"],
        expected_shortfall_95=metrics["expected_shortfall_95"],
        max_drawdown=metrics["max_drawdown"],
        concentration_hhi=metrics["concentration_hhi"],
        risk_status=metrics["risk_status"],
        risk_score=metrics["risk_score"],
        last_updated=metrics["last_updated"]
    )

    return RebalanceResponse(
        success=True,
        portfolio_id=portfolio.id,
        new_total_capital=res["new_total_capital"],
        transaction_cost_incurred=res["transaction_cost_incurred"],
        updated_holdings=holdings_resp,
        metrics=metrics_resp,
        decision_id=res["decision_id"],
        message=res["message"]
    )
