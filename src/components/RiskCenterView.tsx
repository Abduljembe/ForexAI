import React, { useState } from 'react';
import { MarketQuote, RiskSettings } from '../types/forex';
import { PropFirmGuard } from './PropFirmGuard';
import {
  ShieldAlert,
  ShieldCheck,
  Calculator,
  AlertTriangle,
  Flame,
  Layers,
  Sliders,
  DollarSign,
  TrendingDown,
  Info,
  Award,
} from 'lucide-react';

interface RiskCenterViewProps {
  quotes: MarketQuote[];
  riskSettings: RiskSettings;
  onUpdateRiskSettings: (newSettings: RiskSettings) => void;
  currentEquity: number;
}

export const RiskCenterView: React.FC<RiskCenterViewProps> = ({
  quotes,
  riskSettings,
  onUpdateRiskSettings,
  currentEquity,
}) => {
  const [riskTab, setRiskTab] = useState<'prop_firm' | 'calculators'>('prop_firm');

  // Position Sizing Calculator state
  const [calcBalance, setCalcBalance] = useState<number>(riskSettings.accountBalance);
  const [calcRiskPercent, setCalcRiskPercent] = useState<number>(riskSettings.maxRiskPerTradePercent);
  const [calcStopPips, setCalcStopPips] = useState<number>(25);
  const [calcSymbol, setCalcSymbol] = useState<string>('EUR/USD');

  // Pip Calculator state
  const [pipSymbol, setPipSymbol] = useState<string>('EUR/USD');
  const [pipLots, setPipLots] = useState<number>(1.0);

  // Risk of Ruin Simulator state
  const [simWinRate, setSimWinRate] = useState<number>(50);
  const [simRiskPerTrade, setSimRiskPerTrade] = useState<number>(2.0);
  const [simRewardRatio, setSimRewardRatio] = useState<number>(1.5);

  const selectedQuote = quotes.find((q) => q.symbol === calcSymbol) || quotes[0];
  const pipVal = selectedQuote.pipValueStandardLot || 10;

  // Position Sizing math
  const dollarRisk = calcBalance * (calcRiskPercent / 100);
  const positionLots =
    calcStopPips > 0 && pipVal > 0 ? dollarRisk / (calcStopPips * pipVal) : 0;

  // Pip Value math
  const selectedPipQuote = quotes.find((q) => q.symbol === pipSymbol) || quotes[0];
  const standardPipVal = selectedPipQuote.pipValueStandardLot;
  const miniPipVal = standardPipVal / 10;
  const microPipVal = standardPipVal / 100;

  // Risk of Ruin Approximation
  // Formula: ((1 - (Edge)) / (1 + (Edge))) ^ (Units of Capital)
  // Edge approximation: (WinRate * R - (1 - WinRate))
  const winP = simWinRate / 100;
  const lossP = 1 - winP;
  const edge = winP * simRewardRatio - lossP;
  let riskOfRuinPercent = 0;
  if (edge <= 0) {
    riskOfRuinPercent = 100;
  } else {
    const ruinBase = (1 - edge) / (1 + edge);
    const capitalUnits = 100 / simRiskPerTrade;
    riskOfRuinPercent = Math.min(100, Math.max(0, Math.pow(Math.max(0, ruinBase), capitalUnits / 4) * 100));
  }

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Professional Risk Management Centre
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Capital Preservation Architecture</span>
            <span>·</span>
            <span>Position Math & Correlated Exposure</span>
            <span>·</span>
            <span className="text-slate-400">Strict Capital Limits</span>
          </div>
        </div>

        {/* Risk Guard Active Badge & Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>Trading Risk Guard:</span>
            <button
              onClick={() =>
                onUpdateRiskSettings({
                  ...riskSettings,
                  riskGuardEnabled: !riskSettings.riskGuardEnabled,
                })
              }
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                riskSettings.riskGuardEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  riskSettings.riskGuardEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Risk Guard Banner */}
      {riskSettings.riskGuardEnabled && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Active Risk Guard Limits:</strong> Max {riskSettings.maxRiskPerTradePercent}% risk/trade · Max{' '}
              {riskSettings.maxDailyLossPercent}% daily drawdown · Max {riskSettings.maxOpenRiskPercent}% open correlated exposure.
            </span>
          </div>
          <span className="text-[10px] font-mono opacity-80">Enforced Locally</span>
        </div>
      )}

      {/* Risk Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setRiskTab('prop_firm')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            riskTab === 'prop_firm'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Prop Firm Challenge Guard (FTMO / MFF)</span>
        </button>

        <button
          onClick={() => setRiskTab('calculators')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            riskTab === 'calculators'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Sizing, Pips & Risk-of-Ruin Simulator</span>
        </button>
      </div>

      {riskTab === 'prop_firm' ? (
        <PropFirmGuard currentBalance={currentEquity} />
      ) : (
        /* Primary Grid: Position Sizer (Left 6) + Pip & Correlation (Right 6) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Position Sizing Calculator (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span>Position Size & Lot Calculator</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Account Balance ($)</label>
                <input
                  type="number"
                  value={calcBalance}
                  onChange={(e) => setCalcBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Risk Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcRiskPercent}
                  onChange={(e) => setCalcRiskPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Currency Pair</label>
                <select
                  value={calcSymbol}
                  onChange={(e) => setCalcSymbol(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                >
                  {quotes.map((q) => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Stop Loss (Pips)</label>
                <input
                  type="number"
                  value={calcStopPips}
                  onChange={(e) => setCalcStopPips(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Calculated Position Results Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Monetary Risk Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  ${dollarRisk.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Pip Value per Standard Lot:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ${pipVal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-base">
                <span className="font-sans font-semibold text-blue-600 dark:text-blue-400">
                  Calculated Standard Lots:
                </span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">
                  {positionLots.toFixed(2)} Lots
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              <strong>Calculation Rule:</strong>{' '}
              <code className="text-slate-700 dark:text-slate-300 font-mono">
                (Balance × Risk %) ÷ (Stop Pips × Pip Value per Lot)
              </code>
              . Result is an estimate subject to broker contract size and live exchange rates.
            </div>
          </div>

          {/* Correlated Exposure Matrix Warning */}
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Correlated Currency Exposure Check</span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Forex pairs share common reserve currencies. Holding long EUR/USD and long GBP/USD simultaneously doubles your short USD exposure.
            </p>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs space-y-1.5 text-amber-900 dark:text-amber-300">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>USD Concentration Warning</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                If you have active open trades on <strong>EUR/USD Long</strong> and <strong>AUD/USD Long</strong>, a sudden hawkish US Dollar shock will impact both positions simultaneously.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pip Calculator & Risk-of-Ruin (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pip Value Across Lot Sizes */}
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Pip Value Matrix
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Pair</label>
                <select
                  value={pipSymbol}
                  onChange={(e) => setPipSymbol(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                >
                  {quotes.map((q) => (
                    <option key={q.symbol} value={q.symbol}>
                      {q.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Volume (Lots)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pipLots}
                  onChange={(e) => setPipLots(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[10px] font-sans text-slate-500">Standard Lot (100k)</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  ${(standardPipVal * pipLots).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">/ pip</div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[10px] font-sans text-slate-500">Mini Lot (10k)</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  ${(miniPipVal * pipLots).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">/ pip</div>
              </div>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[10px] font-sans text-slate-500">Micro Lot (1k)</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  ${(microPipVal * pipLots).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">/ pip</div>
              </div>
            </div>
          </div>

          {/* Risk of Ruin Educational Simulator */}
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Risk-of-Ruin Educational Simulator</span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Simulates probability of hitting 50% account drawdown ruin over 500 trades based on your strategy edge and risk per trade.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Win Rate (%)</label>
                <input
                  type="number"
                  value={simWinRate}
                  onChange={(e) => setSimWinRate(parseFloat(e.target.value) || 10)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Reward : Risk</label>
                <input
                  type="number"
                  step="0.1"
                  value={simRewardRatio}
                  onChange={(e) => setSimRewardRatio(parseFloat(e.target.value) || 0.5)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Risk / Trade (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={simRiskPerTrade}
                  onChange={(e) => setSimRiskPerTrade(parseFloat(e.target.value) || 0.5)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono tabular-nums text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Ruin Probability Badge */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Calculated Probability of Ruin
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Over 500 consecutive trades
                </div>
              </div>

              <div
                className={`text-xl font-bold font-mono tabular-nums ${
                  riskOfRuinPercent < 5
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : riskOfRuinPercent < 25
                    ? 'text-amber-500'
                    : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {riskOfRuinPercent < 0.1 ? '< 0.1%' : `${riskOfRuinPercent.toFixed(1)}%`}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
