import React, { useEffect, useRef } from 'react';

interface TradingViewEconomicCalendarProps {
  theme?: 'dark' | 'light';
  height?: number | string;
}

export const TradingViewEconomicCalendar: React.FC<TradingViewEconomicCalendarProps> = ({
  theme = 'dark',
  height = 480,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify({
      colorTheme: theme,
      isTransparent: true,
      width: '100%',
      height: '100%',
      locale: 'en',
      importanceFilter: '0,1', // High and medium impact events
      countryFilter: 'us,eu,gb,jp,ch,ca,au,nz',
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2">
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />
    </div>
  );
};
