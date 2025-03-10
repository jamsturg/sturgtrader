import axios, { AxiosInstance } from 'axios';
import { TradingSystem } from '../../interfaces/trading/TradingSystem';
import { Trade, Order, Position, Balance, Candle, Market, OrderSide, OrderType, OrderStatus } from '../../models/trading';
import { Logger } from '../../utils/logger';

/**
 * HummingbotService integrates with the Hummingbot Gateway API
 * Documentation: https://docs.hummingbot.org/gateway/overview
 */
export class HummingbotService implements TradingSystem {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private connected: boolean = false;
  private logger = new Logger('HummingbotService');

  constructor() {
    // Load from environment variables or config
    this.baseUrl = process.env.HUMMINGBOT_API_URL || '';
    this.apiKey = process.env.HUMMINGBOT_API_KEY || '';
    
    if (!this.baseUrl) {
      throw new Error('Hummingbot API URL not configured');
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
   * Connect to the Hummingbot API
   */
  async connect(): Promise<boolean> {
    try {
      const response = await this.client.get('/status');
      this.connected = response.status === 200;
      this.logger.info(`Connected to Hummingbot API: ${this.baseUrl}`);
      return this.connected;
    } catch (error) {
      this.logger.error('Failed to connect to Hummingbot API', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Disconnect from the Hummingbot API
   */
  async disconnect(): Promise<boolean> {
    this.connected = false;
    this.logger.info('Disconnected from Hummingbot API');
    return true;
  }

  /**
   * Check if connected to the API
   */
  async isConnected(): Promise<boolean> {
    if (!this.connected) return false;
    
    try {
      const response = await this.client.get('/status');
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
      this.logger.error('Failed to get Hummingbot status', error);
      throw error;
    }
  }

  /**
   * Get available markets
   */
  async getMarkets(): Promise<Market[]> {
    try {
      // Hummingbot requires specifying the connector/exchange
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/markets`);
      
      return Object.entries(response.data.markets).map(([symbol, market]: [string, any]) => ({
        id: symbol,
        symbol: symbol,
        base: market.base_asset,
        quote: market.quote_asset,
        active: true,
        precision: {
          price: market.price_precision || 8,
          amount: market.amount_precision || 8
        },
        limits: {
          price: {
            min: market.min_price || 0,
            max: market.max_price || 0
          },
          amount: {
            min: market.min_order_size || 0,
            max: market.max_order_size || Number.MAX_SAFE_INTEGER
          }
        },
        info: market
      }));
    } catch (error) {
      this.logger.error('Failed to get markets from Hummingbot', error);
      throw error;
    }
  }

  /**
   * Get candle data
   */
  async getCandles(market: string, timeframe: string, limit = 100): Promise<Candle[]> {
    try {
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/candles`, {
        params: {
          trading_pair: market,
          interval: timeframe,
          limit
        }
      });
      
      return response.data.candles.map((candle: any) => ({
        timestamp: new Date(candle.timestamp).getTime(),
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        volume: parseFloat(candle.volume),
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/ticker`, {
        params: {
          trading_pair: market
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get ticker for ${market}`, error);
      throw error;
    }
  }

  /**
   * Get order book for a market
   */
  async getOrderBook(market: string, depth = 20): Promise<any> {
    try {
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/order_book`, {
        params: {
          trading_pair: market,
          depth
        }
      });
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/balances`);
      
      return Object.entries(response.data.balances).map(([asset, balance]: [string, any]) => ({
        asset,
        free: parseFloat(balance.available),
        used: parseFloat(balance.total) - parseFloat(balance.available),
        total: parseFloat(balance.total)
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/positions`);
      
      return response.data.positions.map((position: any) => ({
        id: position.position_id,
        symbol: position.trading_pair,
        timestamp: new Date(position.timestamp).getTime(),
        side: position.position_side === 'LONG' ? OrderSide.BUY : OrderSide.SELL,
        entryPrice: parseFloat(position.entry_price),
        notional: parseFloat(position.amount) * parseFloat(position.entry_price),
        leverage: parseFloat(position.leverage),
        unrealizedPnl: parseFloat(position.unrealized_pnl),
        realizedPnl: parseFloat(position.realized_pnl),
        liquidationPrice: parseFloat(position.liquidation_price),
        margin: parseFloat(position.margin),
        marginType: position.margin_type.toLowerCase(),
        size: parseFloat(position.amount),
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/orders`, {
        params: { order_status: 'OPEN' }
      });
      
      return response.data.orders.map((order: any) => ({
        id: order.order_id,
        timestamp: new Date(order.creation_timestamp).getTime(),
        symbol: order.trading_pair,
        type: this.mapOrderType(order.order_type),
        side: order.trade_type.toLowerCase() as OrderSide,
        price: parseFloat(order.price),
        amount: parseFloat(order.amount),
        cost: parseFloat(order.price) * parseFloat(order.amount),
        filled: parseFloat(order.filled_amount) || 0,
        remaining: parseFloat(order.amount) - (parseFloat(order.filled_amount) || 0),
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/orders`, {
        params: { order_status: 'FILLED,CANCELED,REJECTED,EXPIRED', limit }
      });
      
      return response.data.orders.map((order: any) => ({
        id: order.order_id,
        timestamp: new Date(order.creation_timestamp).getTime(),
        symbol: order.trading_pair,
        type: this.mapOrderType(order.order_type),
        side: order.trade_type.toLowerCase() as OrderSide,
        price: parseFloat(order.price),
        amount: parseFloat(order.amount),
        cost: parseFloat(order.price) * parseFloat(order.amount),
        filled: parseFloat(order.filled_amount) || 0,
        remaining: 0,
        status: this.mapOrderStatus(order.order_status),
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const response = await this.client.get(`/gateway/connectors/${connector}/trades`, {
        params: { limit }
      });
      
      return response.data.trades.map((trade: any) => ({
        id: trade.trade_id,
        orderId: trade.order_id,
        timestamp: new Date(trade.timestamp).getTime(),
        symbol: trade.trading_pair,
        side: trade.trade_type.toLowerCase() as OrderSide,
        price: parseFloat(trade.price),
        amount: parseFloat(trade.amount),
        cost: parseFloat(trade.price) * parseFloat(trade.amount),
        fee: {
          cost: parseFloat(trade.fee_amount),
          currency: trade.fee_token,
          rate: 0 // Not always provided by Hummingbot
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const orderData: any = {
        connector,
        trading_pair: market,
        order_type: this.reverseMapOrderType(type as OrderType),
        trade_type: side.toUpperCase(),
        amount: amount.toString(),
        position_action: 'OPEN', // Default for spot, would be different for margin
        timestamp: Date.now()
      };
      
      // Add price for limit orders
      if (type.toUpperCase() !== 'MARKET' && price) {
        orderData.price = price.toString();
      }
      
      const response = await this.client.post(`/gateway/connectors/${connector}/orders`, orderData);
      const order = response.data.order;
      
      return {
        id: order.order_id,
        timestamp: new Date(order.creation_timestamp).getTime(),
        symbol: order.trading_pair,
        type: this.mapOrderType(order.order_type),
        side: side as OrderSide,
        price: parseFloat(order.price || '0'),
        amount: parseFloat(order.amount),
        cost: parseFloat(order.price || '0') * parseFloat(order.amount),
        filled: 0,
        remaining: parseFloat(order.amount),
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      await this.client.delete(`/gateway/connectors/${connector}/orders/${orderId}`);
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
      const connector = process.env.HUMMINGBOT_CONNECTOR || 'binance';
      const params = market ? { trading_pair: market } : {};
      await this.client.delete(`/gateway/connectors/${connector}/orders`, { params });
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
      const response = await this.client.get('/gateway/strategy/list');
      
      return response.data.strategies.map((strategy: any) => ({
        id: strategy.strategy_name,
        name: strategy.strategy_name,
        description: strategy.description || '',
        status: strategy.status.toLowerCase(),
        config: strategy.config || {}
      }));
    } catch (error) {
      this.logger.error('Failed to get strategies', error);
      throw error;
    }
  }

  /**
   * Start a strategy with configuration
   */
  async startStrategy(strategyName: string, config?: any): Promise<boolean> {
    try {
      const strategyConfig = {
        strategy_name: strategyName,
        ...config
      };
      
      await this.client.post('/gateway/strategy/start', strategyConfig);
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
      await this.client.post('/gateway/strategy/stop', { strategy_name: strategyName });
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
      const strategyConfig = {
        strategy_name: strategyName,
        ...config
      };
      
      await this.client.post('/gateway/strategy/update', strategyConfig);
      return true;
    } catch (error) {
      this.logger.error(`Failed to modify strategy ${strategyName}`, error);
      throw error;
    }
  }

  /**
   * Map Hummingbot order types to our standard OrderType
   */
  private mapOrderType(hummingbotType: string): OrderType {
    const typeMap: {[key: string]: OrderType} = {
      'LIMIT': OrderType.LIMIT,
      'MARKET': OrderType.MARKET,
      'STOP': OrderType.STOP_LOSS,
      'STOP_LIMIT': OrderType.STOP_LIMIT,
      'TRAILING_STOP': OrderType.TRAILING_STOP
    };
    
    return typeMap[hummingbotType.toUpperCase()] || OrderType.LIMIT;
  }

  /**
   * Map our OrderType to Hummingbot order types
   */
  private reverseMapOrderType(orderType: OrderType): string {
    const typeMap: {[key in OrderType]: string} = {
      [OrderType.LIMIT]: 'LIMIT',
      [OrderType.MARKET]: 'MARKET',
      [OrderType.STOP_LOSS]: 'STOP',
      [OrderType.STOP_LIMIT]: 'STOP_LIMIT',
      [OrderType.TAKE_PROFIT]: 'TAKE_PROFIT',
      [OrderType.TRAILING_STOP]: 'TRAILING_STOP'
    };
    
    return typeMap[orderType] || 'LIMIT';
  }

  /**
   * Map Hummingbot order status to our standard OrderStatus
   */
  private mapOrderStatus(status: string): OrderStatus {
    const statusMap: {[key: string]: OrderStatus} = {
      'OPEN': OrderStatus.OPEN,
      'PENDING': OrderStatus.OPEN,
      'FILLED': OrderStatus.CLOSED,
      'PARTIALLY_FILLED': OrderStatus.PARTIALLY_FILLED,
      'CANCELED': OrderStatus.CANCELED,
      'REJECTED': OrderStatus.REJECTED,
      'EXPIRED': OrderStatus.EXPIRED
    };
    
    return statusMap[status.toUpperCase()] || OrderStatus.OPEN;
  }
}
