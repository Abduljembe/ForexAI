import React, { useState } from 'react';
import { Users, Award, ShieldCheck, Flame, Trophy, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

export const CommunityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'discussions'>('challenges');

  const challenges = [
    {
      id: 'c-1',
      title: '20-Trade Risk Discipline Challenge',
      participants: 412,
      duration: 'Ongoing',
      reward: 'Discipline Master Badge',
      description: 'Execute 20 consecutive trades risking strictly <= 1.0% of account equity with predefined stop-losses on every single entry. Zero exceptions.',
      criteria: [
        'Mandatory stop-loss logged on order creation',
        'Risk per trade cannot exceed 1.00% under any circumstance',
        'Minimum 20 closed trades required for completion',
      ],
      progress: 80, // 16 of 20
      status: 'In Progress (16 / 20 Trades)',
    },
    {
      id: 'c-2',
      title: 'Zero-Revenge 30-Day Streak',
      participants: 288,
      duration: '30 Days',
      reward: 'Psychological Fortitude Award',
      description: 'Enforce a mandatory 60-minute terminal shutdown whenever two consecutive losses occur in a single trading session.',
      criteria: [
        'No trades executed within 60 minutes of 2 consecutive stop-outs',
        'No sizing up or doubling lot volume following a loss',
      ],
      progress: 60,
      status: 'Active Streak: 18 Days',
    },
    {
      id: 'c-3',
      title: '100% Journal Completeness Sprint',
      participants: 530,
      duration: 'Monthly',
      reward: 'Archivist Badge',
      description: 'Log comprehensive pre-trade plan, setup tag, emotion, and post-trade lesson for every trade taken this month.',
      criteria: [
        'Pre-trade plan documented before order fill',
        'Post-mortem reflection recorded upon exit',
      ],
      progress: 92,
      status: '23 / 25 Trades Documented',
    },
  ];

  const leaderboard = [
    {
      rank: 1,
      trader: 'Elena_K (London)',
      disciplineScore: 98.4,
      riskConsistency: '99.2%',
      stopLossAdherence: '100%',
      journalRate: '100%',
      badge: 'Discipline Elite',
    },
    {
      rank: 2,
      trader: 'Marcus_FX (Zurich)',
      disciplineScore: 96.8,
      riskConsistency: '97.5%',
      stopLossAdherence: '100%',
      journalRate: '98%',
      badge: 'Risk Master',
    },
    {
      rank: 3,
      trader: 'David_Quant (Nairobi)',
      disciplineScore: 95.2,
      riskConsistency: '96.0%',
      stopLossAdherence: '100%',
      journalRate: '96%',
      badge: 'Streak Champion',
    },
    {
      rank: 4,
      trader: 'Sarah_T (Singapore)',
      disciplineScore: 94.1,
      riskConsistency: '95.4%',
      stopLossAdherence: '98.5%',
      journalRate: '95%',
      badge: 'Consistency Pro',
    },
    {
      rank: 5,
      trader: 'You (Trader #109284)',
      disciplineScore: 91.5,
      riskConsistency: '92.0%',
      stopLossAdherence: '95.0%',
      journalRate: '93%',
      badge: 'Rising Disciplinarian',
    },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trader Discipline Community & Challenges
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Reputation Based Purely on Risk Adherence & Consistency</span>
            <span>·</span>
            <span className="text-slate-400">Zero High-Leverage Gambler Leaderboards</span>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'challenges'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Discipline Leaderboard
          </button>
        </div>
      </div>

      {/* Community Standards Policy Note */}
      <div className="p-3.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>
            <strong>Anti-Gamble Policy:</strong> Leaderboards reward process consistency, stop-loss adherence, and journal fidelity—not speculative percentage returns or reckless leverage.
          </span>
        </div>
      </div>

      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{c.duration}</span>
                  <span className="font-mono">{c.participants} Active Traders</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{c.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.description}</p>

                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
                    Mandatory Criteria:
                  </div>
                  {c.criteria.map((cr, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{cr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1">
                  <span className="text-slate-500 text-[11px]">{c.status}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Global Discipline & Consistency Index
              </h3>
              <p className="text-xs text-slate-500">
                Composite score: (Risk Consistency × 40%) + (Stop Loss Adherence × 30%) + (Journal Completeness × 30%)
              </p>
            </div>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-sans font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Trader Handle</th>
                  <th className="px-3 py-3 text-right">Discipline Score</th>
                  <th className="px-3 py-3 text-right">Risk Consistency</th>
                  <th className="px-3 py-3 text-right">Stop-Loss Adherence</th>
                  <th className="px-3 py-3 text-right">Journal Rate</th>
                  <th className="px-4 py-3">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {leaderboard.map((row) => (
                  <tr
                    key={row.rank}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      row.trader.includes('You') ? 'bg-blue-50/50 dark:bg-blue-950/30 font-semibold' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">#{row.rank}</td>
                    <td className="px-4 py-3 font-sans text-slate-900 dark:text-white">{row.trader}</td>
                    <td className="px-3 py-3 text-right text-emerald-500 dark:text-emerald-400 font-bold text-sm">
                      {row.disciplineScore}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">
                      {row.riskConsistency}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">
                      {row.stopLossAdherence}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">
                      {row.journalRate}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {row.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
