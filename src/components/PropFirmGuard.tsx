import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Award, Target, Calculator, Info } from 'lucide-react';
import { PropFirmSettings, Trade } from '../types/forex';

interface PropFirmGuardProps {
  currentBalance: number;
  trades?: Trade[];
}

export const PropFirmGuard: React.FC<PropFirmGuardProps> = ({ currentBalance = 100000, trades = [] }) => {
  const [firm, setFirm] = useState<string>('FTMO');
  const [phase, setPhase] = useState<'Phase 1' | 'Phase 2' | 'Funded'>('Phase 1');
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [startOfDayEquity, setStartOfDayEquity] = useState<number>(100000);
  const [currentEquity, setCurrentEquity] = useState<number>(currentBalance || 102450);
  const [activeTradingDays, setActiveTradingDays] = useState<number>(4);
  const [minTradingDays, setMinTradingDays] = useState<number>(4);

  // Prop firm rule limits
  const maxDailyLossPercent = firm === 'FundedNext' ? 5.0 : 5.0; // 5%
  const maxTotalLossPercent = 10.0; // 10%
  const profitTargetPercent = phase === 'Phase 1' ? 10.0 : phase === 'Phase 2' ? 5.0 : 0; // 0 for funded

  // Calculations
  const dailyLossLimitDollars = startOfDayEquity * (maxDailyLossPercent / 100);
  const dailyLossBreachLevel = startOfDayEquity - dailyLossLimitDollars;
  const currentDailyPnl = currentEquity - startOfDayEquity;
  const remainingDailyBuffer = dailyLossLimitDollars + currentDailyPnl;

  const totalLossLimitDollars = accountSize * (maxTotalLossPercent / 100);
  const totalAccountBreachLevel = accountSize - totalLossLimitDollars;
  const totalAccountPnl = currentEquity - accountSize;
  const totalAccountPnlPercent = (totalAccountPnl / accountSize) * 100;
  const remainingTotalBuffer = totalLossLimitDollars + totalAccountPnl;

  const profitTargetDollars = accountSize * (profitTargetPercent / 100);
  const profitTargetProgressPercent =
    profitTargetDollars > 0 ? Math.min(100, Math.max(0, (totalAccountPnl / profitTargetDollars) * 100)) : 100;

  // Simulator inputs
  const [simLots, setSimLots] = useState<number>(1.0);
  const [simStopPips, setSimStopPips] = useState<number>(25);
  const [simPipValue, setSimPipValue] = useState<number>(10.0);

  const potentialTradeLoss = simLots * simStopPips * simPipValue;
  const willBreachDaily = potentialTradeLoss > remainingDailyBuffer;
  const willBreachTotal = potentialTradeLoss > remainingTotalBuffer;
  const postTradeDailyBuffer = remainingDailyBuffer - potentialTradeLoss;

  const isDailyBreached = remainingDailyBuffer <= 0;
  const isTotalBreached = remainingTotalBuffer <= 0;
  const isTargetAchieved = phase !== 'Funded' && totalAccountPnl >= profitTargetDollars;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Prop Firm Evaluation & Drawdown Guard</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily drawdown tracking, FTMO/FundedNext compliance, and pre-trade breach simulation
          </p>
        </div>

        {/* Firm & Phase Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={firm}
            onChange={(e) => setFirm(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="FTMO">FTMO Evaluation</option>
            <option value="FundedNext">FundedNext Stellar</option>
            <option value="TheFundedTrader">The Funded Trader</option>
            <option value="AlphaCapital">Alpha Capital</option>
            <option value="Custom">Custom Prop Rules</option>
          </select>

          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value as any)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="Phase 1">Phase 1 (10% Target)</option>
            <option value="Phase 2">Phase 2 (5% Target)</option>
            <option value="Funded">Funded Master Account</option>
          </select>

          <select
            value={accountSize}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setAccountSize(val);
              setStartOfDayEquity(val);
              setCurrentEquity(val);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400"
          >
            <option value={10000}>$10,000</option>
            <option value={25000}>$25,000</option>
            <option value={50000}>$50,000</option>
            <option value={100000}>$100,000</option>
            <option value={200000}>$200,000</option>
          </select>
        </div>
      </div>

      {/* Primary KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Max Daily Loss */}
        <div
          className={`p-4 rounded-xl border ${
            isDailyBreached
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              : remainingDailyBuffer < dailyLossLimitDollars * 0.3
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Max Daily Loss (5%)</span>
            {isDailyBreached ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> BREACHED
              </span>
            ) : (
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SAFE
              </span>
            )}
          </div>
          <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
            ${remainingDailyBuffer.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Buffer remaining today</span>
            <span className="font-mono">Hard stop: ${dailyLossBreachLevel.toFixed(0)}</span>
          </div>
        </div>

        {/* Card 2: Max Total Drawdown */}
        <div
          className={`p-4 rounded-xl border ${
            isTotalBreached
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Max Total Drawdown (10%)</span>
            {isTotalBreached ? (
              <span className="text-rose-600 font-bold">TERMINATED</span>
            ) : (
              <span className="text-emerald-500 font-bold">PASSING</span>
            )}
          </div>
          <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
            ${remainingTotalBuffer.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Allowed loss remaining</span>
            <span className="font-mono">Floor: ${totalAccountBreachLevel.toFixed(0)}</span>
          </div>
        </div>

        {/* Card 3: Profit Target Progress */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {phase === 'Funded' ? 'Profit Share (80%)' : `Profit Target (${profitTargetPercent}%)`}
            </span>
            <span className="text-blue-500 font-bold">
              {phase === 'Funded' ? 'Active' : `${profitTargetProgressPercent.toFixed(1)}%`}
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {totalAccountPnl >= 0 ? `+$${totalAccountPnl.toFixed(2)}` : `-$${Math.abs(totalAccountPnl).toFixed(2)}`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{phase === 'Funded' ? 'Net PnL accumulated' : `Target: +$${profitTargetDollars.toFixed(0)}`}</span>
            <span className="font-mono">({totalAccountPnlPercent >= 0 ? '+' : ''}{totalAccountPnlPercent.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Card 4: Minimum Trading Days */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Trading Days</span>
            <span className="text-emerald-500 font-bold">
              {activeTradingDays >= minTradingDays ? 'COMPLETED' : 'IN PROGRESS'}
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
            {activeTradingDays} / {minTradingDays} Days
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Requirement satisfied</span>
            <span className="font-mono">Min: {minTradingDays}d</span>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      {phase !== 'Funded' && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Evaluation Target Progress: ${Math.max(0, totalAccountPnl).toFixed(2)} / ${profitTargetDollars.toFixed(2)}
            </span>
            <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
              {isTargetAchieved ? '🎯 TARGET PASSED' : `${(profitTargetDollars - Math.max(0, totalAccountPnl)).toFixed(2)} remaining`}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isTargetAchieved ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, profitTargetProgressPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* Pre-Trade Violation Simulator */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span>Pre-Trade Breach Simulator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate proposed position sizing against today's drawdown buffer before placing the trade
            </p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              willBreachDaily || willBreachTotal
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {willBreachDaily || willBreachTotal ? '⚠️ VIOLATION DETECTED' : '✅ EXECUTION COMPLIANT'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Position Size (Lots)</label>
            <input
              type="number"
              step="0.01"
              value={simLots}
              onChange={(e) => setSimLots(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Stop Loss Distance (Pips)</label>
            <input
              type="number"
              step="1"
              value={simStopPips}
              onChange={(e) => setSimStopPips(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pip Value ($ per 1.0 Lot)</label>
            <input
              type="number"
              step="0.5"
              value={simPipValue}
              onChange={(e) => setSimPipValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Simulation Output Card */}
        <div
          className={`p-4 rounded-lg border text-xs font-mono ${
            willBreachDaily
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] uppercase font-sans text-slate-400">Potential Trade Loss</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                ${potentialTradeLoss.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-sans text-slate-400">Daily Buffer Remaining If Stopped Out</div>
              <div
                className={`text-base font-bold mt-0.5 ${
                  postTradeDailyBuffer <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-500'
                }`}
              >
                ${postTradeDailyBuffer.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-sans text-slate-400">Compliance Verdict</div>
              <div className="text-xs font-sans font-bold mt-1">
                {willBreachDaily ? (
                  <span className="text-rose-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> REJECT: Exceeds daily loss buffer by ${(potentialTradeLoss - remainingDailyBuffer).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASS: Leaves ${(postTradeDailyBuffer).toFixed(2)} daily cushion
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
