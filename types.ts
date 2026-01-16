
export enum SignalType {
  LONG = 'LONG',
  SHORT = 'SHORT',
  NEUTRAL = 'NEUTRAL'
}

export type TradingStyle = 'CONSERVATIVE' | 'AGGRESSIVE';

export interface TechnicalIndicator {
  label: string;
  value: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface SocialPlatform {
  name: string;
  activity: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface SocialSentiment {
  score: number;
  volumeSpike: boolean;
  topNarrative: string;
  platforms: SocialPlatform[];
}

export interface ScalpAnalysis {
  signal: SignalType;
  entryPrice: string;
  takeProfit: string;
  takeProfitSafe: string;
  stopLoss: string;
  riskRewardRatio: string;
  reasoning: string[];
  timeframe: string;
  confidence: number;
  // Deep Analysis Fields
  marketStructure: 'BULLISH' | 'BEARISH' | 'RANGING';
  keyLiquidityZones: string[];
  fvgDetected: boolean;
  volatilityIndex: string;
  // Expanded Reasoning Fields
  indicators: TechnicalIndicator[];
  patterns: string[];
  liquidityNarrative: string;
  // Sentiment Analysis Module
  socialSentiment: SocialSentiment;
  // Tactical Execution Fields
  executionType: 'IMMEDIATE' | 'LIMIT';
  actionInstruction: string; // np. "KUP TERAZ" lub "CZEKAJ NA POZIOM 1.234"
  recommendedLeverage: string; // np. "5x - 10x"
  positionSizing: string; // np. "2% kapitału"
  systemRiskAdvice: string; // Rekomendacja czy grać Safe czy Aggressive
  tradeWarning: string; // Specyficzne ostrzeżenie dla danego setupu
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  image: string;
  analysis: ScalpAnalysis;
}

export interface VolatilityOpportunity {
  ticker: string;
  signal: SignalType;
  setup: string;
  justification: string;
  confidence: number;
  currentPrice: string; // LIVE price from exchange
  targetPrice: string;
  targetPriceSafe: string;
  stopLoss: string;
  estimatedMove: string;
  lastUpdated: string;
  socialSentiment: {
    score: number;
    mentionSpike: boolean;
    trendingPlatform: string;
  };
  onChainData: {
    whaleActivity: 'ACCUMULATING' | 'NEUTRAL' | 'DISTRIBUTING';
    exchangeFlow: 'OUTFLOW' | 'NEUTRAL' | 'INFLOW';
  };
  liquidityStatus: 'THIN' | 'MODERATE' | 'DEEP';
  narrative: string;
  securityScore: number;
  isSafeContract: boolean;
  memeViralScore?: number;
  macroAlignment: string;
  institutionalInterest: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface VolatilityReport {
  status: 'ACTIVE' | 'LOW_VOLATILITY';
  marketContext: {
    btcDominance: string;
    marketPhase: string;
    topNarrative: string;
    globalSentiment: string;
  };
  opportunities: VolatilityOpportunity[];
  timestamp: number;
}
