import React from 'react';
import { Trade, MetricSummary } from '../types/forex';
import { EquityCurveChart } from './Charts/EquityCurveChart';
import { PairBarChart } from './Charts/PairBarChart';
import {
  TrendingUp,
  Target,
  Percent,
  AlertTriangle,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  Brain,
  Sparkles,
  FileSpreadsheet,
  Plus,
  Compass,
  Zap,
  Radio,
  LayoutGrid,
} from 'lucide-react';

interface DashboardViewProps {
  trades: Trade[];
  metrics: MetricSummary;
  onNavigate: (tab: string) => void;
  onOpenImportModal: () => void;
  dateRange: string;
  onChangeDateRange: (range: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  metrics,
  onNavigate,
  onOpenImportModal,
  dateRange,
  onChangeDateRange,
}) => {
  const isNetPositive = metrics.netPnl >= 0;
  const hasTrades = trades.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trading Performance Overview
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Deterministic Analytics</span>
            <span>·</span>
            <span>{hasTrades ? `${metrics.tradeCount} Live Recorded Trades` : 'Real Trader Workspace'}</span>
            <span>·</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 inline" /> Verified Data Grounding
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range filter segmented control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {['7D', '30D', '90D', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => onChangeDateRange(r)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Broker CSV</span>
          </button>
        </div>
      </div>

      {/* Institutional Intelligence Launchpad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('market')}
          className="p-3.5 text-left rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-2.5 font-bold text-xs text-slate-900 dark:text-white">Multi-Chart Matrix</div>
          <p className="text-[11px] text-slate-500 mt-0.5">EUR/USD vs DXY & 4-grid</p>
        </button>

        <button
          onClick={() => onNavigate('risk')}
          className="p-3.5 text-left rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-2.5 font-bold text-xs text-slate-900 dark:text-white">Prop Firm Guard</div>
          <p className="text-[11px] text-slate-500 mt-0.5">FTMO daily loss & simulator</p>
        </button>

        <button
          onClick={() => onNavigate('market')}
          className="p-3.5 text-left rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-2.5 font-bold text-xs text-slate-900 dark:text-white">Session Overlaps</div>
          <p className="text-[11px] text-slate-500 mt-0.5">London / NY golden hours</p>
        </button>

        <button
          onClick={() => onNavigate('journal')}
          className="p-3.5 text-left rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-2.5 font-bold text-xs text-slate-900 dark:text-white">Webhook Bridge</div>
          <p className="text-[11px] text-slate-500 mt-0.5">TradingView alert auto-sync</p>
        </button>
      </div>

      {/* Empty State when 0 real trades are present */}
      {!hasTrades ? (
        <div className="p-8 sm:p-12 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
            <Compass className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ready for Your Trading History
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              No trades are recorded in your ledger yet. Import your real MetaTrader 4/5, cTrader, or broker statement CSV to compute deterministic win rates, drawdown, and unlock personalized AI coaching.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import MT4 / MT5 Statement</span>
            </button>

            <button
              onClick={() => onNavigate('journal')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Live Trade</span>
            </button>

            <button
              onClick={() => onNavigate('market')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Explore TradingView Live Charts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto text-xs text-slate-500">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">1. Export from Platform</div>
              <p className="text-[11px] leading-relaxed">In MT4/MT5, right-click Account History &gt; Save as Detailed Report.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">2. Safe Client Validation</div>
              <p className="text-[11px] leading-relaxed">Ticket IDs are validated and deduplicated. We never ask for broker logins.</p>
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">3. Genuine Coaching</div>
              <p className="text-[11px] leading-relaxed">The AI Coach pinpoints your real session leaks, tilt patterns, and expectancy.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Card 1: Net P/L */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Net Profit / Loss</div>
              <div className={`mt-1 text-lg font-bold font-mono tabular-nums ${isNetPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {isNetPositive ? `+$${metrics.netPnl.toFixed(2)}` : `-$${Math.abs(metrics.netPnl).toFixed(2)}`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">After fees & swaps</div>
            </div>

            {/* Card 2: Win Rate */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Win Rate</div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {metrics.winRate}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {metrics.winningTrades}W · {metrics.losingTrades}L · {metrics.breakevenTrades}BE
              </div>
            </div>

            {/* Card 3: Profit Factor */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Profit Factor</div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {metrics.profitFactor ? metrics.profitFactor : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Gross Win / Gross Loss</div>
            </div>

            {/* Card 4: Avg R-Multiple */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Avg R-Multiple</div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {metrics.avgRMultiple != null ? `${metrics.avgRMultiple > 0 ? '+' : ''}${metrics.avgRMultiple}R` : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Realized reward/risk</div>
            </div>

            {/* Card 5: Max Drawdown */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Max Drawdown</div>
              <div className="mt-1 text-lg font-bold text-rose-500 dark:text-rose-400 font-mono tabular-nums">
                -{metrics.maxDrawdownPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">-${metrics.maxDrawdownAmount.toFixed(2)} peak-trough</div>
            </div>

            {/* Card 6: Expectancy */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Trade Expectancy</div>
              <div className={`mt-1 text-lg font-bold font-mono tabular-nums ${metrics.expectancy >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {metrics.expectancy >= 0 ? `+$${metrics.expectancy.toFixed(2)}` : `-$${Math.abs(metrics.expectancy).toFixed(2)}`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Average profit/trade</div>
            </div>
          </div>

          {/* Main Grid: Equity Curve (2 cols) + AI Coach Quick Insight (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Equity Curve Card */}
            <div className="lg:col-span-2 p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Account Equity Curve</h2>
                  <p className="text-xs text-slate-500">Continuous account balance over sequence of closed trades</p>
                </div>
                <button
                  onClick={() => onNavigate('journal')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  View Journal <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <EquityCurveChart trades={trades} initialBalance={10000} />
            </div>

            {/* AI Performance Coach Spotlight */}
            <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Coach Behavioral Digest</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Grounded</span>
                </div>

                <div className="mt-3.5 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">Tilt & Consecutive Loss Pattern</div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Win rate after 2 consecutive losses: <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-200">{metrics.consecutiveLossAnalysis.winRateAfterTwoLosses}%</strong> across {metrics.consecutiveLossAnalysis.tradesAfterTwoLosses} trades.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">Top Pair Expectancy</div>
                    <p className="text-slate-500 dark:text-slate-400">
                      {metrics.pnlByPair[0]?.symbol || 'Your primary pair'} generated {metrics.pnlByPair[0]?.winRate || 0}% win rate with net result of ${metrics.pnlByPair[0]?.netPnl?.toFixed(2) || '0.00'}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => onNavigate('coach')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Open AI Coach Diagnostic Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Analytics Row: P/L by Pair + Trading Sessions + R-Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Performance by Pair</h3>
                <span className="text-[11px] text-slate-500">Net Profit</span>
              </div>
              <PairBarChart data={metrics.pnlByPair} />
            </div>

            <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Session Breakdown</h3>
                <span className="text-[11px] text-slate-500">UTC Timeline</span>
              </div>

              <div className="space-y-3">
                {metrics.pnlBySession.map((s) => {
                  const isPos = s.netPnl >= 0;
                  return (
                    <div key={s.session} className="p-2.5 rounded bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/50 text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-800 dark:text-slate-200">{s.session}</span>
                        <span className={`font-mono tabular-nums ${isPos ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                          {isPos ? `+$${s.netPnl.toFixed(2)}` : `-$${Math.abs(s.netPnl).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>{s.trades} trades</span>
                        <span>·</span>
                        <span>Win rate: <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{s.winRate}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">R-Multiple Distribution</h3>
                <span className="text-[11px] text-slate-500">Risk Normalized</span>
              </div>

              <div className="space-y-2">
                {metrics.rDistribution.map((item) => {
                  const maxCount = Math.max(...metrics.rDistribution.map((r) => r.count), 1);
                  const barWidth = (item.count / maxCount) * 100;
                  const isWinner = item.bucket.includes('+');

                  return (
                    <div key={item.bucket} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">{item.bucket}</span>
                        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                          {item.count} trade{item.count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all duration-300 ${isWinner ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
