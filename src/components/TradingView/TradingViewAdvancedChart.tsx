import React, { useEffect, useRef } from 'react';

interface TradingViewAdvancedChartProps {
  symbol?: string; // e.g., 'FX:EURUSD', 'FX:GBPUSD', 'OANDA:XAUUSD'
  theme?: 'dark' | 'light';
  interval?: string; // '1', '5', '15', '60', '240', 'D', 'W'
  height?: number | string;
}

export const TradingViewAdvancedChart: React.FC<TradingViewAdvancedChartProps> = ({
  symbol = 'FX:EURUSD',
  theme = 'dark',
  interval = '60',
  height = 780,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize symbol for TradingView: e.g. "EUR/USD" -> "FX:EURUSD", "XAU/USD" -> "OANDA:XAUUSD"
  const formattedSymbol = (() => {
    if (symbol.includes(':')) return symbol;
    const clean = symbol.replace('/', '').toUpperCase();
    if (clean === 'XAUUSD') return 'OANDA:XAUUSD';
    return `FX:${clean}`;
  })();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: formattedSymbol,
      interval: interval,
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1', // Candlestick style
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: false,
      studies: [
        'STD;EMA',
        'STD;RSI'
      ],
      support_host: 'https://www.tradingview.com',
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [formattedSymbol, theme, interval, height]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-all">
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />
    </div>
  );
};
