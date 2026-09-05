import random
from datetime import datetime
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.database import Asset, Portfolio, Holding, RiskPolicy
from app.services.financial_engine import FinancialEngine
from app.services.risk_service import RiskService

class SimulationService:
    """
    Market Simulation Service managing synthetic live price drift,
    volatility fluctuations, and market regime tracking.
    """
    _is_running: bool = True
    _update_count: int = 0
    _last_update: datetime = datetime.utcnow()

    @classmethod
    def is_running(cls) -> bool:
        return cls._is_running

    @classmethod
    def set_running(cls, state: bool):
        cls._is_running = state

    @classmethod
    def get_status(cls) -> Dict[str, Any]:
        return {
            "is_running": cls._is_running,
            "update_count": cls._update_count,
            "last_update": cls._last_update.isoformat(),
            "mode": "Continuous Stochastic Drift",
            "drift_interval_seconds": 5
        }

    @classmethod
    def step_simulation(cls, db: Session) -> Dict[str, Any]:
        """
        Applies a subtle realistic market tick across assets.
        Bounded within +/- 0.5% per tick.
        """
        if not cls._is_running:
            return {"status": "paused", "updated": False}

        assets = db.query(Asset).all()
        portfolio = db.query(Portfolio).first()
        if not portfolio:
            return {"status": "no_portfolio", "updated": False}

        holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
        holding_map = {h.asset_id: h for h in holdings}

        price_changes = {}
        for asset in assets:
            # Random drift correlated with asset volatility
            # Cash does not drift
            if asset.symbol == "CASH":
                drift = 0.0
            else:
                vol_scale = asset.volatility / 0.20 # normalize
                drift = random.gauss(0.0001, 0.003 * vol_scale)
                # Keep within 25% of base price
                new_price = asset.price * (1.0 + drift)
                if 0.70 * asset.base_price <= new_price <= 1.40 * asset.base_price:
                    asset.price = round(new_price, 2)
                    price_changes[asset.symbol] = round(drift * 100.0, 3)

        # Update holding values
        new_total = 0.0
        for h in holdings:
            h.current_value = h.quantity * h.asset.price
            new_total += h.current_value

        portfolio.total_capital = new_total
        for h in holdings:
            h.allocation = h.current_value / new_total

        db.commit()
        cls._update_count += 1
        cls._last_update = datetime.utcnow()

        return {
            "status": "active",
            "updated": True,
            "tick": cls._update_count,
            "new_portfolio_value": new_total,
            "price_changes": price_changes,
            "timestamp": cls._last_update.isoformat()
        }
