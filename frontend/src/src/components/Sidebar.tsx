import React from 'react';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  PieChart,
  SlidersHorizontal,
  ShieldAlert,
  Zap,
  Activity,
  Bell,
  History,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (col: boolean) => void;
  activeAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  activeAlertCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'optimization', label: 'Optimization', icon: SlidersHorizontal },
    { id: 'risk', label: 'Risk Monitor', icon: ShieldAlert },
    { id: 'stress', label: 'Stress Testing', icon: Zap },
    { id: 'simulation', label: 'Market Simulation', icon: Activity },
    {
      id: 'alerts',
      label: 'Alert Center',
      icon: Bell,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined
    },
    { id: 'decisions', label: 'Decision History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'methodology', label: 'Methodology', icon: BookOpen }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-obsidian-900 border-r border-obsidian-800 transition-all duration-300 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-obsidian-800 bg-obsidian-950/60">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src={logo} alt="CapitalGuard" className="w-9 h-9" />
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 mx-auto rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
            <img src={logo} alt="CapitalGuard" className="w-5 h-5" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-obsidian-800/80 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border border-transparent'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Note */}
      <div className="p-3 border-t border-obsidian-800 bg-obsidian-950/40 text-[11px] text-slate-400">
        {!collapsed ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">CapitalGuard v1.0</span>
              <button
                onClick={() => setCollapsed(true)}
                className="text-slate-400 hover:text-slate-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Decision-support simulation</p>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center py-1 text-slate-400 hover:text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
