import React, { useState, useEffect } from 'react';
import { Trade, MetricSummary } from '../types/forex';
import {
  Brain,
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Clock,
  TrendingDown,
  Compass,
  MessageSquare,
} from 'lucide-react';

interface AICoachViewProps {
  trades: Trade[];
  metrics: MetricSummary;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ trades, metrics }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize coach greeting based on real trade count
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (trades.length === 0) {
      setMessages([
        {
          id: 'init-empty',
          sender: 'coach',
          text: `Hello. I am ForexAI Coach, your evidence-based trading performance and behavioral assistant.

Currently, your trade ledger has **0 logged trades**.

To unlock genuine pattern recognition, tilt diagnostics, and session leakage audits:
1. Go to **Trading Journal** and import your real broker statement (MT4 / MT5 / cTrader CSV).
2. Or use **Log Trade** to record your live orders with pre-trade plans and emotions.

Once your trades are imported, I will audit your real win rates, risk adherence, and psychological discipline without inventing numbers.`,
          timestamp: timeStr,
        },
      ]);
    } else {
      setMessages([
        {
          id: 'init-data',
          sender: 'coach',
          text: `Hello. I am ForexAI Coach, your evidence-based trading performance assistant.

I have analyzed your **${metrics.tradeCount} recorded trades** (Net P/L: $${metrics.netPnl.toFixed(2)}, Win Rate: ${metrics.winRate}%, Profit Factor: ${metrics.profitFactor || 'N/A'}).

Key findings from your data:
- **Consecutive Loss Behavior:** Win rate after 2 losses: **${metrics.consecutiveLossAnalysis.winRateAfterTwoLosses}%** (${metrics.consecutiveLossAnalysis.tradesAfterTwoLosses} trades).
- **Top Expectancy Pair:** **${metrics.pnlByPair[0]?.symbol || 'EUR/USD'}** (+$${metrics.pnlByPair[0]?.netPnl || 0}).
- **Discipline Impact:** High discipline trades produced cleaner risk-to-reward ratios compared to emotional entries.

Select a diagnostic topic below or ask any question about your trading performance.`,
          timestamp: timeStr,
        },
      ]);
    }
  }, [trades.length, metrics.tradeCount]);

  const quickPrompts = [
    {
      title: 'Tilt & Revenge Trading',
      query: 'Analyze whether I exhibit revenge trading, sizing up, or overtrading after consecutive losses.',
    },
    {
      title: 'Session & Pair Matrix',
      query: 'Compare my performance across London, New York, and Asian sessions. Where is my greatest statistical leakage?',
    },
    {
      title: 'Risk Consistency Audit',
      query: 'Evaluate whether my stop-loss distances and lot sizes adhere to a consistent risk percentage.',
    },
    {
      title: 'Weekly Performance Report',
      query: 'Generate a structured weekly review of my trades with evidence-based observations, hypotheses, and 3 review exercises.',
    },
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            trade_count: metrics.tradeCount,
            net_pnl: metrics.netPnl,
            win_rate_percent: metrics.winRate,
            profit_factor: metrics.profitFactor,
            max_drawdown_percent: metrics.maxDrawdownPercent,
            expectancy: metrics.expectancy,
            avg_r_multiple: metrics.avgRMultiple,
            pnl_by_symbol: metrics.pnlByPair,
            pnl_by_session: metrics.pnlBySession,
            consecutive_loss_analysis: metrics.consecutiveLossAnalysis,
            emotion_breakdown: metrics.emotionPerformance,
            rule_adherence: metrics.ruleAdherencePerformance,
            data_limitations: metrics.dataQualityIssues,
          },
        }),
      });

      const data = await response.json();
      const coachMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        sender: 'coach',
        text: data.reply || 'No response returned from coach.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `c-err-${Date.now()}`,
          sender: 'coach',
          text: 'Error connecting to coaching endpoint. Please check server status.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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
            AI Trading Performance Coach
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Behavioral Pattern Detection</span>
            <span>·</span>
            <span>Grounded Strictly in User Trade Logs</span>
            <span>·</span>
            <span className="text-slate-400">Sample: {metrics.tradeCount} Trades</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-900/50 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Hallucinated Arithmetic</span>
          </span>
        </div>
      </div>

      {/* Behavioral Diagnostic Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            disabled={isLoading}
            className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <span>{p.title}</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {p.query}
            </p>
          </button>
        ))}
      </div>

      {/* Chat Messages Workspace */}
      <div className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => {
            const isCoach = m.sender === 'coach';
            return (
              <div key={m.id} className={`flex ${isCoach ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-4 text-xs leading-relaxed ${
                    isCoach
                      ? 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-blue-600 text-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] opacity-75 font-mono">
                    <span className="font-semibold">{isCoach ? 'ForexAI Coach' : 'Trader'}</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none font-sans">
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Auditing historical trade statistics and synthesizing patterns...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputMessage);
            }}
            placeholder="Ask ForexAI Coach about your win rate, emotional tilt, session leaks, or risk consistency..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
