from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db, Asset, Portfolio, Holding, RiskPolicy
from app.schemas.schemas import AssetResponse, PortfolioResponse, HoldingResponse, PortfolioMetricsResponse
from app.services.control_service import ControlService

router = APIRouter(prefix="/api", tags=["portfolio"])

@router.get("/assets", response_model=List[AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    return assets

@router.get("/portfolio", response_model=PortfolioResponse)
def get_portfolio(db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    policy = db.query(RiskPolicy).first()
    metrics = ControlService.get_portfolio_metrics(portfolio, holdings, policy)

    holdings_resp = []
    for h in holdings:
        asset = h.asset
        # Evaluate holding status against limits
        status = "NORMAL"
        reason = None
        if asset.symbol == "EQUITY" and h.allocation > policy.max_equity:
            status = "CRITICAL" if h.allocation >= policy.max_equity + 0.08 else "WARNING"
            reason = f"Equity exposure ({h.allocation*100:.1f}%) exceeds the configured policy limit of {policy.max_equity*100:.1f}%."
        elif h.allocation > policy.max_concentration:
            status = "WARNING"
            reason = f"Allocation ({h.allocation*100:.1f}%) exceeds concentration ceiling of {policy.max_concentration*100:.1f}%."
        elif h.allocation < asset.minimum_allocation:
            status = "WARNING"
            reason = f"Allocation ({h.allocation*100:.1f}%) is below minimum floor of {asset.minimum_allocation*100:.1f}%."

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
            status=status,
            reason=reason
        ))

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

    return PortfolioResponse(
        id=portfolio.id,
        name=portfolio.name,
        total_capital=portfolio.total_capital,
        cash_balance=portfolio.cash_balance,
        risk_profile=portfolio.risk_profile,
        metrics=metrics_resp,
        holdings=holdings_resp
    )

@router.get("/portfolio/metrics", response_model=PortfolioMetricsResponse)
def get_portfolio_metrics_endpoint(db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    policy = db.query(RiskPolicy).first()
    metrics = ControlService.get_portfolio_metrics(portfolio, holdings, policy)
    return PortfolioMetricsResponse(**metrics)
