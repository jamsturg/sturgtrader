import apiClient from './apiClient';
import { Market, Candle, Order, Trade, Position, Balance } from '../../../types/trading';

/**
 * FreqtradeApiService provides methods to interact with the Freqtrade API
 * through our backend API layer. This service makes real API calls to our
 * backend endpoints that integrate with Freqtrade.
 */
export class FreqtradeApiService {
  private baseUrl = '/api/trading/freqtrade';

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    return apiClient.get(`${this.baseUrl}/status`);
  }

  /**
   * Get available markets
   */
  async getMarkets(): Promise<Market[]> {
    return apiClient.get(`${this.baseUrl}/markets`);
  }

  /**
   * Get candle data for a market
   */
  async getCandles(market: string, timeframe: string, limit?: number): Promise<Candle[]> {
    return apiClient.get(`${this.baseUrl}/candles`, { params: { market, timeframe, limit } });
  }

  /**
   * Get current ticker for a market
   */
  async getTicker(market: string): Promise<any> {
    return apiClient.get(`${this.baseUrl}/ticker`, { params: { market } });
  }

  /**
   * Get order book for a market
   */
  async getOrderBook(market: string, depth?: number): Promise<any> {
    return apiClient.get(`${this.baseUrl}/orderbook`, { params: { market, depth } });
  }

  /**
   * Get account balances
   */
  async getBalances(): Promise<Balance[]> {
    return apiClient.get(`${this.baseUrl}/balances`);
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<Position[]> {
    return apiClient.get(`${this.baseUrl}/positions`);
  }

  /**
   * Get open orders
   */
  async getOpenOrders(): Promise<Order[]> {
    return apiClient.get(`${this.baseUrl}/orders/open`);
  }

  /**
   * Get closed orders
   */
  async getClosedOrders(limit?: number): Promise<Order[]> {
    return apiClient.get(`${this.baseUrl}/orders/closed`, { params: { limit } });
  }

  /**
   * Get trade history
   */
  async getTrades(limit?: number): Promise<Trade[]> {
    return apiClient.get(`${this.baseUrl}/trades`, { params: { limit } });
  }

  /**
   * Create a new order
   */
  async createOrder(market: string, type: string, side: 'buy'|'sell', amount: number, price?: number): Promise<Order> {
    return apiClient.post(`${this.baseUrl}/orders`, { market, type, side, amount, price });
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    return apiClient.delete(`${this.baseUrl}/orders/${orderId}`);
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(market?: string): Promise<boolean> {
    return apiClient.delete(`${this.baseUrl}/orders`, { params: { market } });
  }

  /**
   * Get all available strategies
   */
  async getStrategies(): Promise<any[]> {
    return apiClient.get(`${this.baseUrl}/strategies`);
  }

  /**
   * Start a strategy
   */
  async startStrategy(strategyName: string, config?: any): Promise<boolean> {
    return apiClient.post(`${this.baseUrl}/strategies/${strategyName}/start`, config);
  }

  /**
   * Stop a strategy
   */
  async stopStrategy(strategyName: string): Promise<boolean> {
    return apiClient.post(`${this.baseUrl}/strategies/${strategyName}/stop`);
  }

  /**
   * Update a strategy configuration
   */
  async updateStrategy(strategyName: string, config: any): Promise<boolean> {
    return apiClient.put(`${this.baseUrl}/strategies/${strategyName}`, config);
  }
}

// Export a singleton instance
const freqtradeApi = new FreqtradeApiService();
export default freqtradeApi;
