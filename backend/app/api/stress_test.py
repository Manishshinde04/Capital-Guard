from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.database import get_db, Portfolio, Holding, Asset, RiskPolicy
from app.schemas.schemas import StressTestScenarioRequest, StressTestResultResponse, MarketShockTriggerResponse
from app.services.stress_service import StressService, PREDEFINED_SCENARIOS
from app.services.control_service import ControlService

router = APIRouter(prefix="/api", tags=["stress-test"])

@router.get("/stress-test/scenarios")
def get_predefined_scenarios() -> Dict[str, Any]:
    return PREDEFINED_SCENARIOS

@router.post("/stress-test", response_model=StressTestResultResponse)
def run_stress_test_endpoint(req: StressTestScenarioRequest, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    assets = db.query(Asset).all()
    policy = db.query(RiskPolicy).first()

    # Determine shocks
    if req.scenario_name in PREDEFINED_SCENARIOS and not req.shocks:
        shocks = PREDEFINED_SCENARIOS[req.scenario_name]["shocks"]
    else:
        shocks = req.shocks

    result = StressService.run_stress_test(
        scenario_name=req.scenario_name,
        shocks=shocks,
        assets=assets,
        holdings=holdings,
        policy=policy
    )
    return result

@router.post("/market-shock", response_model=MarketShockTriggerResponse)
def trigger_market_crash_demo(db: Session = Depends(get_db)):
    """
    ⚡ Primary Hackathon Demo Trigger:
    Simulates a severe market crash, recalculates prices and portfolio risk,
    generates critical alerts, switches status to CRITICAL, triggers the
    optimization engine, generates 5-point explanation, and records decision.
    """
    result = ControlService.execute_market_crash(db)
    return result
