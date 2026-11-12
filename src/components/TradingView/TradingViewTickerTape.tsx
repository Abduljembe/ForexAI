import React, { useEffect, useRef } from 'react';

interface TradingViewTickerTapeProps {
  theme?: 'dark' | 'light';
}

export const TradingViewTickerTape: React.FC<TradingViewTickerTapeProps> = ({
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
        { proName: 'FX_IDC:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX_IDC:USDJPY', title: 'USD/JPY' },
        { proName: 'FX_IDC:AUDUSD', title: 'AUD/USD' },
        { proName: 'FX_IDC:USDCAD', title: 'USD/CAD' },
        { proName: 'FX_IDC:USDCHF', title: 'USD/CHF' },
        { proName: 'FX_IDC:EURGBP', title: 'EUR/GBP' },
        { proName: 'OANDA:XAUUSD', title: 'XAU/USD (Gold)' },
      ],
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en',
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-1 mb-4">
      <div ref={containerRef} className="tradingview-widget-container w-full" />
    </div>
  );
};
