import apiClient from './apiClient';

/**
 * HyperfluidApiService provides methods to interact with the Hyperfluid SDK
 * integration in our backend. This service makes real API calls to our
 * backend endpoints for streaming cryptocurrency payments.
 */
export class HyperfluidApiService {
  private baseUrl = '/api/payments/hyperfluid';

  /**
   * Initialize the Hyperfluid service with a provider
   * This must be called before using other methods
   * @param providerNetwork Ethereum network name (mainnet, goerli, etc.)
   */
  async initialize(providerNetwork: string = 'mainnet'): Promise<boolean> {
    try {
      interface InitResponse {
        success: boolean;
        message?: string;
      }
      
      const response = await apiClient.post<InitResponse>(`${this.baseUrl}/initialize`, { network: providerNetwork });
      return response.success;
    } catch (error) {
      console.error('Failed to initialize Hyperfluid service', error);
      return false;
    }
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
      
      const response = await apiClient.get<StatusResponse>(`${this.baseUrl}/status`);
      return response.initialized;
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
    
    const response = await apiClient.post<CreateFlowResponse>(`${this.baseUrl}/flows`, {
      tokenAddress,
      sender,
      receiver,
      flowRate
    });
    return response.transactionHash;
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
    
    const response = await apiClient.put<UpdateFlowResponse>(`${this.baseUrl}/flows`, {
      tokenAddress,
      sender,
      receiver,
      flowRate
    });
    return response.transactionHash;
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
    
    const response = await apiClient.delete<DeleteFlowResponse>(`${this.baseUrl}/flows`, {
      data: {
        tokenAddress,
        sender,
        receiver
      }
    });
    return response.transactionHash;
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
    
    const response = await apiClient.get<GetFlowResponse>(`${this.baseUrl}/flows`, {
      params: {
        tokenAddress,
        sender,
        receiver
      }
    });
    return response;
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
    
    const response = await apiClient.get<GetAccountFlowInfoResponse>(`${this.baseUrl}/accounts/${account}`, {
      params: {
        tokenAddress
      }
    });
    return response;
  }
}

// Export a singleton instance
const hyperfluidApi = new HyperfluidApiService();
export default hyperfluidApi;
