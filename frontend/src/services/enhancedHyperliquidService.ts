import { ethers } from 'ethers';
import { Exchange, Info, MAINNET_API_URL } from '../lib/hyperliquid-sdk';
import { UserState, OpenOrders, Fills, CandlesSnapshot, OrderRequest, OrderType, Tif } from '../lib/hyperliquid-sdk/types';

// Re-export interfaces with normalized properties for rest of application
export interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice?: number;
  leverage: number;
  marginUsed: string;
  maxLeverage: number;
}

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

export interface MarketData {
  name: string;
  markPrice: number;
  indexPrice: number;
  openInterest: number;
  volume24h: number;
  change24h: number;
  fundingRate: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  size: number;
  price: number;
  fee: number;
  timestamp: number;
  pnl?: number;
}

export interface OrderParams {
  symbol: string;
  isBuy: boolean;
  size: number;
  price: number;
  orderType: 'limit' | 'market' | 'postOnly';
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  reduceOnly?: boolean;
}

export class EnhancedHyperliquidService {
  private info: Info;
  private exchange: Exchange | null = null;
  private wallet: ethers.Wallet | null = null;
  private apiUrl: string;
  private secretKey: string | null = null;
  
  constructor() {
    // Use the Hyperliquid Mainnet API by default
    this.apiUrl = MAINNET_API_URL;
    this.info = new Info(this.apiUrl);
  }

