import React, { useState } from 'react';
import { Trade } from '../../types/forex';

interface EquityCurveChartProps {
  trades: Trade[];
  initialBalance?: number;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ trades, initialBalance = 10000 }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    balance: number;
    tradeNum: number;
    pnl: number;
    date: string;
    symbol: string;
  } | null>(null);

  const closedTrades = [...trades]
    .filter((t) => t.closeTime && t.exitPrice)
    .sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

  if (closedTrades.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-500 border border-dashed border-slate-700/50 rounded-lg">
        No closed trades available to render equity curve.
      </div>
    );
  }

  // Calculate curve points
  let currentBalance = initialBalance;
  const points = [{ balance: initialBalance, pnl: 0, date: 'Start', symbol: 'Account Base' }];

  closedTrades.forEach((t) => {
    currentBalance += t.netPnl;
    points.push({
      balance: currentBalance,
      pnl: t.netPnl,
      date: new Date(t.closeTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      symbol: t.symbol,
    });
  });

  const balances = points.map((p) => p.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const balanceRange = maxBalance - minBalance || 1000;
  const padding = balanceRange * 0.1;

  const yMin = minBalance - padding;
  const yMax = maxBalance + padding;

  const svgWidth = 800;
  const svgHeight = 240;

  const getX = (index: number) => (index / (points.length - 1 || 1)) * (svgWidth - 60) + 40;
  const getY = (val: number) => svgHeight - 30 - ((val - yMin) / (yMax - yMin)) * (svgHeight - 60);

  // Path string
  const pathD = points.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.balance);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Fill gradient area
  const areaD = `${pathD} L ${getX(points.length - 1)} ${svgHeight - 30} L ${getX(0)} ${svgHeight - 30} Z`;

  const isNetPositive = currentBalance >= initialBalance;
  const strokeColor = isNetPositive ? '#10B981' : '#F43F5E';
  const fillColor = isNetPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Initial: <strong className="text-slate-200 font-mono tabular-nums">${initialBalance.toLocaleString()}</strong></span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">Current: <strong className={`font-mono tabular-nums ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">Trades: <strong className="text-slate-200 font-mono tabular-nums">{closedTrades.length}</strong></span>
        </div>
        <span className="text-xs text-slate-500">Deterministic balance curve</span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="40" y1={getY(initialBalance)} x2={svgWidth - 20} y2={getY(initialBalance)} stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
          <text x="35" y={getY(initialBalance) + 4} fill="#64748B" fontSize="10" textAnchor="end" className="font-mono tabular-nums">
            ${Math.round(initialBalance).toLocaleString()}
          </text>
          <text x="35" y={getY(yMax) + 12} fill="#64748B" fontSize="10" textAnchor="end" className="font-mono tabular-nums">
            ${Math.round(yMax).toLocaleString()}
          </text>
          <text x="35" y={getY(yMin) - 4} fill="#64748B" fontSize="10" textAnchor="end" className="font-mono tabular-nums">
            ${Math.round(yMin).toLocaleString()}
          </text>

          {/* Area fill */}
          <path d={areaD} fill="url(#equityGradient)" />

          {/* Line path */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.balance);
            return (
              <g key={idx} onMouseEnter={() => setHoveredPoint({ x, y, balance: p.balance, tradeNum: idx, pnl: p.pnl, date: p.date, symbol: p.symbol })}>
                <circle cx={x} cy={y} r="3.5" fill="#0F172A" stroke={strokeColor} strokeWidth="2" className="hover:r-5 transition-all" />
              </g>
            );
          })}

          {/* Hover crosshair */}
          {hoveredPoint && (
            <g>
              <line x1={hoveredPoint.x} y1="10" x2={hoveredPoint.x} y2={svgHeight - 30} stroke="#94A3B8" strokeDasharray="2 2" strokeWidth="1" />
              <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" fill={strokeColor} />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 shadow-xl text-xs z-20"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100 - 35}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-medium text-slate-200">
              {hoveredPoint.tradeNum === 0 ? 'Starting Balance' : `Trade #${hoveredPoint.tradeNum} · ${hoveredPoint.symbol}`}
            </div>
            <div className="flex items-center gap-2 mt-0.5 font-mono tabular-nums text-slate-400">
              <span>Balance: <strong className="text-white">${hoveredPoint.balance.toFixed(2)}</strong></span>
              {hoveredPoint.tradeNum > 0 && (
                <span className={hoveredPoint.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {hoveredPoint.pnl >= 0 ? `+$${hoveredPoint.pnl.toFixed(2)}` : `-$${Math.abs(hoveredPoint.pnl).toFixed(2)}`}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{hoveredPoint.date}</div>
          </div>
        )}
      </div>
    </div>
  );
};
