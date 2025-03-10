import { Trade, Order, Position, Balance, Candle, Market } from '../../models/trading';

/**
 * Common interface for all trading systems
 * This ensures consistent interaction regardless of the underlying trading platform
 */
export interface TradingSystem {
  // Connection and status
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): Promise<boolean>;
  getStatus(): Promise<any>;
  
  // Market data
  getMarkets(): Promise<Market[]>;
  getCandles(market: string, timeframe: string, limit?: number): Promise<Candle[]>;
  getTicker(market: string): Promise<any>;
  getOrderBook(market: string, depth?: number): Promise<any>;
  
  // Account information
  getBalances(): Promise<Balance[]>;
  getPositions(): Promise<Position[]>;
  getOpenOrders(): Promise<Order[]>;
  getClosedOrders(limit?: number): Promise<Order[]>;
  getTrades(limit?: number): Promise<Trade[]>;
  
  // Order management
  createOrder(market: string, type: string, side: 'buy'|'sell', amount: number, price?: number): Promise<Order>;
  cancelOrder(orderId: string): Promise<boolean>;
  cancelAllOrders(market?: string): Promise<boolean>;
  
  // Strategy and bot management
  getStrategies(): Promise<any[]>;
  startStrategy(strategyName: string, config?: any): Promise<boolean>;
  stopStrategy(strategyName: string): Promise<boolean>;
  modifyStrategy(strategyName: string, config: any): Promise<boolean>;
  
  // Additional platform-specific methods can be defined in extended interfaces
}
