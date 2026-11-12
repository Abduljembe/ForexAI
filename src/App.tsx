import React, { useState, useEffect, useMemo } from 'react';
import {
  Trade,
  MarketQuote,
  EconomicEvent,
  CurrencyStrength,
  RiskSettings,
} from './types/forex';
import {
  INITIAL_MARKET_QUOTES,
  INITIAL_ECONOMIC_EVENTS,
  INITIAL_CURRENCY_STRENGTH,
} from './services/mockData';
import { calculateDeterministicMetrics } from './services/analytics';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MarketIntelligenceView } from './components/MarketIntelligenceView';
import { SetupAnalyzerView } from './components/SetupAnalyzerView';
import { AICoachView } from './components/AICoachView';
import { TradeJournalView } from './components/TradeJournalView';
import { RiskCenterView } from './components/RiskCenterView';
import { StrategyLabView } from './components/StrategyLabView';
import { StrategyBuilderView } from './components/StrategyBuilderView';
import { AlertsView } from './components/AlertsView';
import { AcademyView } from './components/AcademyView';
import { CommunityView } from './components/CommunityView';
import { AccountSettingsView } from './components/AccountSettingsView';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('forexai_theme');
    return saved ? saved === 'dark' : true;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [accountLabel, setAccountLabel] = useState<string>('Live Trading Account');
  const [dateRange, setDateRange] = useState<string>('30D');

  // Real user trades state (defaults to clean empty ledger, stored in localStorage)
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('forexai_real_trades');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return []; // Clean empty ledger by default
  });

  // Quotes state initialized with standard quotes and updated from real live API
  const [quotes, setQuotes] = useState<MarketQuote[]>(INITIAL_MARKET_QUOTES);
  const [events] = useState<EconomicEvent[]>(INITIAL_ECONOMIC_EVENTS);
  const [currencyStrengths] = useState<CurrencyStrength[]>(INITIAL_CURRENCY_STRENGTH);

  // Real risk preferences
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(() => {
    const saved = localStorage.getItem('forexai_risk_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      accountBalance: 10000,
      baseCurrency: 'USD',
      maxRiskPerTradePercent: 1.0,
      maxDailyLossPercent: 2.0,
      maxWeeklyLossPercent: 4.0,
      maxOpenRiskPercent: 3.0,
      riskGuardEnabled: true,
    };
  });

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('forexai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('forexai_theme', 'light');
    }
  }, [darkMode]);

  // Persist real user trades
  useEffect(() => {
    localStorage.setItem('forexai_real_trades', JSON.stringify(trades));
  }, [trades]);

  // Persist risk settings
  useEffect(() => {
    localStorage.setItem('forexai_risk_settings', JSON.stringify(riskSettings));
  }, [riskSettings]);

  // Fetch real global market rates on mount and every 30 seconds
  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const res = await fetch('/api/market/live-rates');
        if (res.ok) {
          const data = await res.json();
          if (data.quotes && data.quotes.length > 0) {
            setQuotes(data.quotes);
          }
        }
      } catch (err) {
        console.error('Error fetching live rates:', err);
      }
    };

    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter trades by date range
  const filteredTrades = useMemo(() => {
    if (dateRange === 'ALL') return trades;
    const now = new Date().getTime();
    let days = 30;
    if (dateRange === '7D') days = 7;
    if (dateRange === '90D') days = 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return trades.filter((t) => {
      const tradeTime = new Date(t.closeTime || t.openTime).getTime();
      return tradeTime >= cutoff;
    });
  }, [trades, dateRange]);

  // Calculate deterministic metrics from real trades
  const metrics = useMemo(() => {
    return calculateDeterministicMetrics(filteredTrades, riskSettings.accountBalance);
  }, [filteredTrades, riskSettings.accountBalance]);

  // Trade actions
  const handleAddTrade = (newTrade: Trade) => {
    setTrades((prev) => [newTrade, ...prev]);
  };

  const handleImportTrades = (newTrades: Trade[]) => {
    setTrades((prev) => [...newTrades, ...prev]);
  };

  const handleUpdateTrade = (tradeId: string, updates: Partial<Trade>) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === tradeId ? { ...t, ...updates } : t))
    );
  };

  const handleResetData = () => {
    if (window.confirm('Clear all recorded trades from your journal?')) {
      setTrades([]);
      localStorage.removeItem('forexai_real_trades');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenQuickLog={() => setCurrentTab('journal')}
        accountLabel={accountLabel}
        onChangeAccount={setAccountLabel}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openRiskGuardActive={riskSettings.riskGuardEnabled}
          unreviewedTradesCount={trades.filter((t) => !t.reflection).length}
        />

        {/* Central Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              trades={filteredTrades}
              metrics={metrics}
              onNavigate={setCurrentTab}
              onOpenImportModal={() => setCurrentTab('journal')}
              dateRange={dateRange}
              onChangeDateRange={setDateRange}
            />
          )}

          {currentTab === 'market' && (
            <MarketIntelligenceView
              quotes={quotes}
              darkMode={darkMode}
            />
          )}

          {currentTab === 'setup_analyzer' && (
            <SetupAnalyzerView
              quotes={quotes}
              riskSettings={riskSettings}
              darkMode={darkMode}
              onSaveAsJournalPlan={(setupData) => {
                handleAddTrade({
                  id: `plan-${Date.now()}`,
                  sourceTicket: `PLAN-${Math.floor(Math.random() * 89999 + 10000)}`,
                  openTime: new Date().toISOString(),
                  closeTime: new Date().toISOString(),
                  grossPnl: 0,
                  commission: 0,
                  swap: 0,
                  netPnl: 0,
                  account: accountLabel,
                  ...setupData,
                });
              }}
            />
          )}

          {currentTab === 'coach' && (
            <AICoachView trades={filteredTrades} metrics={metrics} />
          )}

          {currentTab === 'journal' && (
            <TradeJournalView
              trades={trades}
              onAddTrade={handleAddTrade}
              onImportTrades={handleImportTrades}
              onUpdateTrade={handleUpdateTrade}
            />
          )}

          {currentTab === 'risk' && (
            <RiskCenterView
              quotes={quotes}
              riskSettings={riskSettings}
              onUpdateRiskSettings={setRiskSettings}
              currentEquity={metrics.netPnl + riskSettings.accountBalance}
            />
          )}

          {currentTab === 'backtest' && <StrategyLabView quotes={quotes} />}

          {currentTab === 'strategy_builder' && (
            <StrategyBuilderView onSendToBacktest={() => setCurrentTab('backtest')} />
          )}

          {currentTab === 'alerts' && <AlertsView quotes={quotes} />}

          {currentTab === 'academy' && <AcademyView />}

          {currentTab === 'community' && <CommunityView />}

          {currentTab === 'settings' && (
            <AccountSettingsView
              riskSettings={riskSettings}
              onUpdateRiskSettings={setRiskSettings}
              trades={trades}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
