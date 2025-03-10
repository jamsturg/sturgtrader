// Common trading models for consistent data structures across different platforms

export interface Market {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  active: boolean;
  precision: {
    price: number;
    amount: number;
  };
  limits: {
    price: {
      min: number;
      max: number;
    };
    amount: {
      min: number;
      max: number;
    };
  };
  info: any; // Raw response from exchange
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  market: string;
  timeframe: string;
}

export interface Balance {
  asset: string;
  free: number;
  used: number;
  total: number;
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LOSS = 'STOP_LOSS',
  TAKE_PROFIT = 'TAKE_PROFIT',
  STOP_LIMIT = 'STOP_LIMIT',
  TRAILING_STOP = 'TRAILING_STOP'
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

export enum OrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
  PARTIALLY_FILLED = 'partially_filled'
}

export interface Order {
  id: string;
  timestamp: number;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  price: number;
  amount: number;
  cost: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  fee?: {
    cost: number;
    currency: string;
    rate?: number;
  };
  trades?: Trade[];
  info: any; // Raw response from exchange
}

export interface Trade {
  id: string;
  orderId: string;
  timestamp: number;
  symbol: string;
  side: OrderSide;
  price: number;
  amount: number;
  cost: number;
  fee?: {
    cost: number;
    currency: string;
    rate?: number;
  };
  info: any; // Raw response from exchange
}

export interface Position {
  id: string;
  symbol: string;
  timestamp: number;
  side: OrderSide;
  entryPrice: number;
  notional: number;
  leverage: number;
  unrealizedPnl: number;
  realizedPnl: number;
  liquidationPrice?: number;
  margin: number;
  marginType: 'isolated' | 'cross';
  size: number;
  info: any; // Raw response from exchange
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'paused' | 'error';
  config: any;
  performance?: {
    totalProfit: number;
    winRate: number;
    tradesCount: number;
    profitFactor?: number;
  };
}

export interface BacktestResult {
  strategyId: string;
  startDate: Date;
  endDate: Date;
  symbol: string;
  timeframe: string;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Trade[];
  equityCurve: Array<{timestamp: number, equity: number}>;
}
