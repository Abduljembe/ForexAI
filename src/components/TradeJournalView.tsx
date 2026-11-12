import React, { useState, useRef } from 'react';
import { Trade, TradeSide } from '../types/forex';
import { SAMPLE_MT4_CSV } from '../services/mockData';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  ExternalLink,
  ChevronRight,
  Upload,
  Sparkles,
} from 'lucide-react';

interface TradeJournalViewProps {
  trades: Trade[];
  onAddTrade: (trade: Trade) => void;
  onImportTrades: (newTrades: Trade[]) => void;
  onUpdateTrade: (tradeId: string, updates: Partial<Trade>) => void;
}

export const TradeJournalView: React.FC<TradeJournalViewProps> = ({
  trades,
  onAddTrade,
  onImportTrades,
  onUpdateTrade,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pairFilter, setPairFilter] = useState<string>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // CSV Import Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isSuccessImport, setIsSuccessImport] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Log Trade Modal
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualForm, setManualForm] = useState<Partial<Trade>>({
    symbol: 'EUR/USD',
    side: 'BUY',
    volume: 1.0,
    entryPrice: 1.085,
    exitPrice: 1.088,
    stopLoss: 1.0825,
    takeProfit: 1.09,
    commission: -7.0,
    swap: 0,
    setupTag: 'Trend Pullback',
    emotion: 'Disciplined',
    ruleFollowingScore: 5,
    preTradePlan: '',
    reflection: '',
    lessonLearned: '',
  });

  // Filtered trades
  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceTicket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.setupTag && t.setupTag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPair = pairFilter === 'ALL' || t.symbol === pairFilter;
    const matchesOutcome =
      outcomeFilter === 'ALL' ||
      (outcomeFilter === 'WIN' && t.netPnl > 0) ||
      (outcomeFilter === 'LOSS' && t.netPnl < 0) ||
      (outcomeFilter === 'BE' && Math.abs(t.netPnl) <= 0.01);

    return matchesSearch && matchesPair && matchesOutcome;
  });

  const uniquePairs = Array.from(new Set(trades.map((t) => t.symbol)));

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        handleParseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV text
  const handleParseCsv = (rawText: string) => {
    setCsvText(rawText);
    const lines = rawText.trim().split('\n');
    if (lines.length < 2) {
      setImportErrors(['CSV must contain a header row and at least one trade row.']);
      setImportPreview(null);
      return;
    }

    const errors: string[] = [];
    const parsed: Trade[] = [];
    const existingTickets = new Set(trades.map((t) => t.sourceTicket));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

      const ticket = cols[0] || `TICK-${Date.now()}-${i}`;
      if (existingTickets.has(ticket)) {
        errors.push(`Row ${i}: Ticket #${ticket} skipped (duplicate already in journal).`);
        continue;
      }

      const openTime = cols[1] ? new Date(cols[1].replace(/\./g, '-')).toISOString() : new Date().toISOString();
      const rawSide = (cols[2] || 'buy').toUpperCase();
      const side: TradeSide = rawSide.includes('SELL') ? 'SELL' : 'BUY';
      const volume = parseFloat(cols[3]) || 1.0;
      let symbol = (cols[4] || 'EURUSD').toUpperCase();
      if (!symbol.includes('/') && symbol.length === 6) {
        symbol = `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;
      }

      const entryPrice = parseFloat(cols[5]) || 0;
      const stopLoss = cols[6] ? parseFloat(cols[6]) : undefined;
      const takeProfit = cols[7] ? parseFloat(cols[7]) : undefined;
      const closeTime = cols[8] ? new Date(cols[8].replace(/\./g, '-')).toISOString() : new Date().toISOString();
      const exitPrice = cols[9] ? parseFloat(cols[9]) : entryPrice;
      const commission = cols[10] ? parseFloat(cols[10]) : 0;
      const swap = cols[11] ? parseFloat(cols[11]) : 0;
      const grossPnl = cols[12] ? parseFloat(cols[12]) : 0;
      const netPnl = grossPnl + commission + swap;

      parsed.push({
        id: `imp-${Date.now()}-${i}`,
        sourceTicket: ticket,
        symbol,
        side,
        openTime,
        closeTime,
        entryPrice,
        exitPrice,
        volume,
        stopLoss,
        takeProfit,
        grossPnl,
        commission,
        swap,
        netPnl,
        setupTag: 'Imported Broker Trade',
        emotion: 'Disciplined',
        ruleFollowingScore: 4,
        account: 'Primary MT5',
      });
    }

    setImportErrors(errors);
    setImportPreview(parsed);
  };

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.length === 0) return;
    onImportTrades(importPreview);
    setIsSuccessImport(true);
    setTimeout(() => {
      setIsSuccessImport(false);
      setShowImportModal(false);
      setImportPreview(null);
      setCsvText('');
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = manualForm.entryPrice || 1.0;
    const exit = manualForm.exitPrice || entry;
    const vol = manualForm.volume || 1.0;
    const pipMult = manualForm.symbol?.includes('JPY') ? 100 : 10000;
    const pips = manualForm.side === 'BUY' ? (exit - entry) * pipMult : (entry - exit) * pipMult;
    const grossPnl = pips * vol * 10;
    const comm = manualForm.commission || -7.0;
    const swap = manualForm.swap || 0;

    const newTrade: Trade = {
      id: `manual-${Date.now()}`,
      sourceTicket: `REAL-${Math.floor(Math.random() * 899999 + 100000)}`,
      symbol: manualForm.symbol || 'EUR/USD',
      side: manualForm.side || 'BUY',
      openTime: new Date().toISOString(),
      closeTime: new Date().toISOString(),
      entryPrice: entry,
      exitPrice: exit,
      volume: vol,
      stopLoss: manualForm.stopLoss,
      takeProfit: manualForm.takeProfit,
      grossPnl: parseFloat(grossPnl.toFixed(2)),
      commission: comm,
      swap: swap,
      netPnl: parseFloat((grossPnl + comm + swap).toFixed(2)),
      setupTag: manualForm.setupTag || 'Trend Pullback',
      emotion: manualForm.emotion || 'Disciplined',
      ruleFollowingScore: manualForm.ruleFollowingScore || 5,
      preTradePlan: manualForm.preTradePlan,
      reflection: manualForm.reflection,
      lessonLearned: manualForm.lessonLearned,
      account: 'Live Account',
    };

    onAddTrade(newTrade);
    setShowManualModal(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Forex Trade Journal & Ledger
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{trades.length} Verified Real Trades</span>
            <span>·</span>
            <span>Pre-Trade Plan & Post-Mortem Reviews</span>
            <span>·</span>
            <span className="text-slate-400">Strict Deduplication via Order Tickets</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Clean Ledger Initialized
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No sample or mock trades are loaded. Import your broker statement CSV or log an execution to begin building your personal performance history.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import MT4 / MT5 CSV</span>
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Manual Trade</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ticket, symbol, or setup tag..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pairFilter}
                onChange={(e) => setPairFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono"
              >
                <option value="ALL">All Pairs</option>
                {uniquePairs.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Outcomes</option>
                <option value="WIN">Winners (&gt;$0)</option>
                <option value="LOSS">Losses (&lt;$0)</option>
                <option value="BE">Breakeven</option>
              </select>
            </div>
          </div>

          {/* Main Trade Table */}
          <div className="rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Ticket / Symbol</th>
                    <th className="px-3 py-3">Side</th>
                    <th className="px-3 py-3">Close Date</th>
                    <th className="px-3 py-3 text-right">Volume</th>
                    <th className="px-3 py-3 text-right">Entry / Exit</th>
                    <th className="px-3 py-3 text-right">R-Multiple</th>
                    <th className="px-4 py-3 text-right">Net P/L</th>
                    <th className="px-3 py-3">Setup Tag</th>
                    <th className="px-3 py-3">Rule Adherence</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
                  {filteredTrades.map((t) => {
                    const isWinner = t.netPnl > 0.01;
                    const isLoser = t.netPnl < -0.01;

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTrade(t)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white font-sans">{t.symbol}</div>
                          <div className="text-[10px] text-slate-400">#{t.sourceTicket}</div>
                        </td>

                        <td className="px-3 py-3 font-sans">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              t.side === 'BUY'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {t.side}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                          {new Date(t.closeTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">
                          {t.volume.toFixed(2)}
                        </td>

                        <td className="px-3 py-3 text-right text-slate-600 dark:text-slate-400 text-[11px]">
                          <div>{t.entryPrice}</div>
                          <div className="text-slate-400">{t.exitPrice}</div>
                        </td>

                        <td className="px-3 py-3 text-right font-semibold">
                          {t.rMultiple != null ? (
                            <span className={t.rMultiple > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {t.rMultiple > 0 ? `+${t.rMultiple}R` : `${t.rMultiple}R`}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-bold">
                          <span
                            className={
                              isWinner
                                ? 'text-emerald-500 dark:text-emerald-400'
                                : isLoser
                                ? 'text-rose-500 dark:text-rose-400'
                                : 'text-slate-400'
                            }
                          >
                            {isWinner ? `+$${t.netPnl.toFixed(2)}` : `-$${Math.abs(t.netPnl).toFixed(2)}`}
                          </span>
                        </td>

                        <td className="px-3 py-3 font-sans">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {t.setupTag || 'Discretionary'}
                          </span>
                          {t.emotion && <div className="text-[10px] text-slate-400">{t.emotion}</div>}
                        </td>

                        <td className="px-3 py-3 font-sans">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (t.ruleFollowingScore || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Trade Detail Modal / Drawer */}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedTrade.symbol} Trade Review
                  </h3>
                  <span className="text-xs font-mono text-slate-400">#{selectedTrade.sourceTicket}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {selectedTrade.side} {selectedTrade.volume} lots · Net P/L: ${selectedTrade.netPnl.toFixed(2)}
                </div>
              </div>

              <button
                onClick={() => setSelectedTrade(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Pre-Trade Plan & Trigger
                </label>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-800">
                  {selectedTrade.preTradePlan || 'No pre-trade plan recorded for this order.'}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Post-Trade Reflection & Execution
                </label>
                <p className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-800">
                  {selectedTrade.reflection || 'No reflection recorded.'}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Key Lesson Learned
                </label>
                <p className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg text-blue-800 dark:text-blue-300 leading-relaxed border border-blue-200 dark:border-blue-900/40">
                  {selectedTrade.lessonLearned || 'No lesson specified.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-slate-500 text-[11px]">
                <div>Commissions: ${selectedTrade.commission.toFixed(2)}</div>
                <div>Swaps: ${selectedTrade.swap.toFixed(2)}</div>
                <div>Stop Loss: {selectedTrade.stopLoss || 'N/A'}</div>
                <div>Take Profit: {selectedTrade.takeProfit || 'N/A'}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedTrade(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Wizard Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Import Real Broker CSV (MT4 / MT5 / cTrader)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Upload your trade report CSV or paste its contents. Supported fields include Ticket, Open Time, Side, Volume, Symbol, Entry Price, Stop Loss, Take Profit, Close Time, Exit Price, Commission, Swap, and Net Profit.
              </p>

              {/* File Upload Button & Drag Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg p-5 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,text/csv"
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Click to select CSV file from your device
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Accepts MT4/MT5 Detailed Statements and cTrader History CSVs
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Or Paste Raw CSV Text</span>
                <button
                  type="button"
                  onClick={() => handleParseCsv(SAMPLE_MT4_CSV)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Need test format? Load MT4 Template
                </button>
              </div>

              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => handleParseCsv(e.target.value)}
                placeholder="Ticket,Open Time,Type,Size,Item,Price,S / L,T / P,Close Time,Price,Commission,Swap,Profit"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {/* Import Preview */}
              {importPreview && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-2">
                    <span>Validation Passed: {importPreview.length} Valid Trades Found</span>
                    <span className="text-emerald-500 font-semibold">Ready to Import</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 max-h-24 overflow-y-auto space-y-1">
                    {importPreview.slice(0, 3).map((p) => (
                      <div key={p.sourceTicket}>
                        #{p.sourceTicket} · {p.symbol} {p.side} {p.volume}L @ {p.entryPrice} → {p.exitPrice} (Net: ${p.netPnl})
                      </div>
                    ))}
                    {importPreview.length > 3 && <div>...and {importPreview.length - 3} more trades</div>}
                  </div>
                </div>
              )}

              {/* Errors list */}
              {importErrors.length > 0 && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded text-[11px] text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="font-semibold">Validation Notices:</div>
                  {importErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Deduplication active</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={!importPreview || importPreview.length === 0}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {isSuccessImport ? 'Imported Successfully!' : `Confirm Import (${importPreview?.length || 0})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Log Trade Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleManualSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log Real Execution to Ledger
              </h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Symbol</label>
                <select
                  value={manualForm.symbol}
                  onChange={(e) => setManualForm({ ...manualForm, symbol: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                >
                  {['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'EUR/GBP', 'XAU/USD'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Direction</label>
                <select
                  value={manualForm.side}
                  onChange={(e) => setManualForm({ ...manualForm, side: e.target.value as TradeSide })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                >
                  <option value="BUY">BUY / LONG</option>
                  <option value="SELL">SELL / SHORT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Lots</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualForm.volume}
                  onChange={(e) => setManualForm({ ...manualForm, volume: parseFloat(e.target.value) || 0.1 })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Entry Price</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualForm.entryPrice}
                  onChange={(e) => setManualForm({ ...manualForm, entryPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Exit Price</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualForm.exitPrice}
                  onChange={(e) => setManualForm({ ...manualForm, exitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualForm.stopLoss}
                  onChange={(e) => setManualForm({ ...manualForm, stopLoss: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Setup Tag</label>
                <input
                  type="text"
                  value={manualForm.setupTag}
                  onChange={(e) => setManualForm({ ...manualForm, setupTag: e.target.value })}
                  placeholder="e.g. Trend Pullback, London Breakout, Liquidity Sweep"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Pre-Trade Plan & Thesis</label>
                <textarea
                  rows={2}
                  value={manualForm.preTradePlan}
                  onChange={(e) => setManualForm({ ...manualForm, preTradePlan: e.target.value })}
                  placeholder="Why did you take this trade? What was the technical invalidation level?"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Post-Mortem Reflection</label>
                <textarea
                  rows={2}
                  value={manualForm.reflection}
                  onChange={(e) => setManualForm({ ...manualForm, reflection: e.target.value })}
                  placeholder="Did you follow your stop rules? Any emotional pressure?"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save Real Trade
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
