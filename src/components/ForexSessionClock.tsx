import React, { useState, useEffect } from 'react';
import { Clock, Globe, Zap, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { ForexSession } from '../types/forex';

export const ForexSessionClock: React.FC = () => {
  const [currentUtc, setCurrentUtc] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUtc(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const utcHours = currentUtc.getUTCHours();
  const utcMinutes = currentUtc.getUTCMinutes();
  const utcSeconds = currentUtc.getUTCSeconds();
  const currentFractionalHour = utcHours + utcMinutes / 60 + utcSeconds / 3600;

  // Session definitions (UTC)
  // Sydney: 22:00 to 07:00
  // Tokyo: 00:00 to 09:00
  // London: 08:00 to 17:00
  // New York: 13:00 to 22:00
  const isSydneyOpen = currentFractionalHour >= 22 || currentFractionalHour < 7;
  const isTokyoOpen = currentFractionalHour >= 0 && currentFractionalHour < 9;
  const isLondonOpen = currentFractionalHour >= 8 && currentFractionalHour < 17;
  const isNewYorkOpen = currentFractionalHour >= 13 && currentFractionalHour < 22;

  // Key overlaps
  const isLondonNyOverlap = currentFractionalHour >= 13 && currentFractionalHour < 17;
  const isTokyoLondonOverlap = currentFractionalHour >= 8 && currentFractionalHour < 9;

  // Format UTC string
  const format2Digits = (n: number) => n.toString().padStart(2, '0');
  const utcString = `${format2Digits(utcHours)}:${format2Digits(utcMinutes)}:${format2Digits(utcSeconds)} UTC`;
  const localString = currentUtc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Countdown to next high-impact overlap or session event
  const getNextEventMessage = () => {
    if (isLondonNyOverlap) {
      const remainingMinutes = Math.round((17 - currentFractionalHour) * 60);
      return {
        title: '🔥 London / New York Overlap Active',
        subtitle: `${remainingMinutes}m remaining · Peak daily volume & tightest institutional spreads`,
        type: 'overlap',
      };
    }
    if (currentFractionalHour < 8) {
      const minsToLondon = Math.round((8 - currentFractionalHour) * 60);
      return {
        title: '⏳ Asian Session Consolidation',
        subtitle: `London Open in ${Math.floor(minsToLondon / 60)}h ${minsToLondon % 60}m · Watch for range sweeps`,
        type: 'upcoming',
      };
    }
    if (currentFractionalHour >= 8 && currentFractionalHour < 13) {
      const minsToNy = Math.round((13 - currentFractionalHour) * 60);
      return {
        title: '🇬🇧 London Session Active',
        subtitle: `New York Open & Golden Overlap in ${Math.floor(minsToNy / 60)}h ${minsToNy % 60}m`,
        type: 'upcoming',
      };
    }
    if (currentFractionalHour >= 17 && currentFractionalHour < 22) {
      const minsToNyClose = Math.round((22 - currentFractionalHour) * 60);
      return {
        title: '🇺🇸 New York Afternoon Session',
        subtitle: `NY close in ${Math.floor(minsToNyClose / 60)}h ${minsToNyClose % 60}m · Liquidity thinning`,
        type: 'standard',
      };
    }
    return {
      title: '🌏 Sydney & Asian Handover',
      subtitle: 'Market in typical low-volatility accumulation phase',
      type: 'standard',
    };
  };

  const nextEvent = getNextEventMessage();

  const sessions = [
    {
      name: 'Sydney',
      city: 'Australia',
      open: '22:00',
      close: '07:00',
      isOpen: isSydneyOpen,
      volatility: 'Low',
      pairs: 'AUD, NZD',
      avgPipRange: '35 pips',
      color: 'border-amber-500/40 bg-amber-500/5 text-amber-500',
    },
    {
      name: 'Tokyo',
      city: 'Asia',
      open: '00:00',
      close: '09:00',
      isOpen: isTokyoOpen,
      volatility: 'Moderate',
      pairs: 'JPY, AUD, NZD',
      avgPipRange: '48 pips',
      color: 'border-purple-500/40 bg-purple-500/5 text-purple-500',
    },
    {
      name: 'London',
      city: 'Europe',
      open: '08:00',
      close: '17:00',
      isOpen: isLondonOpen,
      volatility: 'Very High',
      pairs: 'EUR, GBP, CHF',
      avgPipRange: '82 pips',
      color: 'border-blue-500/40 bg-blue-500/5 text-blue-500',
    },
    {
      name: 'New York',
      city: 'Americas',
      open: '13:00',
      close: '22:00',
      isOpen: isNewYorkOpen,
      volatility: 'Extreme',
      pairs: 'USD, CAD, Gold',
      avgPipRange: '95 pips',
      color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500',
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Clock Header & Overlap Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Forex 24H Liquidity & Session Overlap Clock
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interbank market hours, overlap windows, and typical pip volatility
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current UTC</div>
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">{utcString}</div>
          </div>
          <div className="hidden sm:block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Local Time</div>
            <div className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{localString}</div>
          </div>
        </div>
      </div>

      {/* Overlap Status Banner */}
      <div
        className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
          isLondonNyOverlap
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isLondonNyOverlap ? (
            <Zap className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
          ) : (
            <Activity className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          <div>
            <span className="font-bold">{nextEvent.title}</span>
            <span className="mx-2 text-slate-400">·</span>
            <span className="opacity-90">{nextEvent.subtitle}</span>
          </div>
        </div>

        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/60 dark:bg-slate-900/60 border border-current">
          {isLondonNyOverlap ? 'Peak Liquidity' : 'Standard Flow'}
        </span>
      </div>

      {/* 24-Hour Visual Timeline */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>00:00 UTC</span>
          <span>06:00</span>
          <span className="text-blue-500 font-bold">12:00 (London)</span>
          <span className="text-amber-500 font-bold">15:00 (Overlap)</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>

        {/* 24h Bar */}
        <div className="relative h-6 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex">
          {/* Visual representations of session bands */}
          {/* Tokyo: 0-9 (37.5%) */}
          <div className="h-full bg-purple-500/20 border-r border-purple-500/30 w-[37.5%] flex items-center px-1.5 text-[9px] font-bold text-purple-600 dark:text-purple-400">
            Tokyo
          </div>
          {/* London: 8-17 (37.5%), NY starts at 13 */}
          <div className="h-full bg-blue-500/20 border-r border-blue-500/30 w-[20.8%] flex items-center px-1 text-[9px] font-bold text-blue-600 dark:text-blue-400">
            London
          </div>
          {/* London-NY Overlap: 13-17 (16.7%) */}
          <div className="h-full bg-amber-500/40 border-r border-amber-500/50 w-[16.7%] flex items-center justify-center text-[9px] font-black text-amber-700 dark:text-amber-300">
            OVERLAP
          </div>
          {/* NY Solo: 17-22 (20.8%) */}
          <div className="h-full bg-emerald-500/20 border-r border-emerald-500/30 w-[20.8%] flex items-center px-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
            NY Close
          </div>
          {/* Sydney: 22-24 (8.3%) */}
          <div className="h-full bg-amber-500/20 w-[8.3%] flex items-center px-1 text-[9px] font-bold text-amber-600 dark:text-amber-400">
            Syd
          </div>

          {/* Current UTC Needle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-rose-500 shadow-md z-10 transition-all"
            style={{ left: `${(currentFractionalHour / 24) * 100}%` }}
            title={`Current: ${utcString}`}
          >
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -ml-[3px] -mt-1 shadow-sm" />
          </div>
        </div>
      </div>

      {/* 4 Sessions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
        {sessions.map((sess) => (
          <div
            key={sess.name}
            className={`p-3 rounded-lg border transition-all ${
              sess.isOpen
                ? `${sess.color} ring-1 ring-current shadow-xs`
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    sess.isOpen ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                  }`}
                />
                {sess.name}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                  sess.isOpen
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {sess.isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>

            <div className="mt-2 text-[11px] font-mono text-slate-500 space-y-0.5">
              <div>Hours: {sess.open} - {sess.close} UTC</div>
              <div>Primary: <strong className="text-slate-700 dark:text-slate-300">{sess.pairs}</strong></div>
              <div>Typical Range: {sess.avgPipRange}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
