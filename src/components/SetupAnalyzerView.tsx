import React, { useState } from 'react';
import { MarketQuote, RiskSettings } from '../types/forex';
import { TradingViewAdvancedChart } from './TradingView/TradingViewAdvancedChart';
import {
  Crosshair,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Calculator,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SetupAnalyzerViewProps {
  quotes: MarketQuote[];
  riskSettings: RiskSettings;
  onSaveAsJournalPlan: (setupData: any) => void;
  darkMode?: boolean;
}

export const SetupAnalyzerView: React.FC<SetupAnalyzerViewProps> = ({
  quotes,
  riskSettings,
  onSaveAsJournalPlan,
  darkMode = true,
}) => {
  const [symbol, setSymbol] = useState<string>('EUR/USD');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [timeframe, setTimeframe] = useState<string>('H1');
  const [entryPrice, setEntryPrice] = useState<number>(1.085);
  const [stopLoss, setStopLoss] = useState<number>(1.0825);
  const [takeProfit, setTakeProfit] = useState<number>(1.091);
  const [strategyTag, setStrategyTag] = useState<string>('Trend Pullback');
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [accountBalance, setAccountBalance] = useState<number>(riskSettings.accountBalance || 10000);
  const [showLiveChart, setShowLiveChart] = useState<boolean>(true);
  const [chartHeight, setChartHeight] = useState<number>(780); // Default to expansive 780px vertically

  // Confluence checklist state
  const [checkedConfluences, setCheckedConfluences] = useState<{ [key: string]: boolean }>({
    higherTimeframeTrend: true,
    keySupportResistance: true,
    noImmediateHighImpactNews: true,
    riskRewardAboveTwo: true,
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const selectedQuote = quotes.find((q) => q.symbol === symbol) || quotes[0];
  const pipMultiplier = selectedQuote.pipSize === 0.01 ? 100 : 10000;

  // Deterministic math
  const stopDistancePips = Math.abs(entryPrice - stopLoss) * pipMultiplier;
  const targetDistancePips = Math.abs(takeProfit - entryPrice) * pipMultiplier;
  const riskRewardRatio = stopDistancePips > 0 ? targetDistancePips / stopDistancePips : 0;

  const dollarRiskTarget = (accountBalance * (riskPercent / 100));
  const pipValuePerStandardLot = selectedQuote.pipValueStandardLot || 10;
  const calculatedLotSize =
    stopDistancePips > 0 && pipValuePerStandardLot > 0
      ? dollarRiskTarget / (stopDistancePips * pipValuePerStandardLot)
      : 0;

  // Rule verification checks
  const isRrAdequate = riskRewardRatio >= 1.5;
  const isRiskWithinLimit = riskPercent <= riskSettings.maxRiskPerTradePercent;

  const handleRunAiAudit = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const response = await fetch('/api/ai/setup-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setup: {
            symbol,
            direction,
            timeframe,
            entryPrice,
            stopLoss,
            takeProfit,
            strategyTag,
            confluences: checkedConfluences,
          },
          riskCalculation: {
            accountBalance,
            riskPercent,
            riskAmount: dollarRiskTarget.toFixed(2),
            stopPips: stopDistancePips.toFixed(1),
            targetPips: targetDistancePips.toFixed(1),
            rrRatio: `1:${riskRewardRatio.toFixed(2)}`,
            lotSize: calculatedLotSize.toFixed(2),
          },
        }),
      });

      const data = await response.json();
      setAiAnalysis(data.analysis || 'Analysis complete.');
    } catch (err) {
      console.error(err);
      setAiAnalysis('Error communicating with setup analyzer service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToJournal = () => {
    onSaveAsJournalPlan({
      symbol,
      side: direction,
      entryPrice,
      stopLoss,
      takeProfit,
      volume: parseFloat(calculatedLotSize.toFixed(2)),
      setupTag: strategyTag,
      preTradePlan: `Planned ${direction} on ${symbol} (${timeframe}) with ${strategyTag}. R:R 1:${riskRewardRatio.toFixed(2)}, risking $${dollarRiskTarget.toFixed(2)} (${riskPercent}%).`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Trade Setup Analyzer
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Pre-Trade Execution Checklist</span>
            <span>·</span>
            <span>Real TradingView Chart Context</span>
            <span>·</span>
            <span className="text-slate-400">Position Sizing & Quality Audit</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLiveChart(!showLiveChart)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {showLiveChart ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showLiveChart ? 'Hide Live Chart' : 'Show Live Chart'}</span>
          </button>

          <button
            onClick={handleRunAiAudit}
            disabled={isAnalyzing || stopDistancePips <= 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Audit Setup with AI</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Big TradingView Chart for the setup symbol */}
      {showLiveChart && (
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Live {symbol} Candlestick Context
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Bid: {selectedQuote.bid} · Ask: {selectedQuote.ask}
              </span>
            </div>

            {/* Quick Geometry Context Pills */}
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  direction === 'BUY'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {direction}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Entry: <span className="font-bold text-slate-900 dark:text-slate-100">{entryPrice}</span>
              </span>
              <span className="text-[11px] font-mono text-rose-500">
                SL: <strong>{stopLoss}</strong> (-{stopDistancePips.toFixed(1)}p)
              </span>
              <span className="text-[11px] font-mono text-emerald-500">
                TP: <strong>{takeProfit}</strong> (+{targetDistancePips.toFixed(1)}p)
              </span>
              <span className="text-[11px] font-mono font-bold text-blue-500">
                1:{riskRewardRatio.toFixed(2)}
              </span>
            </div>

            {/* Vertical Chart Height Controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 px-1.5 font-medium">Height:</span>
              <button
                type="button"
                onClick={() => setChartHeight(620)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  chartHeight === 620
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                620px
              </button>
              <button
                type="button"
                onClick={() => setChartHeight(780)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  chartHeight === 780
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                780px (Expanded)
              </button>
              <button
                type="button"
                onClick={() => setChartHeight(950)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  chartHeight === 950
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                950px (Cinema)
              </button>
            </div>
          </div>

          <TradingViewAdvancedChart
            symbol={symbol}
            theme={darkMode ? 'dark' : 'light'}
            interval="60"
            height={chartHeight}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Setup Inputs & Position Sizing (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-500" />
              <span>1. Trade Parameters & Geometry</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Currency Pair</label>
                <select
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value);
                    const q = quotes.find((x) => x.symbol === e.target.value);
                    if (q) setEntryPrice(q.bid);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
                >
                  {quotes.map((q) => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.symbol} ({q.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Order Direction</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setDirection('BUY')}
                    className={`py-1 text-xs font-bold rounded transition-colors ${
                      direction === 'BUY'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('SELL')}
                    className={`py-1 text-xs font-bold rounded transition-colors ${
                      direction === 'SELL'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    SELL / SHORT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="M5">M5 (5 Minutes)</option>
                  <option value="M15">M15 (15 Minutes)</option>
                  <option value="H1">H1 (1 Hour)</option>
                  <option value="H4">H4 (4 Hours)</option>
                  <option value="D1">D1 (Daily)</option>
                </select>
              </div>
            </div>

            {/* Price Levels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Proposed Entry Price</label>
                <input
                  type="number"
                  step="0.0001"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Stop Loss Price</label>
                <input
                  type="number"
                  step="0.0001"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums text-rose-500 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Take Profit Price</label>
                <input
                  type="number"
                  step="0.0001"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums text-emerald-500 dark:text-emerald-400"
                />
              </div>
            </div>

            {/* Strategy Tag & Risk Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Strategy Setup Tag</label>
                <select
                  value={strategyTag}
                  onChange={(e) => setStrategyTag(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Trend Pullback">Trend Pullback (50 EMA)</option>
                  <option value="London Breakout">London Breakout</option>
                  <option value="Liquidity Sweep">Liquidity Sweep / SFP</option>
                  <option value="Key Level Reversal">Key Level Reversal</option>
                  <option value="Asian Range Play">Asian Range Mean Reversion</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Account Balance ($)</label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Risk Limit (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Confluence Verification Checklist */}
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              2. Pre-Flight Discipline Checklist
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { id: 'higherTimeframeTrend', label: 'Aligned with H4/D1 market structure direction' },
                { id: 'keySupportResistance', label: 'Entry at significant support/resistance level or discount zone' },
                { id: 'noImmediateHighImpactNews', label: 'No high-impact central bank or CPI releases within 45 minutes' },
                { id: 'riskRewardAboveTwo', label: 'Take Profit target provides at least 1:2.0 risk-to-reward ratio' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={checkedConfluences[item.id] || false}
                    onChange={(e) =>
                      setCheckedConfluences({
                        ...checkedConfluences,
                        [item.id]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: Deterministic Position Sizing & AI Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Position Sizing & Metric Box */}
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>Deterministic Sizing Math</span>
              <Calculator className="w-4 h-4 text-slate-400" />
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums mb-4">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-500">Stop Distance</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {stopDistancePips.toFixed(1)} pips
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-500">Target Distance</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {targetDistancePips.toFixed(1)} pips
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-500">Risk-to-Reward</div>
                <div className={`text-base font-bold mt-0.5 ${isRrAdequate ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500'}`}>
                  1:{riskRewardRatio.toFixed(2)}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-500">Dollar Risk</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  ${dollarRiskTarget.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Calculated Lots Hero */}
            <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Recommended Position Size
              </div>
              <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                {calculatedLotSize > 0 ? calculatedLotSize.toFixed(2) : '0.00'} Lots
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Based on ${pipValuePerStandardLot}/pip for 1.0 standard lot
              </div>
            </div>

            {/* Warnings or Validations */}
            {!isRiskWithinLimit && (
              <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Proposed risk ({riskPercent}%) exceeds personal risk limit ({riskSettings.maxRiskPerTradePercent}%).</span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleSaveToJournal}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savedSuccess ? 'Saved to Pre-Trade Journal!' : 'Save as Pre-Trade Plan'}</span>
              </button>
            </div>
          </div>

          {/* AI Audit Output Box */}
          {aiAnalysis && (
            <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Setup Quality Audit</h3>
              </div>
              <div className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans">
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
