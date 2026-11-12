import { Trade, MetricSummary } from '../types/forex';

export function calculateDeterministicMetrics(trades: Trade[], initialBalance: number = 10000): MetricSummary {
  const dataQualityIssues: string[] = [];

  if (!trades || trades.length === 0) {
    return {
      tradeCount: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      grossProfit: 0,
      grossLoss: 0,
      netPnl: 0,
      profitFactor: null,
      avgWin: 0,
      avgLoss: 0,
      winLossRatio: 0,
      expectancy: 0,
      avgRMultiple: null,
      maxDrawdownPercent: 0,
      maxDrawdownAmount: 0,
      totalCommissions: 0,
      totalSwaps: 0,
      pnlByPair: [],
      pnlBySession: [],
      pnlByDayOfWeek: [],
      rDistribution: [],
      consecutiveLossAnalysis: {
        maxConsecutiveLosses: 0,
        tradesAfterTwoLosses: 0,
        winRateAfterTwoLosses: 0,
        pnlAfterTwoLosses: 0,
      },
      emotionPerformance: [],
      ruleAdherencePerformance: [],
      dataQualityIssues: ['No trades recorded in selected period.'],
    };
  }

  // Filter only closed trades (where exitPrice and closeTime exist)
  const closedTrades = trades
    .filter((t) => t.closeTime && t.exitPrice)
    .sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

  if (closedTrades.length < trades.length) {
    dataQualityIssues.push(`${trades.length - closedTrades.length} open trade(s) excluded from closed performance metrics.`);
  }

  let missingStopLossCount = 0;
  let missingCommissionCount = 0;

  let grossProfit = 0;
  let grossLoss = 0;
  let netPnl = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakevenTrades = 0;
  let totalCommissions = 0;
  let totalSwaps = 0;

  const validRMultiples: number[] = [];

  // Groupings
  const pairMap: Record<string, { trades: number; netPnl: number; wins: number }> = {};
  const sessionMap: Record<string, { trades: number; netPnl: number; wins: number }> = {
    'Asian (00-08 UTC)': { trades: 0, netPnl: 0, wins: 0 },
    'London (07-15 UTC)': { trades: 0, netPnl: 0, wins: 0 },
    'New York (12-20 UTC)': { trades: 0, netPnl: 0, wins: 0 },
    'London/NY Overlap': { trades: 0, netPnl: 0, wins: 0 },
  };
  const dayMap: Record<string, { trades: number; netPnl: number }> = {
    Mon: { trades: 0, netPnl: 0 },
    Tue: { trades: 0, netPnl: 0 },
    Wed: { trades: 0, netPnl: 0 },
    Thu: { trades: 0, netPnl: 0 },
    Fri: { trades: 0, netPnl: 0 },
  };
  const emotionMap: Record<string, { count: number; netPnl: number; wins: number }> = {};
  const ruleMap: Record<number, { count: number; netPnl: number; wins: number; losses: number }> = {};

  // For consecutive loss tracking
  let consecutiveLosses = 0;
  let maxConsecutiveLosses = 0;
  let tradesAfterTwoLosses = 0;
  let winsAfterTwoLosses = 0;
  let pnlAfterTwoLosses = 0;

  // Running balance for equity curve & drawdown
  let peakEquity = initialBalance;
  let maxDrawdownAmount = 0;
  let maxDrawdownPercent = 0;
  let runningEquity = initialBalance;

  for (let i = 0; i < closedTrades.length; i++) {
    const trade = closedTrades[i];
    const pnl = trade.netPnl;
    netPnl += pnl;
    runningEquity += pnl;

    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const currentDrawdownAmount = peakEquity - runningEquity;
    const currentDrawdownPercent = peakEquity > 0 ? (currentDrawdownAmount / peakEquity) * 100 : 0;
    if (currentDrawdownAmount > maxDrawdownAmount) {
      maxDrawdownAmount = currentDrawdownAmount;
      maxDrawdownPercent = currentDrawdownPercent;
    }

    totalCommissions += trade.commission || 0;
    totalSwaps += trade.swap || 0;

    if (trade.stopLoss == null) missingStopLossCount++;
    if (trade.commission == null) missingCommissionCount++;

    // Calculate R-multiple if stop loss was present
    if (trade.rMultiple != null) {
      validRMultiples.push(trade.rMultiple);
    } else if (trade.stopLoss && trade.entryPrice) {
      const riskPips = Math.abs(trade.entryPrice - trade.stopLoss);
      if (riskPips > 0) {
        const resultPips = trade.side === 'BUY' ? trade.exitPrice - trade.entryPrice : trade.entryPrice - trade.exitPrice;
        const calcR = resultPips / riskPips;
        validRMultiples.push(parseFloat(calcR.toFixed(2)));
      }
    }

    if (pnl > 0.001) {
      winningTrades++;
      grossProfit += pnl;
    } else if (pnl < -0.001) {
      losingTrades++;
      grossLoss += Math.abs(pnl);
    } else {
      breakevenTrades++;
    }

    // Consecutive loss reaction analysis
    if (consecutiveLosses >= 2) {
      tradesAfterTwoLosses++;
      pnlAfterTwoLosses += pnl;
      if (pnl > 0) winsAfterTwoLosses++;
    }

    if (pnl < -0.001) {
      consecutiveLosses++;
      if (consecutiveLosses > maxConsecutiveLosses) {
        maxConsecutiveLosses = consecutiveLosses;
      }
    } else if (pnl > 0.001) {
      consecutiveLosses = 0;
    }

    // Pair breakdown
    if (!pairMap[trade.symbol]) {
      pairMap[trade.symbol] = { trades: 0, netPnl: 0, wins: 0 };
    }
    pairMap[trade.symbol].trades++;
    pairMap[trade.symbol].netPnl += pnl;
    if (pnl > 0) pairMap[trade.symbol].wins++;

    // Session determination (using UTC hour of open time)
    const openDate = new Date(trade.openTime);
    const utcHour = openDate.getUTCHours();
    let sessionKey = 'Asian (00-08 UTC)';
    if (utcHour >= 12 && utcHour < 16) {
      sessionKey = 'London/NY Overlap';
    } else if (utcHour >= 7 && utcHour < 15) {
      sessionKey = 'London (07-15 UTC)';
    } else if (utcHour >= 15 && utcHour < 21) {
      sessionKey = 'New York (12-20 UTC)';
    }
    if (sessionMap[sessionKey]) {
      sessionMap[sessionKey].trades++;
      sessionMap[sessionKey].netPnl += pnl;
      if (pnl > 0) sessionMap[sessionKey].wins++;
    }

    // Day of week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[openDate.getUTCDay()];
    if (dayMap[dayName]) {
      dayMap[dayName].trades++;
      dayMap[dayName].netPnl += pnl;
    }

    // Emotion performance
    if (trade.emotion) {
      if (!emotionMap[trade.emotion]) {
        emotionMap[trade.emotion] = { count: 0, netPnl: 0, wins: 0 };
      }
      emotionMap[trade.emotion].count++;
      emotionMap[trade.emotion].netPnl += pnl;
      if (pnl > 0) emotionMap[trade.emotion].wins++;
    }

    // Rule adherence performance
    if (trade.ruleFollowingScore != null) {
      const score = Math.round(trade.ruleFollowingScore);
      if (!ruleMap[score]) {
        ruleMap[score] = { count: 0, netPnl: 0, wins: 0, losses: 0 };
      }
      ruleMap[score].count++;
      ruleMap[score].netPnl += pnl;
      if (pnl > 0) ruleMap[score].wins += pnl;
      else ruleMap[score].losses += Math.abs(pnl);
    }
  }

  if (missingStopLossCount > 0) {
    dataQualityIssues.push(`Stop Loss field missing on ${missingStopLossCount} trades; R-multiples for those trades are excluded.`);
  }
  if (missingCommissionCount > 0) {
    dataQualityIssues.push(`Commission / swap fields missing on ${missingCommissionCount} trades; gross figures match net.`);
  }

  const tradeCount = closedTrades.length;
  const winRate = tradeCount > 0 ? (winningTrades / tradeCount) * 100 : 0;
  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
  const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : null;
  const expectancy = tradeCount > 0 ? netPnl / tradeCount : 0;

  const avgRMultiple =
    validRMultiples.length > 0
      ? validRMultiples.reduce((acc, r) => acc + r, 0) / validRMultiples.length
      : null;

  // Build R distribution buckets
  const rBuckets: Record<string, number> = {
    '<-2R': 0,
    '-1R to -2R': 0,
    '0R to -1R': 0,
    '0R to +1R': 0,
    '+1R to +2R': 0,
    '+2R to +3R': 0,
    '>+3R': 0,
  };
  validRMultiples.forEach((r) => {
    if (r < -2) rBuckets['<-2R']++;
    else if (r < -1) rBuckets['-1R to -2R']++;
    else if (r < 0) rBuckets['0R to -1R']++;
    else if (r <= 1) rBuckets['0R to +1R']++;
    else if (r <= 2) rBuckets['+1R to +2R']++;
    else if (r <= 3) rBuckets['+2R to +3R']++;
    else rBuckets['>+3R']++;
  });

  return {
    tradeCount,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate: parseFloat(winRate.toFixed(2)),
    grossProfit: parseFloat(grossProfit.toFixed(2)),
    grossLoss: parseFloat(grossLoss.toFixed(2)),
    netPnl: parseFloat(netPnl.toFixed(2)),
    profitFactor: profitFactor ? parseFloat(profitFactor.toFixed(2)) : null,
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    winLossRatio: parseFloat(winLossRatio.toFixed(2)),
    expectancy: parseFloat(expectancy.toFixed(2)),
    avgRMultiple: avgRMultiple != null ? parseFloat(avgRMultiple.toFixed(2)) : null,
    maxDrawdownPercent: parseFloat(maxDrawdownPercent.toFixed(2)),
    maxDrawdownAmount: parseFloat(maxDrawdownAmount.toFixed(2)),
    totalCommissions: parseFloat(totalCommissions.toFixed(2)),
    totalSwaps: parseFloat(totalSwaps.toFixed(2)),
    pnlByPair: Object.entries(pairMap).map(([symbol, data]) => ({
      symbol,
      trades: data.trades,
      netPnl: parseFloat(data.netPnl.toFixed(2)),
      winRate: data.trades > 0 ? parseFloat(((data.wins / data.trades) * 100).toFixed(1)) : 0,
    })),
    pnlBySession: Object.entries(sessionMap).map(([session, data]) => ({
      session,
      trades: data.trades,
      netPnl: parseFloat(data.netPnl.toFixed(2)),
      winRate: data.trades > 0 ? parseFloat(((data.wins / data.trades) * 100).toFixed(1)) : 0,
    })),
    pnlByDayOfWeek: Object.entries(dayMap).map(([day, data]) => ({
      day,
      trades: data.trades,
      netPnl: parseFloat(data.netPnl.toFixed(2)),
    })),
    rDistribution: Object.entries(rBuckets).map(([bucket, count]) => ({
      bucket,
      count,
    })),
    consecutiveLossAnalysis: {
      maxConsecutiveLosses,
      tradesAfterTwoLosses,
      winRateAfterTwoLosses:
        tradesAfterTwoLosses > 0 ? parseFloat(((winsAfterTwoLosses / tradesAfterTwoLosses) * 100).toFixed(1)) : 0,
      pnlAfterTwoLosses: parseFloat(pnlAfterTwoLosses.toFixed(2)),
    },
    emotionPerformance: Object.entries(emotionMap).map(([emotion, data]) => ({
      emotion,
      count: data.count,
      netPnl: parseFloat(data.netPnl.toFixed(2)),
      winRate: data.count > 0 ? parseFloat(((data.wins / data.count) * 100).toFixed(1)) : 0,
    })),
    ruleAdherencePerformance: Object.entries(ruleMap).map(([scoreStr, data]) => ({
      score: parseInt(scoreStr, 10),
      count: data.count,
      netPnl: parseFloat(data.netPnl.toFixed(2)),
      profitFactor: data.losses > 0 ? parseFloat((data.wins / data.losses).toFixed(2)) : data.wins > 0 ? 99 : 0,
    })),
    dataQualityIssues,
  };
}
