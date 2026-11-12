import React, { useState } from 'react';
import { Wand2, Sparkles, Check, Edit2, Play, Save, Loader2, ListChecks } from 'lucide-react';

interface StructuredStrategy {
  name: string;
  timeframe: string;
  recommendedPairs: string[];
  entryRules: string[];
  exitRules: string[];
  riskRules: string[];
  invalidationCriteria: string[];
}

interface StrategyBuilderViewProps {
  onSendToBacktest: (strategyName: string) => void;
}

export const StrategyBuilderView: React.FC<StrategyBuilderViewProps> = ({ onSendToBacktest }) => {
  const [plainText, setPlainText] = useState<string>(
    'I trade EUR/USD on H1. I use EMA 50 and EMA 200 for trend direction. When price pulls back to the 50 EMA and RSI drops below 35, I look for a bullish pinbar. Stop loss 5 pips below the swing low, take profit at 1:2.5 risk reward. Maximum 1% risk per trade.'
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<StructuredStrategy | null>({
    name: 'EMA 50/200 Trend Pullback & RSI Confluence',
    timeframe: 'H1',
    recommendedPairs: ['EUR/USD', 'GBP/USD', 'AUD/USD'],
    entryRules: [
      'Price is trading above both the 50 EMA and 200 EMA on H4 / H1 (Macro Bullish Trend)',
      'Price retraces to touch or penetrate the 50 EMA support zone',
      'RSI (14) prints an oversold reading (< 35) or bullish momentum hook',
      'Trigger candle: Bullish pinbar or engulfing candle closes back above the 50 EMA',
    ],
    exitRules: [
      'Stop Loss: Placed 5 pips below the most recent H1 structural swing low',
      'Take Profit: Calculated at a minimum 1:2.5 Risk-to-Reward ratio',
      'Partial Exit: Close 50% of volume at 1:1.5 R:R and move stop to Breakeven',
    ],
    riskRules: [
      'Maximum 1.0% account equity risk per trade',
      'No new entries 30 minutes before or after High-Impact News releases',
      'Maximum 2 concurrent correlated USD positions',
    ],
    invalidationCriteria: [
      'A full candle close below the 200 EMA invalidates the long bias',
      'RSI bearish divergence on the higher timeframe',
    ],
  });

  const handleBuildStrategy = async () => {
    if (!plainText.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/strategy-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plainDescription: plainText }),
      });

      const data = await response.json();
      if (data.strategy && data.strategy.name) {
        setStrategy(data.strategy);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Strategy Builder
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Natural Language to Testable Quant Rules</span>
            <span>·</span>
            <span>Deterministic Rule Specification</span>
            <span>·</span>
            <span className="text-slate-400">Zero Silent Execution</span>
          </div>
        </div>

        {strategy && (
          <button
            onClick={() => onSendToBacktest(strategy.name)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test in Backtest Lab</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea & Prompts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-500" />
              <span>Describe Your Strategy in Plain English</span>
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              Describe your indicators, timeframes, entry conditions, stop placements, and profit targets. ForexAI will convert your ideas into formal, testable rules.
            </p>

            <textarea
              rows={8}
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder="e.g. I trade London Open breakout on GBP/USD. When price breaks the 7-8 AM GMT high with high volume, I enter long with stop at Asian low..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Gemini 3.8 Flash Parser</span>
              <button
                onClick={handleBuildStrategy}
                disabled={isLoading || !plainText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Convert to Structured Rules</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Structured Rules Display & Confirmation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {strategy && (
            <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{strategy.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Timeframe: <strong className="text-slate-800 dark:text-slate-200 font-mono">{strategy.timeframe}</strong></span>
                    <span>·</span>
                    <span>Pairs: {strategy.recommendedPairs?.join(', ') || 'EUR/USD'}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded text-[11px] font-semibold">
                  Rule Specification Valid
                </span>
              </div>

              {/* Entry Rules */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-blue-500" />
                  <span>Entry Rules</span>
                </h4>
                <div className="space-y-1.5">
                  {strategy.entryRules.map((rule, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2">
                      <span className="font-mono text-blue-500 font-bold shrink-0">{idx + 1}.</span>
                      <span className="text-slate-700 dark:text-slate-300">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exit Rules */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-rose-500" />
                  <span>Exit & Stop-Loss Rules</span>
                </h4>
                <div className="space-y-1.5">
                  {strategy.exitRules.map((rule, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2">
                      <span className="font-mono text-rose-500 font-bold shrink-0">{idx + 1}.</span>
                      <span className="text-slate-700 dark:text-slate-300">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk & Invalidation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Money Management Rules
                  </h4>
                  <div className="space-y-1 text-xs">
                    {strategy.riskRules.map((r, i) => (
                      <div key={i} className="text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-slate-400">·</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Invalidation Criteria
                  </h4>
                  <div className="space-y-1 text-xs">
                    {strategy.invalidationCriteria.map((r, i) => (
                      <div key={i} className="text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-slate-400">·</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
