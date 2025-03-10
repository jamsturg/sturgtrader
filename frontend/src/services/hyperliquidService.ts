import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Position interface matching the backend
 */
export interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice?: number;
  leverage: number;
}

/**
 * Order interface matching the backend
 */
export interface Order {
  id: string;
  symbol: string;
  isBuy: boolean;
  size: number;
  price: number;
  type: string;
  status: string;
  filled: number;
  timestamp: number;
}

/**
 * Market data interface
 */
export interface MarketData {
  name: string;
  markPrice: number;
  indexPrice: number;
  openInterest: number;
  volume24h: number;
  change24h: number;
  fundingRate: number;
}

/**
 * Service for interacting with Hyperliquid API
 */
export class HyperliquidService {
  /**
   * Get all user positions
   */
  public async getPositions(): Promise<Position[]> {
    try {
      const response = await axios.get(`${API_URL}/hyperliquid/positions`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  /**
   * Get all open orders
   */
  public async getOpenOrders(): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_URL}/hyperliquid/orders`);
      
      // Map response to our interface
      const orders: Order[] = (response.data.data || []).map((order: any) => ({
        id: order.oid || order.id,
        symbol: order.asset || order.symbol,
        isBuy: order.isBuy,
        size: parseFloat(order.sz || order.size),
        price: parseFloat(order.limitPx || order.price),
        type: this.getOrderType(order),
        status: this.getOrderStatus(order),
        filled: parseFloat(order.filled || '0'),
        timestamp: order.timestamp || Date.now()
      }));
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Get market data for a symbol
   */
  public async getMarketData(symbol: string): Promise<MarketData | null> {
    try {
      const response = await axios.get(`${API_URL}/hyperliquid/market/${symbol}`);
      const data = response.data.data;
      
      // Map to our interface
      return {
        name: data.name || symbol,
        markPrice: parseFloat(data.markPx || '0'),
        indexPrice: parseFloat(data.indexPx || '0'),
        openInterest: parseFloat(data.openInterest || '0'),
        volume24h: parseFloat(data.volume24h || '0'),
        change24h: this.calculateChange24h(data),
        fundingRate: parseFloat(data.funding || '0')
      };
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Place an order
   */
  public async placeOrder(orderData: {
    symbol: string;
    isBuy: boolean;
    size: number;
    price: number;
    orderType: 'limit' | 'market' | 'postOnly';
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
  }): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/hyperliquid/order`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(symbol: string, orderId: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/hyperliquid/cancel`, { symbol, orderId });
      return response.data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  /**
   * Helper method to determine order type
   */
  private getOrderType(order: any): string {
    if (order.orderType) return order.orderType;
    
    if (order.type === 'market' || order.r === 'market') {
      return 'market';
    } else if (order.type === 'postOnly' || order.r === 'postOnly') {
      return 'postOnly';
    } else {
      return 'limit';
    }
  }

  /**
   * Helper method to determine order status
   */
  private getOrderStatus(order: any): string {
    if (order.status) return order.status;
    
    if (order.filled && order.size && parseFloat(order.filled) >= parseFloat(order.size)) {
      return 'filled';
    } else if (order.filled && parseFloat(order.filled) > 0) {
      return 'partial';
    } else {
      return 'open';
    }
  }

  /**
   * Helper method to calculate 24h price change
   */
  private calculateChange24h(data: any): number {
    if (data.change24h) return parseFloat(data.change24h);
    
    if (data.markPx && data.open24h) {
      const mark = parseFloat(data.markPx);
      const open = parseFloat(data.open24h);
      return ((mark - open) / open) * 100;
    }
    
    return 0;
  }
}

// Export singleton instance
export const hyperliquidService = new HyperliquidService();
