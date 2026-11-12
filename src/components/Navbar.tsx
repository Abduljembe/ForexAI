import React from 'react';
import { Shield, Sparkles, Plus, Moon, Sun, ArrowRight, BarChart2 } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenQuickLog: () => void;
  accountLabel: string;
  onChangeAccount: (acc: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  darkMode,
  onToggleTheme,
  onOpenQuickLog,
  accountLabel,
  onChangeAccount,
}) => {
  const topNavLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'market', label: 'Market' },
    { id: 'setup_analyzer', label: 'Analyze' },
    { id: 'journal', label: 'Journal' },
    { id: 'coach', label: 'AI Coach' },
    { id: 'risk', label: 'Risk Lab' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-8 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold tracking-tight">
              FX
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                ForexAI
              </span>
              <span className="text-[10px] text-slate-500 -mt-1 hidden sm:inline whitespace-nowrap">
                Intelligence Platform
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
            <select
              value={accountLabel}
              onChange={(e) => onChangeAccount(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1 rounded border border-slate-300 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tabular-nums cursor-pointer"
            >
              <option value="Primary MT5 #109284">Primary MT5 #109284</option>
              <option value="Funded Evaluation #8492">Funded Evaluation #8492</option>
              <option value="Swing Account #3918">Swing Account #3918</option>
            </select>
          </div>
        </div>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-400">
          {topNavLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 relative py-1 ${
                currentTab === link.id
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : ''
              }`}
            >
              {link.label}
              {currentTab === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={() => onSelectTab('backtest')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'backtest' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Backtest
          </button>
          <button
            onClick={() => onSelectTab('academy')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'academy' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Academy
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
