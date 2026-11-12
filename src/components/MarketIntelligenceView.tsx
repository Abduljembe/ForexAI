import React, { useState } from 'react';
import { MarketQuote } from '../types/forex';
import { TradingViewAdvancedChart } from './TradingView/TradingViewAdvancedChart';
import { TradingViewTechnicalAnalysis } from './TradingView/TradingViewTechnicalAnalysis';
import { TradingViewForexHeatMap } from './TradingView/TradingViewForexHeatMap';
import { TradingViewEconomicCalendar } from './TradingView/TradingViewEconomicCalendar';
import { TradingViewTickerTape } from './TradingView/TradingViewTickerTape';
import {
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Columns,
  Square,
} from 'lucide-react';

interface MarketIntelligenceViewProps {
  quotes: MarketQuote[];
  darkMode?: boolean;
}

export const MarketIntelligenceView: React.FC<MarketIntelligenceViewProps> = ({
  quotes,
  darkMode = true,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('EUR/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('60'); // '15', '60', '240', 'D'
  const [chartHeight, setChartHeight] = useState<number>(760); // 650, 760, 900
  const [layoutMode, setLayoutMode] = useState<'full' | 'split'>('full'); // Default to full-width expansive terminal
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'heatmap' | 'calendar'>('chart');

  const activeQuote = quotes.find((q) => q.symbol === selectedSymbol) || quotes[0];
  const tvTheme = darkMode ? 'dark' : 'light';

  const handleGenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const response = await fetch('/api/ai/market-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: activeQuote.symbol,
          currentPrice: activeQuote.bid,
          timeframe: selectedTimeframe === '60' ? 'H1' : selectedTimeframe === '240' ? 'H4' : 'D1',
          technicalData: activeQuote.timeframeLevels,
          calendarEvents: [],
        }),
      });

      const data = await response.json();
      setBriefing(data.briefing || 'No briefing returned.');
    } catch (err) {
      console.error(err);
      setBriefing('Unable to generate market briefing. Check connection.');
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const pairList = [
    { symbol: 'EUR/USD', tv: 'FX:EURUSD' },
    { symbol: 'GBP/USD', tv: 'FX:GBPUSD' },
    { symbol: 'USD/JPY', tv: 'FX:USDJPY' },
    { symbol: 'XAU/USD', tv: 'OANDA:XAUUSD' },
    { symbol: 'AUD/USD', tv: 'FX:AUDUSD' },
    { symbol: 'USD/CAD', tv: 'FX:USDCAD' },
    { symbol: 'USD/CHF', tv: 'FX:USDCHF' },
    { symbol: 'EUR/GBP', tv: 'FX:EURGBP' },
  ];

  return (
    <div className="space-y-5">
      {/* Real Ticker Tape */}
      <TradingViewTickerTape theme={tvTheme} />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>TradingView Live Market Terminal</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="text-emerald-500 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 inline" /> Verified Real-Time TradingView Feed
            </span>
            <span>·</span>
            <span>Live FXCM / OANDA Tick Data</span>
            <span>·</span>
            <span className="font-mono tabular-nums text-slate-400">
              {activeQuote.symbol}: {activeQuote.bid} / {activeQuote.ask}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main View Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'chart'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Advanced Chart
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'heatmap'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Currency Heatmap
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Economic Calendar
            </button>
          </div>

          <button
            onClick={handleGenerateBriefing}
            disabled={isGeneratingBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            {isGeneratingBriefing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>AI Briefing</span>
          </button>
        </div>
      </div>

      {/* Chart Workspace Controls Bar: Symbol Picker + Size & Layout Selectors */}
      {activeTab === 'chart' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Symbol Quick Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {pairList.map((p) => {
              const isSelected = p.symbol === selectedSymbol;
              return (
                <button
                  key={p.symbol}
                  onClick={() => {
                    setSelectedSymbol(p.symbol);
                    setBriefing(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {p.symbol}
                </button>
              );
            })}
          </div>

          {/* Size & Layout Controls */}
          <div className="flex items-center gap-3">
            {/* Chart Height Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 px-2 font-medium">Height:</span>
              <button
                onClick={() => setChartHeight(650)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  chartHeight === 650
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                650px
              </button>
              <button
                onClick={() => setChartHeight(760)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  chartHeight === 760
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                760px (Big)
              </button>
              <button
                onClick={() => setChartHeight(900)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  chartHeight === 900
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                900px (Cinema)
              </button>
            </div>

            {/* Layout Toggle: Full-Width vs Split */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setLayoutMode('full')}
                title="Full-Width Terminal View"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  layoutMode === 'full'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Width</span>
              </button>
              <button
                onClick={() => setLayoutMode('split')}
                title="Side-by-Side Split View"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  layoutMode === 'split'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart View */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          {layoutMode === 'full' ? (
            /* FULL-WIDTH TERMINAL: Giant expansive chart occupying 100% width */
            <div className="space-y-6">
              <TradingViewAdvancedChart
                symbol={selectedSymbol}
                theme={tvTheme}
                interval={selectedTimeframe}
                height={chartHeight}
              />

              {/* Bottom Technical Grid: Gauge, Key Levels, and AI Briefing */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Real TradingView Technical Analysis Gauge (5 cols) */}
                <div className="lg:col-span-5 p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Technical Sentiment Gauge ({selectedSymbol})
                    </h3>
                    <span className="text-[10px] text-slate-400">TradingView Live</span>
                  </div>
                  <TradingViewTechnicalAnalysis symbol={selectedSymbol} theme={tvTheme} />
                </div>

                {/* Live Calculated Institutional Levels & Metrics (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Institutional Support, Resistance & Pivot Matrix
                        </h3>
                        <p className="text-xs text-slate-500">
                          Deterministic price levels for {activeQuote.symbol} based on H1/H4 market structure
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        Spread: {activeQuote.spreadPips} pips
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 text-xs font-mono tabular-nums">
                      <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-center">
                        <div className="text-[10px] font-sans text-rose-600 dark:text-rose-400 font-bold uppercase">Resistance 2</div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{activeQuote.timeframeLevels.resistance2}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">Liquidity pool</div>
                      </div>

                      <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/30 text-center">
                        <div className="text-[10px] font-sans text-rose-600 dark:text-rose-400 font-bold uppercase">Resistance 1</div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{activeQuote.timeframeLevels.resistance1}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">Daily supply</div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-[10px] font-sans text-slate-600 dark:text-slate-400 font-bold uppercase">Daily Pivot</div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{activeQuote.timeframeLevels.pivot}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">Equilibrium</div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/30 text-center">
                        <div className="text-[10px] font-sans text-emerald-600 dark:text-emerald-400 font-bold uppercase">Support 1</div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{activeQuote.timeframeLevels.support1}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">H1 demand</div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-center">
                        <div className="text-[10px] font-sans text-emerald-600 dark:text-emerald-400 font-bold uppercase">Support 2</div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{activeQuote.timeframeLevels.support2}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">Key swing base</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Structured Briefing Card */}
                  {briefing && (
                    <div className="p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-blue-200 dark:border-blue-900/60">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            Institutional Market Briefing ({activeQuote.symbol})
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Gemini 3.8 Flash</span>
                      </div>
                      <div className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans">
                        {briefing}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* SPLIT WORKSTATION: Chart on left (8 cols), Gauge & Matrix on right (4 cols) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <TradingViewAdvancedChart
                  symbol={selectedSymbol}
                  theme={tvTheme}
                  interval={selectedTimeframe}
                  height={chartHeight}
                />

                {briefing && (
                  <div className="p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-blue-200 dark:border-blue-900/60">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Institutional Market Briefing ({activeQuote.symbol})
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Gemini 3.8 Flash</span>
                    </div>
                    <div className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans">
                      {briefing}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Technical Sentiment Meter
                    </h3>
                    <span className="text-[10px] text-slate-400">TradingView Live</span>
                  </div>
                  <TradingViewTechnicalAnalysis symbol={selectedSymbol} theme={tvTheme} />
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-3 font-mono tabular-nums">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 font-sans">Live Bid / Ask:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeQuote.bid} / {activeQuote.ask}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 font-sans">Estimated Spread:</span>
                    <span className="text-slate-700 dark:text-slate-300">{activeQuote.spreadPips} pips</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 font-sans">Daily Pivot:</span>
                    <span className="text-slate-700 dark:text-slate-300">{activeQuote.timeframeLevels.pivot}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Support / Resistance:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {activeQuote.timeframeLevels.support1} / {activeQuote.timeframeLevels.resistance1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Currency Heatmap View */}
      {activeTab === 'heatmap' && (
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Real-time live performance matrix across major reserve currencies powered by TradingView.
          </div>
          <TradingViewForexHeatMap theme={tvTheme} height={600} />
        </div>
      )}

      {/* Economic Calendar View */}
      {activeTab === 'calendar' && (
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Real-time macroeconomic calendar events, central bank rate decisions, and CPI/NFP data feeds.
          </div>
          <TradingViewEconomicCalendar theme={tvTheme} height={660} />
        </div>
      )}
    </div>
  );
};
