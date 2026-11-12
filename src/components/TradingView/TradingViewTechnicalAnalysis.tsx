import React, { useEffect, useRef } from 'react';

interface TradingViewTechnicalAnalysisProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  interval?: string; // '1m', '5m', '15m', '1h', '4h', '1D'
}

export const TradingViewTechnicalAnalysis: React.FC<TradingViewTechnicalAnalysisProps> = ({
  symbol = 'FX:EURUSD',
  theme = 'dark',
  interval = '1h',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const formattedSymbol = (() => {
    if (symbol.includes(':')) return symbol;
    const clean = symbol.replace('/', '').toUpperCase();
    if (clean === 'XAUUSD') return 'OANDA:XAUUSD';
    return `FX:${clean}`;
  })();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify({
      interval: interval,
      width: '100%',
      isTransparent: true,
      height: '100%',
      symbol: formattedSymbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: theme,
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [formattedSymbol, theme, interval]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2">
      <div ref={containerRef} className="tradingview-widget-container w-full h-full" />
    </div>
  );
};
