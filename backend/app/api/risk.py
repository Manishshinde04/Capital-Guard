import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.database import get_db, Portfolio, Holding, Asset, RiskPolicy
from app.schemas.schemas import RiskPolicyResponse, RiskPolicyUpdate, RiskScoreBreakdown, RiskHeatmapRow
from app.services.control_service import ControlService
from app.services.risk_service import RiskService

router = APIRouter(prefix="/api", tags=["risk"])

@router.get("/risk")
def get_risk_analysis(db: Session = Depends(get_db)) -> Dict[str, Any]:
    portfolio = db.query(Portfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    policy = db.query(RiskPolicy).first()
    metrics = ControlService.get_portfolio_metrics(portfolio, holdings, policy)

    weights = np.array([h.allocation for h in holdings])
    score_breakdown = RiskService.calculate_risk_score(
        volatility=metrics["portfolio_risk"],
        var_95=metrics["var_95"],
        concentration_max=float(np.max(weights)),
        liquidity=metrics["liquidity_ratio"],
        policy=policy
    )

    return {
        "metrics": metrics,
        "score_breakdown": score_breakdown,
        "policy": {
            "max_equity": policy.max_equity,
            "max_volatility": policy.max_volatility,
            "warning_volatility": policy.warning_volatility,
            "warning_var": policy.warning_var,
            "critical_var": policy.critical_var,
            "max_concentration": policy.max_concentration,
            "min_liquidity": policy.min_liquidity,
            "critical_liquidity": policy.critical_liquidity,
            "max_drawdown": policy.max_drawdown
        }
    }

@router.get("/risk/heatmap", response_model=List[RiskHeatmapRow])
def get_risk_heatmap(db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    policy = db.query(RiskPolicy).first()

    rows = []
    for h in holdings:
        a = h.asset
        # Volatility level
        if a.volatility >= 0.20:
            vol_lvl = "Extreme" if a.volatility >= 0.25 else "High"
        elif a.volatility >= 0.12:
            vol_lvl = "Medium"
        elif a.volatility >= 0.05:
            vol_lvl = "Moderate"
        else:
            vol_lvl = "Very Low"

        # Concentration level
        if h.allocation > policy.max_equity and a.symbol == "EQUITY":
            conc_lvl = "Critical"
        elif h.allocation > policy.max_concentration:
            conc_lvl = "High"
        elif h.allocation >= 0.15:
            conc_lvl = "Moderate"
        else:
            conc_lvl = "Low"

        # Liquidity level
        if a.liquidity_score >= 0.95:
            liq_lvl = "Very High"
        elif a.liquidity_score >= 0.80:
            liq_lvl = "High"
        elif a.liquidity_score >= 0.60:
            liq_lvl = "Moderate"
        else:
            liq_lvl = "Illiquid"

        # Sensitivity / Profile
        if a.symbol in ["EQUITY", "REIT"]:
            sens = "High Beta"
        elif a.symbol in ["CBOND"]:
            sens = "Moderate Credit"
        elif a.symbol in ["GBOND"]:
            sens = "Defensive Duration"
        elif a.symbol in ["GOLD"]:
            sens = "Safe-Haven Hedge"
        else:
            sens = "Zero Beta Cash"

        rows.append(RiskHeatmapRow(
            asset_id=a.id,
            symbol=a.symbol,
            name=a.name,
            asset_class=a.asset_class,
            allocation=h.allocation,
            volatility_level=vol_lvl,
            concentration_level=conc_lvl,
            liquidity_level=liq_lvl,
            market_sensitivity=sens,
            risk_score=a.risk_score
        ))

    return rows

@router.get("/risk-policy", response_model=RiskPolicyResponse)
def get_risk_policy(db: Session = Depends(get_db)):
    policy = db.query(RiskPolicy).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Risk policy not found")
    return policy

@router.put("/risk-policy", response_model=RiskPolicyResponse)
def update_risk_policy(update: RiskPolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(RiskPolicy).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Risk policy not found")

    for field, val in update.dict(exclude_unset=True).items():
        if val is not None:
            setattr(policy, field, val)

    db.commit()
    db.refresh(policy)
    return policy
