import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Send, Radio, Terminal, AlertCircle, RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { WebhookTradeEvent } from '../types/forex';

interface WebhookBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportWebhookTrade: (trade: any) => void;
}

export const WebhookBridgeModal: React.FC<WebhookBridgeModalProps> = ({
  isOpen,
  onClose,
  onImportWebhookTrade,
}) => {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('fxai_sec_' + Math.random().toString(36).substring(2, 10));
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [events, setEvents] = useState<WebhookTradeEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/trades/webhook`);
    }
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trades/webhook-events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const samplePineScriptJson = `{
  "secret": "${secretKey}",
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "side": "{{strategy.order.action}}",
  "entryPrice": {{close}},
  "stopLoss": 1.0825,
  "takeProfit": 1.0910,
  "volume": 0.5,
  "setupTag": "TradingView Alert Automation"
}`;

  const copyToClipboard = (text: string, type: 'url' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleSendTestWebhook = async () => {
    setTestStatus('Sending test trade alert...');
    try {
      const res = await fetch('/api/trades/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          action: 'ENTRY',
          symbol: 'EUR/USD',
          side: 'BUY',
          entryPrice: 1.0875,
          stopLoss: 1.0845,
          takeProfit: 1.0935,
          volume: 0.75,
          setupTag: 'PineScript Test Webhook',
          notes: 'Automated test execution alert via Webhook Bridge',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus('✅ Test alert ingested! Event appearing in queue below.');
        fetchEvents();
      } else {
        setTestStatus('❌ Failed: ' + data.error);
      }
    } catch (err: any) {
      setTestStatus('❌ Network error: ' + err.message);
    }
  };

  const handleSyncToJournal = (ev: WebhookTradeEvent) => {
    onImportWebhookTrade({
      symbol: ev.symbol,
      side: ev.side,
      entryPrice: ev.entryPrice,
      exitPrice: ev.exitPrice || ev.entryPrice,
      stopLoss: ev.stopLoss,
      takeProfit: ev.takeProfit,
      volume: ev.volume,
      setupTag: ev.setupTag,
      preTradePlan: `Automated alert via ${ev.source} at ${new Date(ev.timestamp).toLocaleTimeString()}`,
    });
  };

  const handleClearQueue = async () => {
    try {
      await fetch('/api/trades/webhook-events', { method: 'DELETE' });
      setEvents([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-slate-900 dark:text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                TradingView & MT4/MT5 Webhook Bridge
              </h3>
              <p className="text-xs text-slate-500">
                Receive live automated trade executions and sync directly into your journal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Webhook Endpoint Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            1. Your Ingestion Webhook URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-200"
            />
            <button
              onClick={() => copyToClipboard(webhookUrl, 'url')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shrink-0"
            >
              {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Paste this URL into TradingView Alert → Notifications → <strong>Webhook URL</strong>.
          </p>
        </div>

        {/* Message JSON Payload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              2. TradingView Alert Message JSON Template
            </label>
            <button
              onClick={() => copyToClipboard(samplePineScriptJson, 'json')}
              className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-medium"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copied Template' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-mono overflow-x-auto">
            {samplePineScriptJson}
          </pre>
        </div>

        {/* Test Simulator */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span>Pipeline Test Simulator</span>
            </div>
            <button
              onClick={handleSendTestWebhook}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emit Test Alert</span>
            </button>
          </div>
          {testStatus && (
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 pt-1">
              {testStatus}
            </div>
          )}
        </div>

        {/* Incoming Webhook Buffer Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-blue-500" />
              <span>Recent Ingested Events ({events.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchEvents}
                disabled={isLoading}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Refresh Events"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {events.length > 0 && (
                <button
                  onClick={handleClearQueue}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear Buffer
                </button>
              )}
            </div>
          </div>

          {events.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              No webhook alerts received yet. Click "Emit Test Alert" above or send a POST request from TradingView.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          ev.side === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {ev.side}
                      </span>
                      <strong className="text-slate-900 dark:text-white font-sans">{ev.symbol}</strong>
                      <span className="text-slate-400">@ {ev.entryPrice}</span>
                      <span className="text-[11px] text-slate-400">({ev.volume} Lots)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {ev.setupTag} · {new Date(ev.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSyncToJournal(ev)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                  >
                    <span>Sync to Journal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
