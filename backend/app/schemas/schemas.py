from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class AssetResponse(BaseModel):
    id: int
    symbol: str
    name: str
    asset_class: str
    price: float
    base_price: float
    expected_return: float
    volatility: float
    liquidity_score: float
    risk_score: float
    minimum_allocation: float
    maximum_allocation: float

    class Config:
        from_attributes = True

class HoldingResponse(BaseModel):
    id: int
    asset_id: int
    symbol: str
    name: str
    asset_class: str
    allocation: float
    quantity: float
    current_value: float
    price: float
    expected_return: float
    volatility: float
    liquidity_score: float
    risk_score: float
    minimum_allocation: float
    maximum_allocation: float
    status: str
    reason: Optional[str] = None

class PortfolioMetricsResponse(BaseModel):
    total_capital: float
    expected_return: float
    portfolio_risk: float
    sharpe_ratio: float
    liquidity_ratio: float
    var_95: float
    var_99: float
    expected_shortfall_95: float
    max_drawdown: float
    concentration_hhi: float
    risk_status: str # NORMAL, WARNING, CRITICAL, EMERGENCY
    risk_score: float # 0 to 100
    last_updated: datetime

class PortfolioResponse(BaseModel):
    id: int
    name: str
    total_capital: float
    cash_balance: float
    risk_profile: str
    metrics: PortfolioMetricsResponse
    holdings: List[HoldingResponse]

class OptimizationRequest(BaseModel):
    risk_profile: str = "Balanced" # Conservative, Balanced, Aggressive
    max_equity: Optional[float] = 0.35
    min_cash: Optional[float] = 0.05
    max_volatility: Optional[float] = 0.16
    max_concentration: Optional[float] = 0.30
    min_liquidity: Optional[float] = 0.25
    transaction_cost_sensitivity: Optional[float] = 1.0 # Multiplier on trading penalty
    risk_aversion: Optional[float] = None # lambda

class AssetAllocationDiff(BaseModel):
    asset_id: int
    symbol: str
    name: str
    asset_class: str
    current_allocation: float
    recommended_allocation: float
    allocation_change: float
    current_value: float
    recommended_value: float
    trade_value: float # positive = buy, negative = sell
    action: str # BUY, SELL, HOLD

class BeforeAfterMetrics(BaseModel):
    expected_return: float
    portfolio_risk: float
    sharpe_ratio: float
    liquidity_ratio: float
    var_95: float
    concentration_hhi: float
    risk_score: float
    risk_status: str

class OptimizationExplanation(BaseModel):
    summary: str
    what_happened: str
    which_limit_breached: str
    why_it_matters: str
    what_should_we_do: str
    what_will_happen_afterward: str
    main_drivers: List[str]

class OptimizationResponse(BaseModel):
    success: bool
    risk_profile: str
    estimated_transaction_cost: float
    current_metrics: BeforeAfterMetrics
    recommended_metrics: BeforeAfterMetrics
    allocations: List[AssetAllocationDiff]
    explanation: OptimizationExplanation
    message: Optional[str] = None

class RebalanceRequest(BaseModel):
    recommended_allocations: Dict[str, float] # { "EQUITY": 0.30, "GBOND": 0.35, ... }
    risk_profile: Optional[str] = "Balanced"
    notes: Optional[str] = "Simulated defensive rebalance execution"

class RebalanceResponse(BaseModel):
    success: bool
    portfolio_id: int
    new_total_capital: float
    transaction_cost_incurred: float
    updated_holdings: List[HoldingResponse]
    metrics: PortfolioMetricsResponse
    decision_id: int
    message: str

class RiskPolicyResponse(BaseModel):
    id: int
    max_equity: float
    max_volatility: float
    warning_volatility: float
    warning_var: float
    critical_var: float
    max_concentration: float
    min_liquidity: float
    critical_liquidity: float
    max_drawdown: float
    warning_drawdown: float
    transaction_cost_rate: float

    class Config:
        from_attributes = True

class RiskPolicyUpdate(BaseModel):
    max_equity: Optional[float] = None
    max_volatility: Optional[float] = None
    warning_volatility: Optional[float] = None
    warning_var: Optional[float] = None
    critical_var: Optional[float] = None
    max_concentration: Optional[float] = None
    min_liquidity: Optional[float] = None
    critical_liquidity: Optional[float] = None
    max_drawdown: Optional[float] = None
    warning_drawdown: Optional[float] = None
    transaction_cost_rate: Optional[float] = None

class RiskScoreBreakdown(BaseModel):
    total_score: float # 0 - 100
    status: str # NORMAL, WARNING, CRITICAL, EMERGENCY
    volatility_component: float # 0 - 30
    var_component: float # 0 - 25
    concentration_component: float # 0 - 25
    liquidity_deficit_component: float # 0 - 20
    summary: str

class RiskHeatmapRow(BaseModel):
    asset_id: int
    symbol: str
    name: str
    asset_class: str
    allocation: float
    volatility_level: str # Low, Medium, High, Extreme
    concentration_level: str # Low, Moderate, High, Critical
    liquidity_level: str # Very High, High, Moderate, Illiquid
    market_sensitivity: str # High, Moderate, Defensive, Safe-Haven
    risk_score: float

class AlertResponse(BaseModel):
    id: int
    severity: str
    metric: str
    current_value: float
    threshold: float
    message: str
    recommendation: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DecisionResponse(BaseModel):
    id: int
    event_type: str
    trigger: str
    reason: str
    action: str
    before_metrics: Dict[str, Any]
    after_metrics: Dict[str, Any]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class StressTestScenarioRequest(BaseModel):
    scenario_name: str # Market Crash, Recession, Interest Rate Shock, Inflation Shock, Liquidity Crisis, Custom
    shocks: Dict[str, float] # { "EQUITY": -0.25, "CBOND": -0.10, ... }

class AssetImpact(BaseModel):
    symbol: str
    name: str
    asset_class: str
    shock_pct: float
    value_before: float
    value_after: float
    value_loss: float
    weight_before: float
    weight_after: float

class StressTestResultResponse(BaseModel):
    scenario_name: str
    portfolio_value_before: float
    portfolio_value_after: float
    capital_loss: float
    percentage_loss: float
    risk_before: float
    risk_after: float
    var_95_before: float
    var_95_after: float
    liquidity_before: float
    liquidity_after: float
    status_before: str
    status_after: str
    asset_impacts: List[AssetImpact]
    most_affected_assets: List[str]
    recommended_response: str
    recommended_allocations: Optional[Dict[str, float]] = None

class MarketShockTriggerResponse(BaseModel):
    message: str
    shock_name: str
    simulation_steps: List[str]
    before_metrics: PortfolioMetricsResponse
    after_metrics: PortfolioMetricsResponse
    capital_loss: float
    percentage_loss: float
    alerts_generated: List[AlertResponse]
    recommended_rebalance: OptimizationResponse
    decision_recorded_id: int
    explanation: OptimizationExplanation

class HealthResponse(BaseModel):
    status: str
    api: str
    database: str
    risk_engine: str
    optimizer: str
    simulation: str
    timestamp: datetime
