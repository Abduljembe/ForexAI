import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Crosshair,
  Brain,
  BookOpen,
  ShieldAlert,
  FlaskConical,
  Wand2,
  GraduationCap,
  Users,
  Settings,
  Bell,
  Sliders,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openRiskGuardActive: boolean;
  unreviewedTradesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openRiskGuardActive,
  unreviewedTradesCount,
}) => {
  const sections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'market', label: 'Market Intelligence', icon: TrendingUp },
        { id: 'setup_analyzer', label: 'Setup Analyzer', icon: Crosshair },
      ],
    },
    {
      title: 'PERFORMANCE & DISCIPLINE',
      items: [
        { id: 'coach', label: 'AI Trading Coach', icon: Brain },
        {
          id: 'journal',
          label: 'Trading Journal',
          icon: BookOpen,
          badge: unreviewedTradesCount > 0 ? `${unreviewedTradesCount}` : undefined,
        },
        {
          id: 'risk',
          label: 'Risk Centre',
          icon: ShieldAlert,
          alertBadge: openRiskGuardActive ? 'Guard Active' : undefined,
        },
      ],
    },
    {
      title: 'QUANTITATIVE LAB',
      items: [
        { id: 'backtest', label: 'Strategy & Backtest', icon: FlaskConical },
        { id: 'strategy_builder', label: 'AI Strategy Builder', icon: Wand2 },
        { id: 'alerts', label: 'Trading Alerts', icon: Bell },
      ],
    },
    {
      title: 'ECOSYSTEM & WORKSPACE',
      items: [
        { id: 'academy', label: 'Forex Academy', icon: GraduationCap },
        { id: 'community', label: 'Community & Challenges', icon: Users },
        { id: 'settings', label: 'Settings & Plans', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 hidden lg:flex flex-col justify-between min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-semibold">
                        {item.badge}
                      </span>
                    )}
                    {item.alertBadge && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded">
                        {item.alertBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Grounding & Educational Disclaimer Callout */}
      <div className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300">Deterministic Analytics</div>
        <p className="leading-relaxed">
          Math & metrics are computed strictly in deterministic code. AI provides evidence-based reviews without inventing prices or guarantees.
        </p>
      </div>
    </aside>
  );
};
