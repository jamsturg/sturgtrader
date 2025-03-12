import axios, { AxiosInstance, AxiosError } from 'axios';
import { getApiConfig, saveApiConfig } from '../configService';
import type { HyperliquidConfig } from '../configService';
import type { HyperliquidOrder } from '../../lib/hyperliquid-sdk/types';

export class HyperfluidApiService {
  private config: HyperliquidConfig;
  private apiInstance: AxiosInstance;
  private wsConnection?: WebSocket;
  private reconnectAttempts = 0;

  constructor() {
    this.config = {
      apiUrl: process.env.NEXT_PUBLIC_HYPERLIQUID_API_URL || '',
      wsUrl: process.env.NEXT_PUBLIC_HYPERLIQUID_WS_URL || '',
      network: 'mainnet'
    };

    // Load initial config synchronously
    getApiConfig('hyperliquid')
      .then(savedConfig => {
        if (savedConfig) {
          this.config = { ...this.config, ...savedConfig };
        }
      })
      .catch(error => {
        console.error('Failed to load initial config:', error);
      });
    
    this.apiInstance = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-KEY': this.config.apiKey })
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.apiInstance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid API credentials - Please check your API key');
        }
        if (!error.response) {
          throw new Error('Network error - Please check API endpoint configuration');
        }
        return Promise.reject(error);
      }
    );
  }

  async initialize(network: string = 'mainnet'): Promise<boolean> {
    try {
      const savedConfig = await getApiConfig('hyperliquid');
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig };
      }
      
      this.config.network = network;
      await saveApiConfig('hyperliquid', this.config);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Hyperfluid service:', error);
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOpenOrders(): Promise<HyperliquidOrder[]> {
    const response = await this.apiInstance.get<{ orders: HyperliquidOrder[] }>('/orders/open');
    return response.data.orders;
  }

  /**
   * Check if the service is initialized
   */
  async isReady(): Promise<boolean> {
    try {
      interface StatusResponse {
        initialized: boolean;
        message?: string;
      }
      
      const response = await this.apiInstance.get<StatusResponse>('/status');
      return response.data.initialized;
    } catch (error) {
      console.error('Failed to check Hyperfluid service status', error);
      return false;
    }
  }

  /**
   * Create a new flow (continuous stream) from sender to receiver
   * @param tokenAddress The Super Token address
   * @param sender Sender address
   * @param receiver Receiver address
   * @param flowRate Flow rate per second in wei
   */
  async createFlow(tokenAddress: string, sender: string, receiver: string, flowRate: string): Promise<string> {
    interface CreateFlowResponse {
      transactionHash: string;
    }
    
    const response = await this.apiInstance.post<CreateFlowResponse>('/flows', {
      tokenAddress,
      sender,
      receiver,
      flowRate
    });
    return response.data.transactionHash;
  }

  /**
   * Update an existing flow
   * @param tokenAddress The Super Token address
   * @param sender Sender address
   * @param receiver Receiver address
   * @param flowRate New flow rate per second in wei
   */
  async updateFlow(tokenAddress: string, sender: string, receiver: string, flowRate: string): Promise<string> {
    interface UpdateFlowResponse {
      transactionHash: string;
    }
    
    const response = await this.apiInstance.put<UpdateFlowResponse>('/flows', {
      tokenAddress,
      sender,
      receiver,
      flowRate
    });
    return response.data.transactionHash;
  }

  /**
   * Delete an existing flow
   * @param tokenAddress The Super Token address
   * @param sender Sender address
   * @param receiver Receiver address
   */
  async deleteFlow(tokenAddress: string, sender: string, receiver: string): Promise<string> {
    interface DeleteFlowResponse {
      transactionHash: string;
    }
    
    const response = await this.apiInstance.delete<DeleteFlowResponse>('/flows', {
      data: {
        tokenAddress,
        sender,
        receiver
      }
    });
    return response.data.transactionHash;
  }

  /**
   * Get flow information
   * @param tokenAddress The Super Token address
   * @param sender Sender address
   * @param receiver Receiver address
   */
  async getFlow(tokenAddress: string, sender: string, receiver: string): Promise<any> {
    interface GetFlowResponse {
      // Add properties as needed
    }
    
    const response = await this.apiInstance.get<GetFlowResponse>('/flows', {
      params: {
        tokenAddress,
        sender,
        receiver
      }
    });
    return response.data;
  }

  /**
   * Get account total net flow and balance
   * @param tokenAddress The Super Token address
   * @param account User address
   */
  async getAccountFlowInfo(tokenAddress: string, account: string): Promise<any> {
    interface GetAccountFlowInfoResponse {
      // Add properties as needed
    }
    
    const response = await this.apiInstance.get<GetAccountFlowInfoResponse>(`/accounts/${account}`, {
      params: {
        tokenAddress
      }
    });
    return response.data;
  }
}

// Export a singleton instance
const hyperfluidApi = new HyperfluidApiService();
export default hyperfluidApi;
