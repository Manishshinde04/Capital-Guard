import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { PortfolioPage } from './pages/PortfolioPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { RiskMonitorPage } from './pages/RiskMonitorPage';
import { StressTestingPage } from './pages/StressTestingPage';
import { MarketSimulationPage } from './pages/MarketSimulationPage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { LandingPage } from './pages/public/LandingPage';
import { PrivacyPage, TermsPage } from './pages/public/LegalPages';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { Portfolio, Alert, Decision, MarketShockResult, OptimizationResponse } from './types';
import { api } from './services/api';

// ─── Private App Shell ────────────────────────────────────────────────────────
function PrivateApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive current tab from URL path
  const pathToTab: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/portfolio': 'portfolio',
    '/optimization': 'optimization',
    '/risk': 'risk',
    '/stress-testing': 'stress',
    '/market-simulation': 'simulation',
    '/alerts': 'alerts',
    '/decisions': 'decisions',
    '/settings': 'settings',
    '/methodology': 'methodology',
  };
  const tabToPath: Record<string, string> = Object.fromEntries(
    Object.entries(pathToTab).map(([k, v]) => [v, k])
  );
  const currentTab = pathToTab[location.pathname] ?? 'dashboard';

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isApplyingRebalance, setIsApplyingRebalance] = useState<boolean>(false);

  // Tab navigation via URL
  const setCurrentTab = useCallback((tab: string) => {
    const path = tabToPath[tab];
    if (path) navigate(path);
  }, [navigate, tabToPath]);

  // Fetch consolidated state
  const refreshData = useCallback(async () => {
    try {
      const [port, alertList, decList, simState] = await Promise.all([
        api.getPortfolio(),
        api.getAlerts(),
        api.getDecisions(),
        api.getSimulationState().catch(() => ({ is_running: true }))
      ]);
      setPortfolio(port);
      setAlerts(alertList);
      setDecisions(decList);
      if (simState && typeof simState.is_running === 'boolean') {
        setIsSimulating(simState.is_running);
      }
    } catch (err) {
      console.error('Error refreshing CapitalGuard state:', err);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic simulation tick (every 6 seconds if active)
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(async () => {
      try {
        await api.stepSimulation();
        const updated = await api.getPortfolio();
        setPortfolio(updated);
        const updatedAlerts = await api.getAlerts();
        setAlerts(updatedAlerts);
      } catch {
        // Silently fail if offline
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleToggleSim = async (running: boolean) => {
    setIsSimulating(running);
    try {
      await api.toggleSimulation(running);
    } catch (err) {
      console.error('Toggle simulation error:', err);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      await refreshData();
    } catch (err) {
      console.error('Reset demo error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleTriggerMarketCrash = async (): Promise<MarketShockResult> => {
    const result = await api.triggerMarketCrash();
    await refreshData();
    return result;
  };

  const handleRunOptimization = async (params: any): Promise<OptimizationResponse> => {
    return api.runOptimization(params);
  };

  const handleApplyRebalance = async (allocations: Record<string, number>, riskProfile: string = 'Balanced') => {
    setIsApplyingRebalance(true);
    try {
      await api.applyRebalance({
        recommended_allocations: allocations,
        risk_profile: riskProfile,
        notes: 'Simulated portfolio rebalance execution'
      });
      await refreshData();
    } finally {
      setIsApplyingRebalance(false);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    await api.resolveAlert(alertId);
    const updatedAlerts = await api.getAlerts();
    setAlerts(updatedAlerts);
  };

  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        }`}
      >
        {/* Sticky Top Header */}
        <TopBar
          riskStatus={portfolio?.metrics?.risk_status || 'NORMAL'}
          isSimulating={isSimulating}
          onToggleSim={handleToggleSim}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          onNavigate={setCurrentTab}
        />

        {/* Tab Content Viewport */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/dashboard" element={
              <Dashboard
                portfolio={portfolio}
                alerts={alerts}
                decisions={decisions}
                onTriggerMarketCrash={handleTriggerMarketCrash}
                onApplyRebalance={handleApplyRebalance}
                onNavigate={setCurrentTab}
                isLoadingPortfolio={isLoadingPortfolio}
              />
            } />
            <Route path="/portfolio" element={<PortfolioPage portfolio={portfolio} />} />
            <Route path="/optimization" element={
              <OptimizationPage
                portfolio={portfolio}
                onRunOptimization={handleRunOptimization}
                onApplyRebalance={handleApplyRebalance}
                isApplyingRebalance={isApplyingRebalance}
              />
            } />
            <Route path="/risk" element={<RiskMonitorPage portfolio={portfolio} />} />
            <Route path="/stress-testing" element={
              <StressTestingPage
                portfolio={portfolio}
                onApplyRebalance={handleApplyRebalance}
                isApplyingRebalance={isApplyingRebalance}
              />
            } />
            <Route path="/market-simulation" element={
              <MarketSimulationPage
                portfolio={portfolio}
                isSimulating={isSimulating}
                onToggleSim={handleToggleSim}
                onRefreshPortfolio={refreshData}
              />
            } />
            <Route path="/alerts" element={
              <AlertCenterPage alerts={alerts} onResolveAlert={handleResolveAlert} />
            } />
            <Route path="/decisions" element={<DecisionHistoryPage decisions={decisions} />} />
            <Route path="/settings" element={<SettingsPage onPolicyUpdated={refreshData} />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ─── Root App with Public + Private Routes ────────────────────────────────────
export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <PrivateApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
