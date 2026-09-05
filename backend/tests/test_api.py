import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import init_database

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_database()

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "Connected"
    assert data["risk_engine"] == "Active"

def test_get_portfolio():
    res = client.get("/api/portfolio")
    assert res.status_code == 200
    data = res.json()
    assert "total_capital" in data
    assert len(data["holdings"]) == 6
    assert data["metrics"]["total_capital"] > 0

def test_optimization_endpoint():
    payload = {
        "risk_profile": "Balanced",
        "max_equity": 0.35,
        "min_cash": 0.05,
        "max_volatility": 0.16,
        "max_concentration": 0.30,
        "min_liquidity": 0.25
    }
    res = client.post("/api/optimization", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "allocations" in data
    assert len(data["allocations"]) == 6
    assert "explanation" in data
    assert "what_happened" in data["explanation"]
    assert "which_limit_breached" in data["explanation"]

def test_risk_endpoints():
    res = client.get("/api/risk")
    assert res.status_code == 200
    data = res.json()
    assert "score_breakdown" in data
    assert "total_score" in data["score_breakdown"]

    res_heat = client.get("/api/risk/heatmap")
    assert res_heat.status_code == 200
    assert len(res_heat.json()) == 6

def test_stress_test_endpoint():
    payload = {
        "scenario_name": "Market Crash",
        "shocks": {}
    }
    res = client.post("/api/stress-test", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_name"] == "Market Crash"
    assert data["capital_loss"] > 0
    assert data["percentage_loss"] > 0
    assert "most_affected_assets" in data

def test_alerts_and_decisions():
    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    assert isinstance(alerts_res.json(), list)

    dec_res = client.get("/api/decisions")
    assert dec_res.status_code == 200
    assert isinstance(dec_res.json(), list)

def test_market_crash_closed_loop():
    res = client.post("/api/market-shock")
    assert res.status_code == 200
    data = res.json()
    assert data["capital_loss"] > 0
    assert data["after_metrics"]["risk_status"] in ["CRITICAL", "EMERGENCY RISK MODE"]
    assert len(data["alerts_generated"]) > 0
    assert data["recommended_rebalance"]["success"] is True
    assert "explanation" in data
    assert "what_happened" in data["explanation"]
    assert data["decision_recorded_id"] > 0
