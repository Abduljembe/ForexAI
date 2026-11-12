import React, { useState } from 'react';
import { RiskSettings, Trade } from '../types/forex';
import {
  Settings,
  Shield,
  Download,
  Check,
  CreditCard,
  Trash2,
  AlertCircle,
  FileText,
  Lock,
} from 'lucide-react';

interface AccountSettingsViewProps {
  riskSettings: RiskSettings;
  onUpdateRiskSettings: (settings: RiskSettings) => void;
  trades: Trade[];
  onResetData: () => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  riskSettings,
  onUpdateRiskSettings,
  trades,
  onResetData,
}) => {
  const [activePlan, setActivePlan] = useState<string>('Pro');
  const [baseCurrency, setBaseCurrency] = useState<string>(riskSettings.baseCurrency || 'USD');
  const [maxRisk, setMaxRisk] = useState<number>(riskSettings.maxRiskPerTradePercent);
  const [dailyLimit, setDailyLimit] = useState<number>(riskSettings.maxDailyLossPercent);
  const [weeklyLimit, setWeeklyLimit] = useState<number>(riskSettings.maxWeeklyLossPercent);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Core journaling and basic performance statistics.',
      features: ['1 Trading Account', '50 Trades History', 'Standard Metrics (Win Rate, P/L)', '3 AI Coach Queries/mo'],
    },
    {
      name: 'Starter',
      price: '$9',
      period: 'per month',
      description: 'Essential journaling and performance reviews for developing traders.',
      features: ['2 Trading Accounts', 'Unlimited Trade History', 'Session & Pair Breakdown', '25 AI Coach Queries/mo', 'CSV Data Import'],
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'Full intelligence platform with setup analyzer and quant lab.',
      popular: true,
      features: [
        '5 Trading Accounts',
        'AI Trade Setup Analyzer',
        'Unlimited AI Performance Coach',
        'Backtesting & Strategy Lab',
        'Formula-Safe CSV & PDF Reports',
      ],
    },
    {
      name: 'Premium',
      price: '$39',
      period: 'per month',
      description: 'Advanced portfolio analytics and Monte Carlo stress testing.',
      features: [
        '10 Trading Accounts',
        'Monte Carlo 500-Run Simulations',
        'Correlated Exposure Guard',
        'Forex Academy Masterclass Access',
        'Priority Tick Feed Adapter',
      ],
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'Institutional-grade workspace for multi-account prop desk traders.',
      features: [
        'Unlimited Trading Accounts',
        'Prop Firm Drawdown Protection Rules',
        'Dedicated Quantitative Export API',
        'Custom Risk Guard Rulesets',
        '1-on-1 Trading Strategy Audit',
      ],
    },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRiskSettings({
      ...riskSettings,
      baseCurrency,
      maxRiskPerTradePercent: maxRisk,
      maxDailyLossPercent: dailyLimit,
      maxWeeklyLossPercent: weeklyLimit,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Safe CSV Export with Formula Injection Sanitization
  const handleExportCsv = () => {
    const sanitize = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      // If cell begins with =, +, -, or @, prepend a single quote to prevent spreadsheet injection
      if (/^[=+\-@]/.test(str)) {
        return `'${str}`;
      }
      return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const headers = [
      'Ticket',
      'Symbol',
      'Side',
      'OpenTime',
      'CloseTime',
      'Volume',
      'EntryPrice',
      'ExitPrice',
      'StopLoss',
      'TakeProfit',
      'NetPnl',
      'RMultiple',
      'SetupTag',
      'Emotion',
      'RuleScore',
    ];

    const rows = trades.map((t) => [
      sanitize(t.sourceTicket),
      sanitize(t.symbol),
      sanitize(t.side),
      sanitize(t.openTime),
      sanitize(t.closeTime),
      sanitize(t.volume),
      sanitize(t.entryPrice),
      sanitize(t.exitPrice),
      sanitize(t.stopLoss),
      sanitize(t.takeProfit),
      sanitize(t.netPnl),
      sanitize(t.rMultiple),
      sanitize(t.setupTag),
      sanitize(t.emotion),
      sanitize(t.ruleFollowingScore),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ForexAI_Trades_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Platform Settings & Subscriptions
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Risk Parameters</span>
            <span>·</span>
            <span>Plan Entitlements</span>
            <span>·</span>
            <span>Privacy & Formula-Safe Exports</span>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-blue-500" />
          <span>Export Clean CSV</span>
        </button>
      </div>

      {/* Subscription Pricing Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Subscription Plans</h2>
          <p className="text-xs text-slate-500">Upgrade or adjust your platform tiers anytime.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {plans.map((p) => {
            const isCurrent = activePlan === p.name;
            return (
              <div
                key={p.name}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</span>
                    {p.popular && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {p.price}
                    </span>
                    <span className="text-[10px] text-slate-400">/{p.period}</span>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-500 leading-snug">{p.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => setActivePlan(p.name)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Preferences Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSaveSettings} className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Account Risk & Base Currency</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Base Account Currency</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="KES">KES (KSh)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Max Risk / Trade (%)</label>
              <input
                type="number"
                step="0.1"
                value={maxRisk}
                onChange={(e) => setMaxRisk(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Max Daily Loss Limit (%)</label>
              <input
                type="number"
                step="0.1"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Max Weekly Loss Limit (%)</label>
              <input
                type="number"
                step="0.1"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(parseFloat(e.target.value) || 2.0)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {isSaved ? 'Settings saved successfully.' : 'Applies across all calculators.'}
            </span>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Save Risk Preferences
            </button>
          </div>
        </form>

        {/* Data Management & Compliance Disclosures */}
        <div className="space-y-4">
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Data Protection & Safe Export</span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your trade history and notes belong entirely to you. You can export a formula-safe CSV at any time or reset your local trade logs.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onResetData}
                className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Demo Trades to Initial State</span>
              </button>
            </div>
          </div>

          {/* Legal Disclaimers as required by PDF */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-500 leading-relaxed space-y-2">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Legal, Regulatory & Risk Disclosure
            </div>
            <p>
              Forex trading involves substantial risk of loss and is not suitable for all investors. ForexAI is designed strictly as an educational analytics, statistical backtesting, and journaling platform. It does not promise profits, provide personalized investment advice, or place trades automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
