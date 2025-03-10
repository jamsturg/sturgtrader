import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Exchange, WebsocketMessage, TradingPair, PriceData, OrderBookDepth } from './types';
import { logger } from '../../../utils/logger';

/**
 * WebSocketManager handles real-time connections to multiple cryptocurrency exchanges
 * It standardizes data from different exchanges and provides a unified interface
 * for the arbitrage engine to consume market data
 */
export class WebSocketManager extends EventEmitter {
  private connections: Map<string, WebSocket> = new Map();
  private connectionStatus: Map<string, boolean> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // exchange -> pairs
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private messageHandlers: Map<string, (message: any) => void> = new Map();
  private exchanges: Map<string, Exchange> = new Map();
  private latestPriceData: Map<string, Map<string, PriceData>> = new Map(); // exchange -> (pair -> data)
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Connection parameters
  private readonly reconnectInterval = 3000; // 3 seconds
  private readonly maxReconnectAttempts = 10;
  private readonly pingInterval = 30000; // 30 seconds
  private reconnectAttempts: Map<string, number> = new Map();

  constructor() {
    super();
    // Set max event listeners to avoid memory leak warnings
    this.setMaxListeners(100);
  }

  /**
   * Initialize the WebSocket manager with exchange configurations
   */
  public initialize(exchanges: Exchange[]): void {
    exchanges.forEach(exchange => {
      this.exchanges.set(exchange.id, exchange);
      this.reconnectAttempts.set(exchange.id, 0);
      this.latestPriceData.set(exchange.id, new Map());
      this.subscriptions.set(exchange.id, new Set());
    });
    
    logger.info(`WebSocketManager initialized with ${exchanges.length} exchanges`);
  }

  /**
   * Connect to all configured exchanges
   */
  public async connectAll(): Promise<void> {
    const promises = Array.from(this.exchanges.values()).map(exchange => 
      this.connect(exchange.id)
    );
    
    await Promise.allSettled(promises);
    logger.info('Connection attempts completed for all exchanges');
  }

