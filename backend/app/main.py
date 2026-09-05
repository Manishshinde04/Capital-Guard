import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import init_database
from app.schemas.schemas import HealthResponse
from app.api.portfolio import router as portfolio_router
from app.api.optimization import router as optimization_router
from app.api.risk import router as risk_router
from app.api.stress_test import router as stress_router
from app.api.alerts import router as alerts_router
from app.api.decisions import router as decisions_router
from app.api.simulation import router as simulation_router
from app.services.simulation_service import SimulationService

app = FastAPI(
    title="CapitalGuard Institutional FinTech Platform",
    description="Intelligent Capital Allocation, Portfolio Optimization, Risk Monitoring, Stress Testing, and Automated Risk-Control Engine",
    version="1.0.0"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_database()

@app.get("/health", response_model=HealthResponse)
def health_check():
    sim_status = "Running" if SimulationService.is_running() else "Paused"
    return HealthResponse(
        status="healthy",
        api="Healthy",
        database="Connected",
        risk_engine="Active",
        optimizer="Ready",
        simulation=sim_status,
        timestamp=datetime.utcnow()
    )

@app.get("/")
def root():
    return {
        "platform": "CapitalGuard Institutional Risk & Capital Allocation",
        "tagline": "Smart Capital Allocation. Real-Time Risk Control.",
        "paradigm": "OBSERVE -> ANALYZE -> DETECT -> OPTIMIZE -> RESPOND -> EXPLAIN -> RECORD",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health"
    }

# Include Routers
app.include_router(portfolio_router)
app.include_router(optimization_router)
app.include_router(risk_router)
app.include_router(stress_router)
app.include_router(alerts_router)
app.include_router(decisions_router)
app.include_router(simulation_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
