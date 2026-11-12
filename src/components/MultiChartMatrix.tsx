import React, { useState } from 'react';
import { TradingViewAdvancedChart } from './TradingView/TradingViewAdvancedChart';
import { LayoutGrid, Columns, Rows, Maximize2, Minimize2, Sparkles, RefreshCw } from 'lucide-react';

interface MultiChartMatrixProps {
  darkMode?: boolean;
}

interface ChartPane {
  id: string;
  symbol: string;
  timeframe: string;
}

export const MultiChartMatrix: React.FC<MultiChartMatrixProps> = ({ darkMode = true }) => {
  const [layout, setLayout] = useState<'2-col' | '2-row' | '4-grid'>('2-col');
  const [paneHeight, setPaneHeight] = useState<number>(680);
  const [focusedPaneId, setFocusedPaneId] = useState<string | null>(null);

  const [panes, setPanes] = useState<ChartPane[]>([
    { id: 'pane-1', symbol: 'EUR/USD', timeframe: '60' },
    { id: 'pane-2', symbol: 'TVC:DXY', timeframe: '60' },
    { id: 'pane-3', symbol: 'GBP/USD', timeframe: '60' },
    { id: 'pane-4', symbol: 'OANDA:XAUUSD', timeframe: '60' },
  ]);

  const availableSymbols = [
    { label: 'EUR/USD (Euro / US Dollar)', value: 'EUR/USD' },
    { label: 'DXY (US Dollar Index)', value: 'TVC:DXY' },
    { label: 'GBP/USD (British Pound / USD)', value: 'GBP/USD' },
    { label: 'USD/JPY (US Dollar / Yen)', value: 'USD/JPY' },
    { label: 'XAU/USD (Gold / US Dollar)', value: 'OANDA:XAUUSD' },
    { label: 'AUD/USD (Aussie / US Dollar)', value: 'AUD/USD' },
    { label: 'USD/CAD (US Dollar / Loonie)', value: 'USD/CAD' },
    { label: 'USD/CHF (US Dollar / Swiss)', value: 'USD/CHF' },
    { label: 'EUR/GBP (Euro / Pound)', value: 'EUR/GBP' },
  ];

  const updatePaneSymbol = (id: string, newSymbol: string) => {
    setPanes((prev) => prev.map((p) => (p.id === id ? { ...p, symbol: newSymbol } : p)));
  };

  const updatePaneTimeframe = (id: string, newTf: string) => {
    setPanes((prev) => prev.map((p) => (p.id === id ? { ...p, timeframe: newTf } : p)));
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'eur-dxy') {
      setLayout('2-col');
      setPanes([
        { id: 'pane-1', symbol: 'EUR/USD', timeframe: '60' },
        { id: 'pane-2', symbol: 'TVC:DXY', timeframe: '60' },
        { id: 'pane-3', symbol: 'GBP/USD', timeframe: '60' },
        { id: 'pane-4', symbol: 'OANDA:XAUUSD', timeframe: '60' },
      ]);
    } else if (presetName === 'mtf-eur') {
      setLayout('2-col');
      setPanes([
        { id: 'pane-1', symbol: 'EUR/USD', timeframe: 'D' },
        { id: 'pane-2', symbol: 'EUR/USD', timeframe: '15' },
        { id: 'pane-3', symbol: 'GBP/USD', timeframe: '60' },
        { id: 'pane-4', symbol: 'OANDA:XAUUSD', timeframe: '60' },
      ]);
    } else if (presetName === 'majors-4') {
      setLayout('4-grid');
      setPanes([
        { id: 'pane-1', symbol: 'EUR/USD', timeframe: '60' },
        { id: 'pane-2', symbol: 'GBP/USD', timeframe: '60' },
        { id: 'pane-3', symbol: 'USD/JPY', timeframe: '60' },
        { id: 'pane-4', symbol: 'OANDA:XAUUSD', timeframe: '60' },
      ]);
    }
  };

  const visiblePanes = focusedPaneId
    ? panes.filter((p) => p.id === focusedPaneId)
    : layout === '4-grid'
    ? panes
    : panes.slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Matrix Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Preset Strategies */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('eur-dxy')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            EUR/USD vs DXY
          </button>
          <button
            onClick={() => applyPreset('mtf-eur')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            Multi-TF (D1 + M15)
          </button>
          <button
            onClick={() => applyPreset('majors-4')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            4 Majors Grid
          </button>
        </div>

        {/* Layout Mode & Height controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Height Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 px-2 font-medium">Height:</span>
            <button
              onClick={() => setPaneHeight(520)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                paneHeight === 520
                  ? 'bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              520px
            </button>
            <button
              onClick={() => setPaneHeight(680)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                paneHeight === 680
                  ? 'bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              680px
            </button>
            <button
              onClick={() => setPaneHeight(820)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                paneHeight === 820
                  ? 'bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              820px
            </button>
          </div>

          {/* Grid Layout Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setLayout('2-col');
                setFocusedPaneId(null);
              }}
              title="2-Column Side by Side"
              className={`p-1.5 rounded ${
                layout === '2-col' && !focusedPaneId
                  ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setLayout('2-row');
                setFocusedPaneId(null);
              }}
              title="2-Row Stacked"
              className={`p-1.5 rounded ${
                layout === '2-row' && !focusedPaneId
                  ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Rows className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setLayout('4-grid');
                setFocusedPaneId(null);
              }}
              title="4-Chart Matrix Grid"
              className={`p-1.5 rounded ${
                layout === '4-grid' && !focusedPaneId
                  ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {focusedPaneId && (
            <button
              onClick={() => setFocusedPaneId(null)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 rounded border border-blue-200 dark:border-blue-900"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Single Focus</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div
        className={`grid gap-4 ${
          focusedPaneId
            ? 'grid-cols-1'
            : layout === '4-grid'
            ? 'grid-cols-1 md:grid-cols-2'
            : layout === '2-col'
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {visiblePanes.map((pane, idx) => (
          <div
            key={pane.id}
            className="flex flex-col rounded-xl overflow-hidden bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            {/* Individual Pane Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center">
                  #{idx + 1}
                </span>
                <select
                  value={pane.symbol}
                  onChange={(e) => updatePaneSymbol(pane.id, e.target.value)}
                  className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {availableSymbols.map((s) => (
                    <option key={s.value} value={s.value} className="bg-white dark:bg-slate-900">
                      {s.label}
                    </option>
                  ))}
                </select>

                <select
                  value={pane.timeframe}
                  onChange={(e) => updatePaneTimeframe(pane.id, e.target.value)}
                  className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                >
                  <option value="5" className="bg-white dark:bg-slate-900">M5</option>
                  <option value="15" className="bg-white dark:bg-slate-900">M15</option>
                  <option value="60" className="bg-white dark:bg-slate-900">H1</option>
                  <option value="240" className="bg-white dark:bg-slate-900">H4</option>
                  <option value="D" className="bg-white dark:bg-slate-900">D1</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFocusedPaneId(focusedPaneId === pane.id ? null : pane.id)}
                  title={focusedPaneId === pane.id ? 'Restore Grid' : 'Maximize Chart'}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  {focusedPaneId === pane.id ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* TradingView Chart Embed */}
            <TradingViewAdvancedChart
              symbol={pane.symbol}
              theme={darkMode ? 'dark' : 'light'}
              interval={pane.timeframe}
              height={focusedPaneId ? Math.max(paneHeight, 780) : paneHeight}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