  /**
   * Connect to a specific exchange
   */
  public async connect(exchangeId: string): Promise<boolean> {
    const exchange = this.exchanges.get(exchangeId);
    
    if (!exchange) {
      logger.error(`Cannot connect to unknown exchange: ${exchangeId}`);
      return false;
    }
    
    // Close existing connection if any
    this.closeConnection(exchangeId);
    
    try {
      logger.info(`Connecting to ${exchange.name} WebSocket at ${exchange.wsUrl}`);
      
      const ws = new WebSocket(exchange.wsUrl);
      
      return new Promise((resolve) => {
        // Setup message handler based on exchange type
        const messageHandler = this.createMessageHandler(exchange);
        this.messageHandlers.set(exchangeId, messageHandler);
        
        ws.on('open', () => {
          logger.info(`Connected to ${exchange.name} WebSocket`);
          this.connections.set(exchangeId, ws);
          this.connectionStatus.set(exchangeId, true);
          this.reconnectAttempts.set(exchangeId, 0);
          
          // Setup ping interval to keep connection alive
          const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              this.sendPing(exchangeId);
            }
          }, this.pingInterval);
          
          this.pingIntervals.set(exchangeId, pingInterval);
          
          // Resubscribe to previously subscribed pairs
          this.resubscribe(exchangeId);
          
          resolve(true);
        });
        
        ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            messageHandler(message);
          } catch (error) {
            logger.error(`Error parsing message from ${exchange.name}:`, error);
          }
        });
        
        ws.on('error', (error: Error) => {
          logger.error(`WebSocket error for ${exchange.name}:`, error);
          this.emit('error', { exchange: exchangeId, error });
        });
        
        ws.on('close', () => {
          logger.warn(`WebSocket connection closed for ${exchange.name}`);
          this.connectionStatus.set(exchangeId, false);
          this.clearPingInterval(exchangeId);
          
          // Attempt to reconnect
          this.scheduleReconnect(exchangeId);
          
          resolve(false);
        });
      });
    } catch (error) {
      logger.error(`Failed to connect to ${exchange.name}:`, error);
      this.connectionStatus.set(exchangeId, false);
      this.scheduleReconnect(exchangeId);
      return false;
    }
  }

  /**
   * Subscribe to market data for a trading pair on a specific exchange
   */
  public subscribe(exchangeId: string, pair: string): boolean {
    const exchange = this.exchanges.get(exchangeId);
    const ws = this.connections.get(exchangeId);
    
    if (!exchange || !ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn(`Cannot subscribe to ${pair} on ${exchangeId}: connection not ready`);
      // Add to pending subscriptions
      const pairs = this.subscriptions.get(exchangeId) || new Set<string>();
      pairs.add(pair);
      this.subscriptions.set(exchangeId, pairs);
      return false;
    }
    
    try {
      // Add to subscriptions set
      const pairs = this.subscriptions.get(exchangeId) || new Set<string>();
      pairs.add(pair);
      this.subscriptions.set(exchangeId, pairs);
      
      // Create subscription message based on exchange type
      const subscriptionMsg = this.createSubscriptionMessage(exchange, pair);
      
      // Send subscription message
      ws.send(JSON.stringify(subscriptionMsg));
      logger.info(`Subscribed to ${pair} on ${exchange.name}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to subscribe to ${pair} on ${exchange.name}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe from market data for a trading pair
   */
  public unsubscribe(exchangeId: string, pair: string): boolean {
    const exchange = this.exchanges.get(exchangeId);
    const ws = this.connections.get(exchangeId);
    
    if (!exchange || !ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn(`Cannot unsubscribe from ${pair} on ${exchangeId}: connection not ready`);
      return false;
    }
    
    try {
      // Remove from subscriptions set
      const pairs = this.subscriptions.get(exchangeId);
      if (pairs) {
        pairs.delete(pair);
      }
      
      // Create unsubscription message based on exchange type
      const unsubscriptionMsg = this.createUnsubscriptionMessage(exchange, pair);
      
      // Send unsubscription message
      ws.send(JSON.stringify(unsubscriptionMsg));
      logger.info(`Unsubscribed from ${pair} on ${exchange.name}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to unsubscribe from ${pair} on ${exchange.name}:`, error);
      return false;
    }
  }

  /**
   * Get the latest price data for a specific pair on an exchange
   */
  public getLatestPriceData(exchangeId: string, pair: string): PriceData | null {
    const exchangeData = this.latestPriceData.get(exchangeId);
    if (!exchangeData) return null;
    
    return exchangeData.get(pair) || null;
  }

  /**
   * Get all latest price data for a specific exchange
   */
  public getAllLatestPriceData(exchangeId: string): Map<string, PriceData> | null {
    return this.latestPriceData.get(exchangeId) || null;
  }

  /**
   * Close a specific exchange connection
   */
  public closeConnection(exchangeId: string): void {
    const ws = this.connections.get(exchangeId);
    if (ws) {
      this.clearPingInterval(exchangeId);
      
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      
      this.connections.delete(exchangeId);
      this.connectionStatus.set(exchangeId, false);
      logger.info(`Closed connection to ${exchangeId}`);
    }
    
    // Clear any pending reconnect timers
    const timer = this.reconnectTimers.get(exchangeId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(exchangeId);
    }
  }

  /**
   * Close all connections
   */
  public closeAll(): void {
    Array.from(this.connections.keys()).forEach(exchangeId => {
      this.closeConnection(exchangeId);
    });
    
    logger.info('Closed all WebSocket connections');
  }

  /**
   * Check if connected to a specific exchange
   */
  public isConnected(exchangeId: string): boolean {
    return this.connectionStatus.get(exchangeId) || false;
  }

  /**
   * Get all connected exchanges
   */
  public getConnectedExchanges(): string[] {
    return Array.from(this.connectionStatus.entries())
      .filter(([, connected]) => connected)
      .map(([exchangeId]) => exchangeId);
  }

  // Private helper methods
  
  /**
   * Schedule a reconnection attempt for an exchange
   */
  private scheduleReconnect(exchangeId: string): void {
    const attempts = this.reconnectAttempts.get(exchangeId) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      logger.error(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached for ${exchangeId}`);
      this.emit('maxReconnectAttemptsReached', exchangeId);
      return;
    }
    
    this.reconnectAttempts.set(exchangeId, attempts + 1);
    
    // Clear any existing timer
    const existingTimer = this.reconnectTimers.get(exchangeId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Calculate backoff time (exponential backoff with jitter)
    const backoff = Math.min(
      this.reconnectInterval * Math.pow(1.5, attempts),
      30000 // Max 30 seconds
    ) * (0.8 + Math.random() * 0.4); // Add 20% jitter
    
    logger.info(`Scheduling reconnect for ${exchangeId} in ${Math.round(backoff)}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);
    
    const timer = setTimeout(() => {
      this.connect(exchangeId);
    }, backoff);
    
    this.reconnectTimers.set(exchangeId, timer);
  }

  /**
   * Resubscribe to all previously subscribed pairs after reconnection
   */
  private resubscribe(exchangeId: string): void {
    const pairs = this.subscriptions.get(exchangeId);
    if (!pairs || pairs.size === 0) return;
    
    logger.info(`Resubscribing to ${pairs.size} pairs on ${exchangeId}`);
    
    Array.from(pairs).forEach(pair => {
      this.subscribe(exchangeId, pair);
    });
  }

  /**
   * Send a ping message to keep the connection alive
   */
  private sendPing(exchangeId: string): void {
    const exchange = this.exchanges.get(exchangeId);
    const ws = this.connections.get(exchangeId);
    
    if (!exchange || !ws || ws.readyState !== WebSocket.OPEN) return;
    
    try {
      // Different exchanges have different ping formats
      let pingMessage: any;
      
      switch (exchange.name.toLowerCase()) {
        case 'binance':
          pingMessage = { method: 'ping' };
          break;
        case 'kraken':
          pingMessage = { name: 'ping' };
          break;
        case 'coinbase':
          pingMessage = { type: 'heartbeat' };
          break;
        case 'kucoin':
          pingMessage = { id: Date.now(), type: 'ping' };
          break;
        default:
          pingMessage = { op: 'ping' };
      }
      
      ws.send(JSON.stringify(pingMessage));
    } catch (error) {
      logger.warn(`Failed to send ping to ${exchange.name}:`, error);
    }
  }

  /**
   * Clear the ping interval for an exchange
   */
  private clearPingInterval(exchangeId: string): void {
    const interval = this.pingIntervals.get(exchangeId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(exchangeId);
    }
  }

  /**
   * Create a message handler for a specific exchange
   * This standardizes the data format from different exchanges
   */
  private createMessageHandler(exchange: Exchange): (message: any) => void {
    return (message: any) => {
      try {
        let standardizedMessage: WebsocketMessage | null = null;
        
        // Handle different message formats based on exchange
        switch (exchange.name.toLowerCase()) {
          case 'binance':
            standardizedMessage = this.handleBinanceMessage(message);
            break;
          case 'kraken':
            standardizedMessage = this.handleKrakenMessage(message);
            break;
          case 'coinbase':
            standardizedMessage = this.handleCoinbaseMessage(message);
            break;
          case 'kucoin':
            standardizedMessage = this.handleKucoinMessage(message);
            break;
          default:
            logger.warn(`No message handler implemented for ${exchange.name}`);
            return;
        }
        
        if (standardizedMessage) {
          // Update latest price data if applicable
          if (standardizedMessage.type === 'ticker' || standardizedMessage.type === 'orderbook') {
            this.updatePriceData(standardizedMessage);
          }
          
          // Emit the standardized message for consumers
          this.emit('message', standardizedMessage);
        }
      } catch (error) {
        logger.error(`Error processing message from ${exchange.name}:`, error);
      }
    };
  }

  /**
   * Create a subscription message for a specific exchange and pair
   */
  private createSubscriptionMessage(exchange: Exchange, pair: string): any {
    // Format pair according to exchange requirements
    const formattedPair = this.formatPairForExchange(exchange, pair);
    
    // Different exchanges have different subscription formats
    switch (exchange.name.toLowerCase()) {
      case 'binance':
        return {
          method: 'SUBSCRIBE',
          params: [
            `${formattedPair.toLowerCase()}@ticker`,
            `${formattedPair.toLowerCase()}@depth10@100ms`
          ],
          id: Date.now()
        };
      
      case 'kraken':
        return {
          name: 'subscribe',
          reqid: Date.now(),
          pair: [formattedPair],
          subscription: {
            name: 'ticker'
          }
        };
      
      case 'coinbase':
        return {
          type: 'subscribe',
          product_ids: [formattedPair],
          channels: ['ticker', 'level2']
        };
      
      case 'kucoin':
        return {
          id: Date.now(),
          type: 'subscribe',
          topic: `/market/ticker:${formattedPair}`,
          privateChannel: false,
          response: true
        };
      
      default:
        return {
          op: 'subscribe',
          channel: 'ticker',
          market: formattedPair
        };
    }
  }

  /**
   * Create an unsubscription message for a specific exchange and pair
   */
  private createUnsubscriptionMessage(exchange: Exchange, pair: string): any {
    // Format pair according to exchange requirements
    const formattedPair = this.formatPairForExchange(exchange, pair);
    
    // Different exchanges have different unsubscription formats
    switch (exchange.name.toLowerCase()) {
      case 'binance':
        return {
          method: 'UNSUBSCRIBE',
          params: [
            `${formattedPair.toLowerCase()}@ticker`,
            `${formattedPair.toLowerCase()}@depth10@100ms`
          ],
          id: Date.now()
        };
      
      case 'kraken':
        return {
          name: 'unsubscribe',
          reqid: Date.now(),
          pair: [formattedPair],
          subscription: {
            name: 'ticker'
          }
        };
      
      case 'coinbase':
        return {
          type: 'unsubscribe',
          product_ids: [formattedPair],
          channels: ['ticker', 'level2']
        };
      
      case 'kucoin':
        return {
          id: Date.now(),
          type: 'unsubscribe',
          topic: `/market/ticker:${formattedPair}`,
          privateChannel: false,
          response: true
        };
      
      default:
        return {
          op: 'unsubscribe',
          channel: 'ticker',
          market: formattedPair
        };
    }
  }

  /**
   * Format a trading pair for a specific exchange
   */
  private formatPairForExchange(exchange: Exchange, pair: string): string {
    // Different exchanges use different delimiter formats for pairs
    switch (exchange.name.toLowerCase()) {
      case 'binance':
        return pair.replace('/', '').toLowerCase();
      
      case 'kraken':
        return pair.replace('/', '/');
      
      case 'coinbase':
        return pair.replace('/', '-');
      
      case 'kucoin':
        return pair.replace('/', '-');
      
      default:
        return pair;
    }
  }

  /**
   * Update the latest price data for a pair on an exchange
   */
  private updatePriceData(message: WebsocketMessage): void {
    if (!message.exchange || !message.data || !message.data.pair) return;
    
    const exchangeId = message.exchange;
    const pair = message.data.pair;
    
    let exchangeData = this.latestPriceData.get(exchangeId);
    if (!exchangeData) {
      exchangeData = new Map<string, PriceData>();
      this.latestPriceData.set(exchangeId, exchangeData);
    }
    
    let priceData = exchangeData.get(pair) || {
      exchange: exchangeId,
      pair,
      bid: 0,
      ask: 0,
      timestamp: 0,
      volume24h: 0,
      depth: { bids: [], asks: [] }
    };
    
    // Update with new data
    if (message.type === 'ticker') {
      priceData.bid = message.data.bid || priceData.bid;
      priceData.ask = message.data.ask || priceData.ask;
      priceData.timestamp = message.timestamp;
      priceData.volume24h = message.data.volume24h || priceData.volume24h;
    } else if (message.type === 'orderbook' && message.data.depth) {
      priceData.depth = message.data.depth;
      priceData.timestamp = message.timestamp;
      
      // Update best bid/ask from order book if available
      if (message.data.depth.bids.length > 0) {
        priceData.bid = message.data.depth.bids[0][0]; // Best bid price
      }
      
      if (message.data.depth.asks.length > 0) {
        priceData.ask = message.data.depth.asks[0][0]; // Best ask price
      }
    }
    
    exchangeData.set(pair, priceData);
  }

  /**
   * Handle messages from Binance
   */
  private handleBinanceMessage(message: any): WebsocketMessage | null {
    // Handle ping/pong
    if (message.id && message.result === null) {
      return null; // Subscription confirmation
    }
    
    if (message.e === 'ticker') {
      // Ticker data
      return {
        type: 'ticker',
        exchange: 'binance',
        data: {
          pair: message.s, // Symbol
          bid: parseFloat(message.b), // Best bid price
          ask: parseFloat(message.a), // Best ask price
          volume24h: parseFloat(message.v) // 24h volume
        },
        timestamp: message.E // Event time
      };
    } else if (message.e === 'depthUpdate') {
      // Order book update
      return {
        type: 'orderbook',
        exchange: 'binance',
        data: {
          pair: message.s, // Symbol
          depth: {
            bids: message.b.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
            asks: message.a.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])])
          }
        },
        timestamp: message.E // Event time
      };
    }
    
    return null;
  }

  /**
   * Handle messages from Kraken
   */
  private handleKrakenMessage(message: any): WebsocketMessage | null {
    // Kraken sends arrays for channel data
    if (Array.isArray(message)) {
      const [channelId, data, channelName, pair] = message;
      
      if (channelName === 'ticker') {
        return {
          type: 'ticker',
          exchange: 'kraken',
          data: {
            pair,
            bid: parseFloat(data.b[0]), // Best bid price
            ask: parseFloat(data.a[0]), // Best ask price
            volume24h: parseFloat(data.v[1]) // 24h volume
          },
          timestamp: Date.now()
        };
      }
    }
    
    return null;
  }

  /**
   * Handle messages from Coinbase
   */
  private handleCoinbaseMessage(message: any): WebsocketMessage | null {
    if (message.type === 'ticker') {
      return {
        type: 'ticker',
        exchange: 'coinbase',
        data: {
          pair: message.product_id,
          bid: parseFloat(message.best_bid),
          ask: parseFloat(message.best_ask),
          volume24h: parseFloat(message.volume_24h)
        },
        timestamp: new Date(message.time).getTime()
      };
    } else if (message.type === 'snapshot') {
      // Order book snapshot
      return {
        type: 'orderbook',
        exchange: 'coinbase',
        data: {
          pair: message.product_id,
          depth: {
            bids: message.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
            asks: message.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])])
          }
        },
        timestamp: Date.now()
      };
    }
    
    return null;
  }

  /**
   * Handle messages from KuCoin
   */
  private handleKucoinMessage(message: any): WebsocketMessage | null {
    if (message.type === 'message' && message.subject === 'ticker') {
      const data = message.data;
      
      return {
        type: 'ticker',
        exchange: 'kucoin',
        data: {
          pair: data.symbol,
          bid: parseFloat(data.bestBid),
          ask: parseFloat(data.bestAsk),
          volume24h: parseFloat(data.vol)
        },
        timestamp: data.time
      };
    }
    
    return null;
  }
}