  /**
   * Initialize the service with a private key for authenticated operations
   */
  public async initialize(privateKey?: string): Promise<boolean> {
    try {
      if (privateKey) {
        this.secretKey = privateKey;
        this.wallet = new ethers.Wallet(privateKey);
        this.exchange = await Exchange.create(this.wallet, this.apiUrl);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Hyperliquid service:', error);
      return false;
    }
  }

  /**
   * Check if authenticated operations are available
   */
  public isAuthenticated(): boolean {
    return !!this.exchange && !!this.wallet;
  }

  /**
   * Get user positions using the SDK
   */
  public async getPositions(): Promise<Position[]> {
    try {
      if (!this.wallet) {
        throw new Error('Authentication required for this operation');
      }

      const userState: UserState = await this.info.userState(this.wallet.address);
      
      if (!userState.assetPositions || !userState.assetPositions.length) {
        return [];
      }

      const positions: Position[] = userState.assetPositions.map(assetPosition => {
        const pos = assetPosition.position;
        const entryPx = parseFloat(pos.entryPx);
        const markPx = parseFloat((pos as any).markPx || '0'); // Assuming markPx might be available
        const size = parseFloat(pos.szi);
        const unrealizedPnl = parseFloat(pos.unrealizedPnl);
        
        const leverageValue = typeof pos.leverage === 'object' && pos.leverage.type === 'cross' 
          ? pos.leverage.value 
          : 1;

        return {
          symbol: pos.coin,
          size: size,
          entryPrice: entryPx,
          markPrice: markPx || entryPx, // Fallback to entry if mark not available
          pnl: unrealizedPnl,
          pnlPercent: entryPx > 0 ? (unrealizedPnl / (entryPx * Math.abs(size))) * 100 : 0,
          liquidationPrice: pos.liquidationPx ? parseFloat(pos.liquidationPx) : undefined,
          leverage: leverageValue,
          marginUsed: pos.marginUsed,
          maxLeverage: pos.maxLeverage
        };
      });

      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  /**
   * Get open orders using the SDK
   */
  public async getOpenOrders(): Promise<Order[]> {
    try {
      if (!this.wallet) {
        throw new Error('Authentication required for this operation');
      }

      const openOrders: OpenOrders = await this.info.openOrders(this.wallet.address);
      
      const orders: Order[] = openOrders.map(order => ({
        id: order.oid.toString(),
        symbol: order.coin,
        isBuy: order.side === 'B', // 'B' for buy, 'A' for ask/sell
        size: parseFloat(order.sz),
        price: parseFloat(order.limitPx),
        type: order.limitPx === '0' ? 'market' : 'limit',
        status: parseFloat(order.sz) < parseFloat(order.origSz) ? 'partial' : 'open',
        filled: parseFloat(order.origSz) - parseFloat(order.sz),
        timestamp: order.timestamp
      }));
      
      return orders;
    } catch (error) {
      console.error('Error fetching open orders:', error);
      throw error;
    }
  }

  /**
   * Get recent fills/transactions
   */
  public async getRecentTransactions(): Promise<Transaction[]> {
    try {
      if (!this.wallet) {
        throw new Error('Authentication required for this operation');
      }

      const fills: Fills = await this.info.userFills(this.wallet.address);
      
      const transactions: Transaction[] = fills.map(fill => ({
        id: fill.oid.toString(),
        symbol: fill.coin,
        type: fill.side === 'B' ? 'buy' : 'sell',
        size: parseFloat(fill.sz),
        price: parseFloat(fill.px),
        fee: parseFloat(fill.fee),
        timestamp: fill.time,
        pnl: parseFloat(fill.closedPnl)
      }));
      
      return transactions;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Get market data for all available markets
   */
  public async getAllMarketData(): Promise<MarketData[]> {
    try {
      const meta = await this.info.meta();
      const mids = await this.info.allMids();
      
      const marketDataPromises = meta.universe.map(async (asset) => {
        const symbol = asset.name;
        return this.getMarketData(symbol);
      });
      
      const marketsData = await Promise.all(marketDataPromises);
      return marketsData.filter(data => data !== null) as MarketData[];
    } catch (error) {
      console.error('Error fetching all market data:', error);
      return [];
    }
  }

  /**
   * Get market data for a specific symbol
   */
  public async getMarketData(symbol: string): Promise<MarketData | null> {
    try {
      // Get universe data for this coin
      const meta = await this.info.meta();
      const asset = meta.universe.find(a => a.name === symbol);
      
      if (!asset) {
        throw new Error(`Symbol ${symbol} not found`);
      }
      
      // Get current mid price
      const mids = await this.info.allMids();
      const price = parseFloat(mids[symbol] || '0');
      
      // Get funding rate
      const now = new Date().getTime();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const fundingHistory = await this.info.fundingHistory(symbol, oneDayAgo);
      const latestFunding = fundingHistory.length > 0 ? fundingHistory[fundingHistory.length - 1] : null;
      
      // Get 24h price change using candles
      const candles = await this.info.candlesSnapshot(
        symbol,
        '1d',
        oneDayAgo,
        now
      );
      
      const change24h = this.calculateChange24h(candles);
      
      // Get L2 book for volume estimation
      const l2Data = await this.info.l2Snapshot(symbol);
      const openInterest = this.estimateOpenInterest(l2Data.levels);
      
      return {
        name: symbol,
        markPrice: price,
        indexPrice: price, // Assuming index price is similar to mark price
        openInterest: openInterest,
        volume24h: candles.length > 0 ? parseFloat(candles[0].v) : 0,
        change24h: change24h,
        fundingRate: latestFunding ? parseFloat(latestFunding.fundingRate) * 100 : 0
      };
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get historical price candles for a symbol
   */
  public async getPriceHistory(
    symbol: string, 
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h',
    startTime?: number,
    endTime?: number
  ): Promise<any[]> {
    try {
      const now = endTime || new Date().getTime();
      const start = startTime || now - 7 * 24 * 60 * 60 * 1000; // Default to 7 days
      
      const candles = await this.info.candlesSnapshot(symbol, interval, start, now);
      
      return candles.map(candle => ({
        timestamp: candle.t,
        open: parseFloat(candle.o),
        high: parseFloat(candle.h),
        low: parseFloat(candle.l),
        close: parseFloat(candle.c),
        volume: parseFloat(candle.v)
      }));
    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Place an order using the SDK
   */
  public async placeOrder(params: OrderParams): Promise<any> {
    try {
      if (!this.exchange) {
        throw new Error('Authentication required for this operation');
      }
      
      // Convert order type to SDK format
      let orderType: OrderType;
      const tif: Tif = this.mapTimeInForce(params.timeInForce || 'GTC');
      
      if (params.orderType === 'market') {
        orderType = { market: {} };
      } else if (params.orderType === 'postOnly') {
        orderType = { limit: { tif: 'Alo' } };
      } else {
        orderType = { limit: { tif } };
      }
      
      // Place the order
      const result = await this.exchange.order(
        params.symbol,
        params.isBuy,
        params.size,
        params.price,
        orderType,
        params.reduceOnly || false
      );
      
      return {
        success: result.status === 'ok',
        data: result.response,
        message: result.status === 'ok' ? 'Order placed successfully' : result.response?.error || 'Failed to place order'
      };
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Cancel an order using the SDK
   */
  public async cancelOrder(symbol: string, orderId: string): Promise<any> {
    try {
      if (!this.exchange) {
        throw new Error('Authentication required for this operation');
      }
      
      const result = await this.exchange.cancel(symbol, parseInt(orderId));
      
      return {
        success: result.status === 'ok',
        data: result.response,
        message: result.status === 'ok' ? 'Order cancelled successfully' : result.response?.error || 'Failed to cancel order'
      };
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time WebSocket events
   */
  public subscribeToMarketUpdates(symbol: string, callback: (data: any) => void): () => void {
    this.info.subscribe({ type: 'l2Book', coin: symbol }, callback);
    return () => {
      // Placeholder for unsubscribe functionality
      // The SDK doesn't directly provide an unsubscribe method
    };
  }

  /**
   * Subscribe to user account events
   */
  public subscribeToUserEvents(callback: (data: any) => void): () => void {
    if (!this.wallet) {
      throw new Error('Authentication required for this operation');
    }
    
    this.info.subscribe({ type: 'userEvents', user: this.wallet.address }, callback);
    return () => {
      // Placeholder for unsubscribe functionality
    };
  }

  /**
   * Helper: Map time in force parameter to SDK format
   */
  private mapTimeInForce(timeInForce: string): Tif {
    switch (timeInForce) {
      case 'IOC':
        return 'Ioc';
      case 'FOK':
        return 'Alo'; // The SDK might not have FOK, so we use Alo (Post-Only) as a fallback
      case 'GTC':
      default:
        return 'Gtc';
    }
  }

  /**
   * Helper: Calculate 24h price change from candles
   */
  private calculateChange24h(candles: CandlesSnapshot): number {
    if (candles.length < 1) return 0;
    
    const latestCandle = candles[0];
    const openPrice = parseFloat(latestCandle.o);
    const closePrice = parseFloat(latestCandle.c);
    
    if (openPrice === 0) return 0;
    return ((closePrice - openPrice) / openPrice) * 100;
  }

  /**
   * Helper: Estimate open interest from order book levels
   */
  private estimateOpenInterest(levels: any[][]): number {
    if (!levels || !levels.length || !levels[0] || !levels[0].length) {
      return 0;
    }
    
    // Sum up the sizes on both sides of the book as a rough estimate
    let totalSize = 0;
    
    // Process bids and asks (if available)
    for (const side of levels) {
      if (!side) continue;
      
      for (const level of side) {
        if (level && level.sz) {
          totalSize += parseFloat(level.sz);
        }
      }
    }
    
    return totalSize;
  }
}

// Export singleton instance
export const enhancedHyperliquidService = new EnhancedHyperliquidService();
