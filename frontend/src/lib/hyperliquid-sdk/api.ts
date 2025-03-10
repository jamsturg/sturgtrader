import axios from 'axios';
import http from 'http';
import https from 'https';
import {
  CandlesSnapshot,
  Fills,
  FundingHistory,
  L2Snapshot,
  MarketData,
  OpenOrders,
  Subscription,
  Universe,
  UserState,
  VaultDetails,
  WsMsg,
} from './types';
import { WebsocketManager } from './websocketmanager';

export class API {
  httpAgent: http.Agent;
  httpsAgent: https.Agent;
  constructor(public baseUrl: string) {
    this.httpAgent = new http.Agent({ keepAlive: true });
    this.httpsAgent = new https.Agent({ keepAlive: true });
  }

  // Retry delay queue to implement rate limiting
  private retryDelay = 0;
  private lastRequestTime = 0;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private readonly minRequestInterval = 500; // Minimum 500ms between requests to avoid rate limiting

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minRequestInterval) {
        // Wait until we can make the next request
        await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
      }
      
      // Execute the next request in the queue
      const request = this.requestQueue.shift();
      if (request) {
        try {
          this.lastRequestTime = Date.now();
          await request();
        } catch (error) {
          console.error("Error processing queued request:", error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  private enqueueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      // Start processing the queue if it's not already in progress
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  public async post<T>(urlPath: string, payload = {}, retries = 3): Promise<T> {
    const executeRequest = async (): Promise<T> => {
      try {
        const response = await axios.post(this.baseUrl + urlPath, payload, {
          httpAgent: this.httpAgent,
          httpsAgent: this.httpsAgent,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        this.retryDelay = 0; // Reset retry delay on success
        return response.data;
      } catch (error: any) {
        // Rate limiting (429) or network errors should be retried
        if (retries > 0 && (error.response?.status === 429 || !error.response)) {
          const delay = this.retryDelay || 1000;
          this.retryDelay = Math.min(delay * 2, 10000); // Exponential backoff, max 10 seconds
          
          console.warn(`Request failed, retrying in ${delay}ms... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.post<T>(urlPath, payload, retries - 1);
        }
        
        throw error;
      }
    };
    
    // Enqueue the request to implement rate limiting
    return this.enqueueRequest<T>(executeRequest);
  }
}

export class Info extends API {
  wsManager!: WebsocketManager;

  constructor(baseUrl: string, skipWs = false) {
    super(baseUrl);
    if (!skipWs) {
      this.wsManager = new WebsocketManager(this.baseUrl);
    }
  }

  public async userState(user: string): Promise<UserState> {
    return await this.post<UserState>('/info', {
      type: 'clearinghouseState',
      user,
    });
  }

  public async vaultDetails(
    user: string | undefined,
    vaultAddress: string,
  ): Promise<VaultDetails> {
    return await this.post<VaultDetails>('/info', {
      type: 'vaultDetails',
      user,
      vaultAddress,
    });
  }

  public async metaAndAssetCtxs(): Promise<[Universe, MarketData]> {
    return await this.post<[Universe, MarketData]>('/info', {
      type: 'metaAndAssetCtxs',
    });
  }

  public async openOrders(user: string): Promise<OpenOrders> {
    return await this.post<OpenOrders>('/info', {
      type: 'openOrders',
      user,
    });
  }

  public async allMids(): Promise<Record<string, string>> {
    return await this.post<Record<string, string>>('/info', {
      type: 'allMids',
    });
  }

  public async userFills(user: string): Promise<Fills> {
    return await this.post<Fills>('/info', {
      type: 'userFills',
      user,
    });
  }

  public async meta(): Promise<Universe> {
    return await this.post<Universe>('/info', { type: 'meta' });
  }

  public async fundingHistory(
    coin: string,
    startTime: number,
    endTime?: number,
  ): Promise<FundingHistory> {
    const request = endTime
      ? { type: 'fundingHistory', coin, startTime, endTime }
      : { type: 'fundingHistory', coin, startTime };
    return await this.post<FundingHistory>('/info', request);
  }

  public async l2Snapshot(coin: string): Promise<L2Snapshot> {
    return await this.post<L2Snapshot>('/info', { type: 'l2Book', coin });
  }

  public async candlesSnapshot(
    coin: string,
    interval: string,
    startTime: number,
    endTime: number,
  ): Promise<CandlesSnapshot> {
    const request = { coin, interval, startTime, endTime };
    return await this.post<CandlesSnapshot>('/info', {
      type: 'candleSnapshot',
      req: request,
    });
  }

  public subscribe<T>(request: Subscription, callback: (data: T) => void): void {
    this.wsManager.subscribe(request, callback as (wsMsg: WsMsg) => void);
  }

  public unsubscribe(
    subscription: Subscription,
    subscription_id: number,
  ): boolean {
    if (!this.wsManager) {
      throw new Error('Cannot call unsubscribe since skipWs was used');
    } else {
      return this.wsManager.unsubscribe(subscription, subscription_id);
    }
  }
}
