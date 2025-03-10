
/**
 * Types for the high-speed arbitrage trading system
 */

export interface Exchange {
  id: string;
  name: string;
  baseUrl: string;
  wsUrl: string;
  apiKey?: string;
  apiSecret?: string;
  tradingFeePct: number; // Trading fee as percentage
  withdrawalFee: Record<string, number>; // Withdrawal fees indexed by asset symbol
  supportedAssets: string[];
}

export interface TradingPair {
  id: string;
  baseAsset: string;
  quoteAsset: string;
  minOrderSize: number;
  maxOrderSize: number;
  priceDecimals: number;
  quantityDecimals: number;
  exchanges: string[]; // Array of exchange IDs supporting this pair
}

export interface PriceData {
  exchange: string;
  pair: string;
  bid: number;
  ask: number;
  timestamp: number;
  volume24h?: number;
  depth?: OrderBookDepth;
}

export interface OrderBookDepth {
  bids: [number, number][]; // [price, quantity] pairs
  asks: [number, number][]; // [price, quantity] pairs
}

export interface ArbitrageOpportunity {
  id: string;
  buyExchange: string;
  sellExchange: string;
  pair: string;
  spreadPct: number; // Spread percentage
  potentialProfit: number;
  potentialProfitPct: number;
  timestamp: number;
  estimatedExecutionTimeMs: number;
  confidence: number; // 0-1 score based on depth, volume, etc.
  buyPrice: number;
  sellPrice: number;
  maxSize: number; // Maximum opportunity size based on liquidity
  status: OpportunityStatus;
  executionDetails?: ExecutionDetails;
}

export enum OpportunityStatus {
  DETECTED = "detected",
  ANALYZING = "analyzing",
  EXECUTING = "executing",
  EXECUTED = "executed",
  FAILED = "failed",
  IGNORED = "ignored"
}

export interface ExecutionDetails {
  buyOrderId?: string;
  sellOrderId?: string;
  executionStartTime: number;
  executionEndTime?: number;
  actualProfit?: number;
  actualProfitPct?: number;
  buyExecutionPrice?: number;
  sellExecutionPrice?: number;
  executionSize?: number;
  fees?: {
    buyFee: number;
    sellFee: number;
    transferFee?: number;
  };
  status: ExecutionStatus;
  error?: string;
}

export enum ExecutionStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface WebsocketMessage {
  type: string;
  exchange: string;
  data: any;
  timestamp: number;
}

export interface ArbitrageConfig {
  minProfitPct: number; // Minimum profit percentage to execute trades
  maxExecutionTimeMs: number; // Maximum allowed execution time
  enabledPairs: string[];
  enabledExchanges: string[];
  autoExecute: boolean; // Whether to execute trades automatically
  maxConcurrentTrades: number;
  balanceReservePct: number; // Percentage of balance to reserve
  riskLevel: RiskLevel; // Risk appetite for strategies
  notificationThresholds: {
    profitPct: number; // Notify on opportunities with profit > X%
    executionTimeMs: number; // Notify on opportunities executable within Y ms
  };
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export interface ArbitrageStats {
  totalOpportunitiesDetected: number;
  totalTradesExecuted: number;
  totalProfitBase: number; // Profit in base currency
  successRate: number; // Percentage of successful executions
  averageProfitPct: number;
  averageExecutionTimeMs: number;
  topProfitablePairs: Array<{pair: string, profit: number}>;
  topProfitableExchanges: Array<{exchange: string, profit: number}>;
  failureReasons: Record<string, number>;
  hourlyStats: Record<number, {
    opportunities: number;
    executed: number;
    profit: number;
  }>;
}

export interface AgentZeroTradingQuery {
  type: "arbitrage_analysis" | "market_anomaly" | "strategy_optimization";
  data: any;
  priority: number; // 1-10 scale
  responseTimeout: number; // ms to wait for response
}

export interface AgentZeroTradingResponse {
  type: string;
  recommendations: string[];
  analysisResults: any;
  confidence: number;
  executionDetails?: any;
  timestamp: number;
}
