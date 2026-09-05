from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.database import get_db
from app.services.simulation_service import SimulationService
from app.services.control_service import ControlService

router = APIRouter(prefix="/api/simulation", tags=["simulation"])

@router.get("/state")
def get_simulation_state() -> Dict[str, Any]:
    return SimulationService.get_status()

@router.post("/toggle")
def toggle_simulation(running: bool = Query(..., description="True to resume, False to pause")) -> Dict[str, Any]:
    SimulationService.set_running(running)
    return {
        "success": True,
        "is_running": running,
        "message": f"Simulation {'resumed' if running else 'paused'}."
    }

@router.post("/step")
def step_simulation_tick(db: Session = Depends(get_db)) -> Dict[str, Any]:
    result = SimulationService.step_simulation(db)
    return result

@router.post("/reset")
def reset_demo_baseline(db: Session = Depends(get_db)) -> Dict[str, Any]:
    result = ControlService.reset_demo(db)
    return result
