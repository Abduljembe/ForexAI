import React, { useState } from 'react';
import { MarketQuote, AlertItem } from '../types/forex';
import { Bell, Plus, Trash2, CheckCircle, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

interface AlertsViewProps {
  quotes: MarketQuote[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ quotes }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      symbol: 'EUR/USD',
      type: 'PRICE_LEVEL',
      condition: 'Price crosses above 1.0920 Resistance',
      targetValue: 1.092,
      createdAt: '2026-11-10T09:00:00Z',
      isActive: true,
      notes: 'Potential break of daily liquidity high.',
    },
    {
      id: 'alt-2',
      symbol: 'USD/JPY',
      type: 'VOLATILITY',
      condition: 'ATR(14) expands beyond 45 pips / hour',
      targetValue: 45.0,
      createdAt: '2026-11-10T14:30:00Z',
      isActive: true,
      notes: 'Flag excessive volatility during BoJ session.',
    },
    {
      id: 'alt-3',
      symbol: 'GLOBAL',
      type: 'RISK_GUARD',
      condition: 'Daily drawdown reaches -2.0% threshold',
      targetValue: 2.0,
      createdAt: '2026-11-08T08:00:00Z',
      isActive: true,
      notes: 'Automatic circuit breaker notification.',
    },
    {
      id: 'alt-4',
      symbol: 'USD',
      type: 'ECONOMIC_NEWS',
      condition: '30-minute warning prior to High-Impact US CPI',
      createdAt: '2026-11-09T11:00:00Z',
      isActive: true,
      notes: 'Spread widening risk.',
    },
  ]);

  const [newSymbol, setNewSymbol] = useState<string>('EUR/USD');
  const [newType, setNewType] = useState<AlertItem['type']>('PRICE_LEVEL');
  const [newCondition, setNewCondition] = useState<string>('');
  const [newTarget, setNewTarget] = useState<number>(1.085);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AlertItem = {
      id: `alt-${Date.now()}`,
      symbol: newSymbol,
      type: newType,
      condition: newCondition || `Price reaches ${newTarget}`,
      targetValue: newTarget,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setAlerts([created, ...alerts]);
    setShowAddModal(false);
    setNewCondition('');
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trading Alerts & Risk Guard Triggers
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Price Levels · Volatility Expansion · Red News · Loss Limits</span>
            <span>·</span>
            <span className="text-slate-400">Deduplicated & Cooldown Protected</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Alert Rule</span>
        </button>
      </div>

      {/* Alerts Table */}
      <div className="rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-3 py-3">Alert Type</th>
                <th className="px-4 py-3">Condition & Trigger</th>
                <th className="px-3 py-3">Target Value</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {alerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold font-mono text-slate-900 dark:text-white">
                    {alt.symbol}
                  </td>

                  <td className="px-3 py-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {alt.type.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    <div>{alt.condition}</div>
                    {alt.notes && <div className="text-[10px] text-slate-400 font-normal">{alt.notes}</div>}
                  </td>

                  <td className="px-3 py-3 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {alt.targetValue != null ? alt.targetValue : 'N/A'}
                  </td>

                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleToggleAlert(alt.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        alt.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {alt.isActive ? 'Active' : 'Muted'}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteAlert(alt.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAlert}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Trading Alert
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Symbol / Target</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
              >
                <option value="GLOBAL">GLOBAL (All Pairs / Risk Limit)</option>
                {quotes.map((q) => (
                  <option key={q.symbol} value={q.symbol}>{q.symbol}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Alert Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as AlertItem['type'])}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
              >
                <option value="PRICE_LEVEL">Price Level Threshold</option>
                <option value="VOLATILITY">ATR Volatility Expansion</option>
                <option value="ECONOMIC_NEWS">High-Impact News Release</option>
                <option value="RISK_GUARD">Personal Risk Guard Limit</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Condition Description</label>
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g. Price touches H4 support level at 1.0820"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Target Numeric Value</label>
              <input
                type="number"
                step="0.0001"
                value={newTarget}
                onChange={(e) => setNewTarget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
              >
                Create Alert
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
