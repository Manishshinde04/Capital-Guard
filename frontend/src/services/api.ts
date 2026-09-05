import {
  Portfolio,
  PortfolioMetrics,
  Asset,
  OptimizationResponse,
  RiskScoreBreakdown,
  RiskHeatmapRow,
  RiskPolicy,
  Alert,
  Decision,
  StressTestResult,
  MarketShockResult,
  HealthStatus
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || JSON.stringify(err);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return (await res.json()) as T;
}

export const api = {
  // Health
  getHealth: (): Promise<HealthStatus> =>
    fetch(`${API_BASE}/health`).then((res) => handleResponse<HealthStatus>(res)),

  // Portfolio
  getPortfolio: (): Promise<Portfolio> =>
    fetch(`${API_BASE}/api/portfolio`).then((res) => handleResponse<Portfolio>(res)),

  getPortfolioMetrics: (): Promise<PortfolioMetrics> =>
    fetch(`${API_BASE}/api/portfolio/metrics`).then((res) => handleResponse<PortfolioMetrics>(res)),

  getAssets: (): Promise<Asset[]> =>
    fetch(`${API_BASE}/api/assets`).then((res) => handleResponse<Asset[]>(res)),

  // Optimization
  runOptimization: (params: {
    risk_profile?: string;
    max_equity?: number;
    min_cash?: number;
    max_volatility?: number;
    max_concentration?: number;
    min_liquidity?: number;
    transaction_cost_sensitivity?: number;
    risk_aversion?: number;
  }): Promise<OptimizationResponse> =>
    fetch(`${API_BASE}/api/optimization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then((res) => handleResponse<OptimizationResponse>(res)),

  applyRebalance: (params: {
    recommended_allocations: Record<string, number>;
    risk_profile?: string;
    notes?: string;
  }): Promise<any> =>
    fetch(`${API_BASE}/api/rebalance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then((res) => handleResponse<any>(res)),

  // Risk
  getRiskAnalysis: (): Promise<{
    metrics: PortfolioMetrics;
    score_breakdown: RiskScoreBreakdown;
    policy: Partial<RiskPolicy>;
  }> =>
    fetch(`${API_BASE}/api/risk`).then((res) =>
      handleResponse<{
        metrics: PortfolioMetrics;
        score_breakdown: RiskScoreBreakdown;
        policy: Partial<RiskPolicy>;
      }>(res)
    ),

  getRiskHeatmap: (): Promise<RiskHeatmapRow[]> =>
    fetch(`${API_BASE}/api/risk/heatmap`).then((res) => handleResponse<RiskHeatmapRow[]>(res)),

  getRiskPolicy: (): Promise<RiskPolicy> =>
    fetch(`${API_BASE}/api/risk-policy`).then((res) => handleResponse<RiskPolicy>(res)),

  updateRiskPolicy: (policy: Partial<RiskPolicy>): Promise<RiskPolicy> =>
    fetch(`${API_BASE}/api/risk-policy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    }).then((res) => handleResponse<RiskPolicy>(res)),

  // Stress Testing
  getStressScenarios: (): Promise<Record<string, { description: string; shocks: Record<string, number> }>> =>
    fetch(`${API_BASE}/api/stress-test/scenarios`).then((res) =>
      handleResponse<Record<string, { description: string; shocks: Record<string, number> }>>(res)
    ),

  runStressTest: (scenario_name: string, shocks: Record<string, number>): Promise<StressTestResult> =>
    fetch(`${API_BASE}/api/stress-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_name, shocks })
    }).then((res) => handleResponse<StressTestResult>(res)),

  // Primary ⚡ Market Crash Demo
  triggerMarketCrash: (): Promise<MarketShockResult> =>
    fetch(`${API_BASE}/api/market-shock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then((res) => handleResponse<MarketShockResult>(res)),

  // Alerts
  getAlerts: (status?: string, severity?: string): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    return fetch(`${API_BASE}/api/alerts?${params.toString()}`).then((res) =>
      handleResponse<Alert[]>(res)
    );
  },

  resolveAlert: (alertId: number): Promise<Alert> =>
    fetch(`${API_BASE}/api/alerts/${alertId}?status=RESOLVED`, {
      method: 'PATCH'
    }).then((res) => handleResponse<Alert>(res)),

  // Decisions
  getDecisions: (): Promise<Decision[]> =>
    fetch(`${API_BASE}/api/decisions`).then((res) => handleResponse<Decision[]>(res)),

  getDecisionDetail: (decisionId: number): Promise<Decision> =>
    fetch(`${API_BASE}/api/decisions/${decisionId}`).then((res) => handleResponse<Decision>(res)),

  // Simulation
  getSimulationState: (): Promise<{ is_running: boolean; update_count: number; last_update: string }> =>
    fetch(`${API_BASE}/api/simulation/state`).then((res) =>
      handleResponse<{ is_running: boolean; update_count: number; last_update: string }>(res)
    ),

  toggleSimulation: (running: boolean): Promise<any> =>
    fetch(`${API_BASE}/api/simulation/toggle?running=${running}`, {
      method: 'POST'
    }).then((res) => handleResponse<any>(res)),

  stepSimulation: (): Promise<any> =>
    fetch(`${API_BASE}/api/simulation/step`, {
      method: 'POST'
    }).then((res) => handleResponse<any>(res)),

  resetDemo: (): Promise<any> =>
    fetch(`${API_BASE}/api/simulation/reset`, {
      method: 'POST'
    }).then((res) => handleResponse<any>(res))
};
