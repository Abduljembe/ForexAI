export type TradeSide = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  sourceTicket: string;
  symbol: string;
  side: TradeSide;
  openTime: string; // ISO string
  closeTime: string; // ISO string
  entryPrice: number;
  exitPrice: number;
  volume: number; // in lots
  stopLoss?: number;
  takeProfit?: number;
  grossPnl: number;
  commission: number;
  swap: number;
  netPnl: number;
  rMultiple?: number;
  setupTag?: string;
  emotion?: 'Disciplined' | 'Anxious' | 'Impulsive' | 'FOMO' | 'Revenge' | 'Greedy';
  ruleFollowingScore?: number; // 1 to 5
  preTradePlan?: string;
  reflection?: string;
  lessonLearned?: string;
  screenshotUrl?: string;
  account: string;
}

export interface MetricSummary {
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // percentage
  grossProfit: number;
  grossLoss: number;
  netPnl: number;
  profitFactor: number | null; // null if grossLoss === 0
  avgWin: number;
  avgLoss: number;
  winLossRatio: number;
  expectancy: number; // in $ per trade
  avgRMultiple: number | null;
  maxDrawdownPercent: number;
  maxDrawdownAmount: number;
  totalCommissions: number;
  totalSwaps: number;
  pnlByPair: { symbol: string; trades: number; netPnl: number; winRate: number }[];
  pnlBySession: { session: string; trades: number; netPnl: number; winRate: number }[];
  pnlByDayOfWeek: { day: string; trades: number; netPnl: number }[];
  rDistribution: { bucket: string; count: number }[];
  consecutiveLossAnalysis: {
    maxConsecutiveLosses: number;
    tradesAfterTwoLosses: number;
    winRateAfterTwoLosses: number;
    pnlAfterTwoLosses: number;
  };
  emotionPerformance: { emotion: string; count: number; netPnl: number; winRate: number }[];
  ruleAdherencePerformance: { score: number; count: number; netPnl: number; profitFactor: number }[];
  dataQualityIssues: string[];
}

export interface MarketQuote {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  spreadPips: number;
  change24h: number; // percentage
  high24h: number;
  low24h: number;
  baseCurrency: string;
  quoteCurrency: string;
  pipSize: number; // 0.0001 or 0.01 for JPY
  pipValueStandardLot: number; // in USD
  timeframeLevels: {
    h1Trend: 'BULLISH' | 'BEARISH' | 'RANGING';
    h4Trend: 'BULLISH' | 'BEARISH' | 'RANGING';
    d1Trend: 'BULLISH' | 'BEARISH' | 'RANGING';
    rsi14: number;
    atr14Pips: number;
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
    pivot: number;
  };
  sparkline: number[];
}

export interface EconomicEvent {
  id: string;
  title: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  scheduledTime: string;
  forecast?: string;
  previous?: string;
  actual?: string;
  isCompleted: boolean;
}

export interface CurrencyStrength {
  currency: string;
  score: number; // 0 - 10
  status: 'STRONG' | 'MODERATE' | 'WEAK';
  change24h: number;
}

export interface RiskSettings {
  accountBalance: number;
  baseCurrency: string;
  maxRiskPerTradePercent: number;
  maxDailyLossPercent: number;
  maxWeeklyLossPercent: number;
  maxOpenRiskPercent: number;
  riskGuardEnabled: boolean;
}

export interface BacktestConfig {
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  riskPerTradePercent: number;
  spreadPips: number;
  slippagePips: number;
  commissionPerLot: number;
  inSampleSplitPercent: number; // e.g. 70
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  netProfit: number;
  profitFactor: number;
  maxDrawdown: number;
  expectancy: number;
  sharpeRatio: number;
  equityCurve: { date: string; equity: number; drawdown: number }[];
  inSampleWinRate: number;
  outOfSampleWinRate: number;
  monteCarloSimulations: {
    medianDrawdown: number;
    worstCaseDrawdown: number;
    probabilityOfRuinPercent: number;
  };
}

export interface AlertItem {
  id: string;
  symbol: string;
  type: 'PRICE_LEVEL' | 'ECONOMIC_NEWS' | 'VOLATILITY' | 'RISK_GUARD';
  condition: string;
  targetValue?: number;
  createdAt: string;
  isActive: boolean;
  notes?: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  category: 'FOUNDATION' | 'TECHNICAL_ANALYSIS' | 'RISK_MANAGEMENT' | 'TRADING_PSYCHOLOGY' | 'STRATEGY_BUILDING';
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  contentMarkdown: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}
