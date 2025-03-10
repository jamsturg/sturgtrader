import axios, { AxiosInstance } from 'axios';
import { TradingSystem } from '../../interfaces/trading/TradingSystem';
import { Trade, Order, Position, Balance, Candle, Market, OrderSide, OrderType, OrderStatus } from '../../models/trading';
import { Logger } from '../../utils/logger';

/**
 * FreqtradeService integrates with the Freqtrade REST API
 * Documentation: https://www.freqtrade.io/en/stable/rest-api/
 */
export class FreqtradeService implements TradingSystem {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private connected: boolean = false;
  private logger = new Logger('FreqtradeService');

  constructor() {
    // Load from environment variables or config
    this.baseUrl = process.env.FREQTRADE_API_URL || '';
    this.apiKey = process.env.FREQTRADE_API_KEY || '';
    
    if (!this.baseUrl) {
      throw new Error('Freqtrade API URL not configured');
    }
    
    // Initialize axios client
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });
    
    // Add authentication if API key is provided
    if (this.apiKey) {
      this.client.interceptors.request.use(config => {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${this.apiKey}`;
        return config;
      });
    }
  }

  /**
   * Connect to the Freqtrade API
   */
  async connect(): Promise<boolean> {
    try {
      const response = await this.client.get('/ping');
      this.connected = response.status === 200;
      this.logger.info(`Connected to Freqtrade API: ${this.baseUrl}`);
      return this.connected;
    } catch (error) {
      this.logger.error('Failed to connect to Freqtrade API', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Disconnect from the Freqtrade API
   */
  async disconnect(): Promise<boolean> {
    this.connected = false;
    this.logger.info('Disconnected from Freqtrade API');
    return true;
  }

  /**
   * Check if connected to the API
   */
  async isConnected(): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      const response = await this.client.get('/ping');
      return response.status === 200;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Freqtrade status', error);
      throw error;
    }
  }

  /**
   * Get available markets
   */
  async getMarkets(): Promise<Market[]> {
    try {
      const response = await this.client.get('/exchange/pairs');
      
      return response.data.map((pair: any) => ({
        id: pair.symbol,
        symbol: pair.symbol,
        base: pair.base,
        quote: pair.quote,
        active: true,
        precision: {
          price: pair.precision_price || 8,
          amount: pair.precision_amount || 8
        },
        limits: {
          price: {
            min: pair.limits_price_min || 0,
            max: pair.limits_price_max || 0
          },
          amount: {
            min: pair.limits_amount_min || 0,
            max: pair.limits_amount_max || 0
          }
        },
        info: pair
      }));
    } catch (error) {
      this.logger.error('Failed to get markets from Freqtrade', error);
      throw error;
    }
  }

  /**
   * Get candle data
   */
  async getCandles(market: string, timeframe: string, limit = 100): Promise<Candle[]> {
    try {
      const response = await this.client.get(`/history/pair?pair=${market}&timeframe=${timeframe}&limit=${limit}`);
      
      return response.data.data.map((candle: any) => ({
        timestamp: new Date(candle[0]).getTime(),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
        market,
        timeframe
      }));
    } catch (error) {
      this.logger.error(`Failed to get candles for ${market}`, error);
      throw error;
    }
  }

  /**
   * Get current ticker for a market
   */
  async getTicker(market: string): Promise<any> {
    try {
      const response = await this.client.get(`/exchange/ticker?pair=${market}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get ticker for ${market}`, error);
      throw error;
    }
  }

  /**
   * Get order book for a market
   */
  async getOrderBook(market: string, depth = 100): Promise<any> {
    try {
      const response = await this.client.get(`/exchange/orderbook?pair=${market}&depth=${depth}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get order book for ${market}`, error);
      throw error;
    }
  }

  /**
   * Get account balances
   */
  async getBalances(): Promise<Balance[]> {
    try {
      const response = await this.client.get('/balance');
      
      return Object.entries(response.data).map(([asset, amount]: [string, any]) => ({
        asset,
        free: amount, // Freqtrade doesn't provide free/used distinction by default
        used: 0,
        total: amount
      }));
    } catch (error) {
      this.logger.error('Failed to get balances', error);
      throw error;
    }
  }

  /**
   * Get open positions
   */
  async getPositions(): Promise<Position[]> {
    try {
      const response = await this.client.get('/status');
      
      if (!response.data || !response.data.result) {
        return [];
      }
      
      return response.data.result.map((position: any) => ({
        id: position.trade_id.toString(),
        symbol: position.pair,
        timestamp: new Date(position.open_date).getTime(),
        side: position.is_short ? OrderSide.SELL : OrderSide.BUY,
        entryPrice: position.open_rate,
        notional: position.stake_amount,
        leverage: 1, // Freqtrade doesn't use leverage by default
        unrealizedPnl: position.profit_abs || 0,
        realizedPnl: 0,
        margin: position.stake_amount,
        marginType: 'isolated',
        size: position.amount,
        info: position
      }));
    } catch (error) {
      this.logger.error('Failed to get positions', error);
      throw error;
    }
  }

  /**
   * Get open orders
   */
  async getOpenOrders(): Promise<Order[]> {
    try {
      const response = await this.client.get('/orders/open');
      
      return response.data.map((order: any) => ({
        id: order.order_id,
        timestamp: new Date(order.order_date).getTime(),
        symbol: order.pair,
        type: this.mapOrderType(order.order_type),
        side: order.is_open ? OrderSide.BUY : OrderSide.SELL, // Simplified mapping
        price: order.order_price,
        amount: order.amount,
        cost: order.cost,
        filled: order.filled || 0,
        remaining: order.remaining || order.amount,
        status: OrderStatus.OPEN,
        info: order
      }));
    } catch (error) {
      this.logger.error('Failed to get open orders', error);
      throw error;
    }
  }

  /**
   * Get closed orders
   */
  async getClosedOrders(limit = 50): Promise<Order[]> {
    try {
      const response = await this.client.get(`/orders/closed?limit=${limit}`);
      
      return response.data.map((order: any) => ({
        id: order.order_id,
        timestamp: new Date(order.close_date || order.order_date).getTime(),
        symbol: order.pair,
        type: this.mapOrderType(order.order_type),
        side: order.is_open ? OrderSide.BUY : OrderSide.SELL,
        price: order.order_price,
        amount: order.amount,
        cost: order.cost,
        filled: order.filled || order.amount,
        remaining: 0,
        status: OrderStatus.CLOSED,
        info: order
      }));
    } catch (error) {
      this.logger.error('Failed to get closed orders', error);
      throw error;
    }
  }

  /**
   * Get trade history
   */
  async getTrades(limit = 50): Promise<Trade[]> {
    try {
      const response = await this.client.get(`/trades?limit=${limit}`);
      
      return response.data.trades.map((trade: any) => ({
        id: trade.trade_id.toString(),
        orderId: trade.order_id || '',
        timestamp: new Date(trade.close_date || trade.open_date).getTime(),
        symbol: trade.pair,
        side: trade.is_short ? OrderSide.SELL : OrderSide.BUY,
        price: trade.close_rate || trade.open_rate,
        amount: trade.amount,
        cost: trade.stake_amount,
        fee: {
          cost: trade.fee_value || 0,
          currency: trade.fee_currency || 'USD',
          rate: trade.fee_rate || 0
        },
        info: trade
      }));
    } catch (error) {
      this.logger.error('Failed to get trades', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(market: string, type: string, side: 'buy'|'sell', amount: number, price?: number): Promise<Order> {
    try {
      const orderData: any = {
        pair: market,
        order_type: this.reverseMapOrderType(type as OrderType),
        side: side,
        amount: amount,
        ...(price && { rate: price })
      };
      
      const response = await this.client.post('/orders', orderData);
      const order = response.data;
      
      return {
        id: order.order_id,
        timestamp: new Date(order.order_date).getTime(),
        symbol: order.pair,
        type: this.mapOrderType(order.order_type),
        side: side as OrderSide,
        price: price || 0,
        amount: amount,
        cost: amount * (price || 0),
        filled: 0,
        remaining: amount,
        status: OrderStatus.OPEN,
        info: order
      };
    } catch (error) {
      this.logger.error(`Failed to create order for ${market}`, error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.client.delete(`/orders/${orderId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel order ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(market?: string): Promise<boolean> {
    try {
      const endpoint = market ? `/orders?pair=${market}` : '/orders';
      await this.client.delete(endpoint);
      return true;
    } catch (error) {
      this.logger.error('Failed to cancel all orders', error);
      throw error;
    }
  }

  /**
   * Get all available strategies
   */
  async getStrategies(): Promise<any[]> {
    try {
      const response = await this.client.get('/strategies');
      
      return response.data.strategies.map((name: string) => ({
        id: name,
        name: name,
        description: '',
        status: 'inactive',
        config: {}
      }));
    } catch (error) {
      this.logger.error('Failed to get strategies', error);
      throw error;
    }
  }

  /**
   * Start a strategy with optional configuration
   */
  async startStrategy(strategyName: string, config?: any): Promise<boolean> {
    try {
      const data = {
        strategy: strategyName,
        ...config
      };
      
      await this.client.post('/start', data);
      return true;
    } catch (error) {
      this.logger.error(`Failed to start strategy ${strategyName}`, error);
      throw error;
    }
  }

  /**
   * Stop a running strategy
   */
  async stopStrategy(strategyName: string): Promise<boolean> {
    try {
      await this.client.post('/stop');
      return true;
    } catch (error) {
      this.logger.error(`Failed to stop strategy ${strategyName}`, error);
      throw error;
    }
  }

  /**
   * Modify a strategy configuration
   */
  async modifyStrategy(strategyName: string, config: any): Promise<boolean> {
    try {
      const data = {
        strategy: strategyName,
        ...config
      };
      
      await this.client.post('/reload_config', data);
      return true;
    } catch (error) {
      this.logger.error(`Failed to modify strategy ${strategyName}`, error);
      throw error;
    }
  }

  /**
   * Map Freqtrade order types to our standard OrderType
   */
  private mapOrderType(freqtradeType: string): OrderType {
    const typeMap: {[key: string]: OrderType} = {
      'limit': OrderType.LIMIT,
      'market': OrderType.MARKET,
      'stop_loss': OrderType.STOP_LOSS,
      'stop_loss_limit': OrderType.STOP_LIMIT
    };
    
    return typeMap[freqtradeType.toLowerCase()] || OrderType.LIMIT;
  }

  /**
   * Map our OrderType to Freqtrade order types
   */
  private reverseMapOrderType(orderType: OrderType): string {
    const typeMap: {[key in OrderType]: string} = {
      [OrderType.LIMIT]: 'limit',
      [OrderType.MARKET]: 'market',
      [OrderType.STOP_LOSS]: 'stop_loss',
      [OrderType.STOP_LIMIT]: 'stop_loss_limit',
      [OrderType.TAKE_PROFIT]: 'limit',  // Freqtrade doesn't have take profit
      [OrderType.TRAILING_STOP]: 'limit'  // Freqtrade doesn't have trailing stop
    };
    
    return typeMap[orderType] || 'limit';
  }
}
