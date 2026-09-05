export interface Asset {
  id: number;
  symbol: string;
  name: string;
  asset_class: string;
  price: number;
  base_price: number;
  expected_return: number;
  volatility: number;
  liquidity_score: number;
  risk_score: number;
  minimum_allocation: number;
  maximum_allocation: number;
}

export interface Holding {
  id: number;
  asset_id: number;
  symbol: string;
  name: string;
  asset_class: string;
  allocation: number;
  quantity: number;
  current_value: number;
  price: number;
  expected_return: number;
  volatility: number;
  liquidity_score: number;
  risk_score: number;
  minimum_allocation: number;
  maximum_allocation: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  reason?: string;
}

export interface PortfolioMetrics {
  total_capital: number;
  expected_return: number;
  portfolio_risk: number;
  sharpe_ratio: number;
  liquidity_ratio: number;
  var_95: number;
  var_99: number;
  expected_shortfall_95: number;
  max_drawdown: number;
  concentration_hhi: number;
  risk_status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EMERGENCY RISK MODE';
  risk_score: number;
  last_updated: string;
}

export interface Portfolio {
  id: number;
  name: string;
  total_capital: number;
  cash_balance: number;
  risk_profile: string;
  metrics: PortfolioMetrics;
  holdings: Holding[];
}

export interface AssetAllocationDiff {
  asset_id: number;
  symbol: string;
  name: string;
  asset_class: string;
  current_allocation: number;
  recommended_allocation: number;
  allocation_change: number;
  current_value: number;
  recommended_value: number;
  trade_value: number;
  action: 'BUY' | 'SELL' | 'HOLD';
}

export interface BeforeAfterMetrics {
  expected_return: number;
  portfolio_risk: number;
  sharpe_ratio: number;
  liquidity_ratio: number;
  var_95: number;
  concentration_hhi: number;
  risk_score: number;
  risk_status: string;
}

export interface OptimizationExplanation {
  summary: string;
  what_happened: string;
  which_limit_breached: string;
  why_it_matters: string;
  what_should_we_do: string;
  what_will_happen_afterward: string;
  main_drivers: string[];
}

export interface OptimizationResponse {
  success: boolean;
  risk_profile: string;
  estimated_transaction_cost: number;
  current_metrics: BeforeAfterMetrics;
  recommended_metrics: BeforeAfterMetrics;
  allocations: AssetAllocationDiff[];
  explanation: OptimizationExplanation;
  message?: string;
}

export interface RiskScoreBreakdown {
  total_score: number;
  status: string;
  volatility_component: number;
  var_component: number;
  concentration_component: number;
  liquidity_deficit_component: number;
  summary: string;
}

export interface RiskHeatmapRow {
  asset_id: number;
  symbol: string;
  name: string;
  asset_class: string;
  allocation: number;
  volatility_level: string;
  concentration_level: string;
  liquidity_level: string;
  market_sensitivity: string;
  risk_score: number;
}

export interface RiskPolicy {
  id: number;
  max_equity: number;
  max_volatility: number;
  warning_volatility: number;
  warning_var: number;
  critical_var: number;
  max_concentration: number;
  min_liquidity: number;
  critical_liquidity: number;
  max_drawdown: number;
  warning_drawdown: number;
  transaction_cost_rate: number;
}

export interface Alert {
  id: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  metric: string;
  current_value: number;
  threshold: number;
  message: string;
  recommendation: string;
  status: 'ACTIVE' | 'RESOLVED';
  created_at: string;
}

export interface Decision {
  id: number;
  event_type: string;
  trigger: string;
  reason: string;
  action: string;
  before_metrics: Record<string, any>;
  after_metrics: Record<string, any>;
  status: string;
  created_at: string;
}

export interface AssetImpact {
  symbol: string;
  name: string;
  asset_class: string;
  shock_pct: number;
  value_before: number;
  value_after: number;
  value_loss: number;
  weight_before: number;
  weight_after: number;
}

export interface StressTestResult {
  scenario_name: string;
  portfolio_value_before: number;
  portfolio_value_after: number;
  capital_loss: number;
  percentage_loss: number;
  risk_before: number;
  risk_after: number;
  var_95_before: number;
  var_95_after: number;
  liquidity_before: number;
  liquidity_after: number;
  status_before: string;
  status_after: string;
  asset_impacts: AssetImpact[];
  most_affected_assets: string[];
  recommended_response: string;
  recommended_allocations?: Record<string, number>;
}

export interface MarketShockResult {
  message: string;
  shock_name: string;
  simulation_steps: string[];
  before_metrics: PortfolioMetrics;
  after_metrics: PortfolioMetrics;
  capital_loss: number;
  percentage_loss: number;
  alerts_generated: Alert[];
  recommended_rebalance: OptimizationResponse;
  decision_recorded_id: number;
  explanation: OptimizationExplanation;
}

export interface HealthStatus {
  status: string;
  api: string;
  database: string;
  risk_engine: string;
  optimizer: string;
  simulation: string;
  timestamp: string;
}
