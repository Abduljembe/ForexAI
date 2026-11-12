import React from 'react';

interface PairBarChartProps {
  data: { symbol: string; trades: number; netPnl: number; winRate: number }[];
}

export const PairBarChart: React.FC<PairBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-xs text-slate-500 py-6 text-center">No pair data available.</div>;
  }

  const maxAbsPnl = Math.max(...data.map((d) => Math.abs(d.netPnl)), 100);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const isPositive = item.netPnl >= 0;
        const widthPercent = (Math.abs(item.netPnl) / maxAbsPnl) * 100;

        return (
          <div key={item.symbol} className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{item.symbol}</span>
                <span className="text-slate-500">({item.trades} trades)</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Win Rate: <strong className="font-mono tabular-nums text-slate-300">{item.winRate}%</strong></span>
              </div>
              <span className={`font-mono tabular-nums font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? `+$${item.netPnl.toFixed(2)}` : `-$${Math.abs(item.netPnl).toFixed(2)}`}
              </span>
            </div>

            {/* Centered zero bar layout */}
            <div className="h-2 w-full bg-slate-800/80 rounded flex overflow-hidden">
              <div className="w-1/2 flex justify-end">
                {!isPositive && (
                  <div
                    className="h-full bg-rose-500 rounded-l transition-all duration-300"
                    style={{ width: `${Math.min(widthPercent, 100)}%` }}
                  />
                )}
              </div>
              <div className="w-px bg-slate-600 h-full" />
              <div className="w-1/2 flex justify-start">
                {isPositive && (
                  <div
                    className="h-full bg-emerald-500 rounded-r transition-all duration-300"
                    style={{ width: `${Math.min(widthPercent, 100)}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
