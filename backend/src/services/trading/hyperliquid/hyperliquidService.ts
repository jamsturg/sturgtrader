import axios from 'axios';
import { ethers } from 'ethers';
import { logger } from '../../../utils/logger';

/**
 * Interface for Hyperliquid order parameters
 */
interface HyperliquidOrderParams {
  symbol: string;
  isBuy: boolean;
  size: number;
  price: number;
  orderType: 'limit' | 'market' | 'postOnly';
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

/**
 * Interface for Hyperliquid position
 */
interface HyperliquidPosition {
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
 * Service for interacting with the Hyperliquid API
 * Based on the Hyperliquid Python SDK
 */
class HyperliquidService {
  private apiUrl: string;
  private apiKey: string | null = null;
  private signer: ethers.Wallet | null = null;
  private accountAddress: string | null = null;
  private isInitialized = false;

  constructor() {
    this.apiUrl = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz';
    this.initialize();
  }

  /**
   * Initialize the Hyperliquid service
   */
  public async initialize(): Promise<boolean> {
    try {
      if (process.env.HYPERLIQUID_SECRET_KEY) {
        // Initialize with private key if available
        this.signer = new ethers.Wallet(process.env.HYPERLIQUID_SECRET_KEY);
        this.accountAddress = process.env.HYPERLIQUID_ACCOUNT_ADDRESS || this.signer.address;
        logger.info(`Hyperliquid service initialized with account: ${this.accountAddress}`);
      } else if (process.env.HYPERLIQUID_API_KEY) {
        // Initialize with API key if available
        this.apiKey = process.env.HYPERLIQUID_API_KEY;
        this.accountAddress = process.env.HYPERLIQUID_ACCOUNT_ADDRESS || '';
        logger.info(`Hyperliquid service initialized with API key`);
      } else {
        logger.warn('Hyperliquid service initialized in read-only mode');
      }
      
      this.isInitialized = true;
      return true;
    } catch (error: any) {
      logger.error(`Failed to initialize Hyperliquid service: ${error.message}`);
      return false;
    }
  }

  /**
   * Get user account state
   */
  public async getUserState(): Promise<any> {
    if (!this.accountAddress) {
      throw new Error('Account address not set');
    }

    try {
      const response = await axios.post(`${this.apiUrl}/info`, {
        type: 'userState',
        user: this.accountAddress
      });
      
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to get user state: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active positions for the user
   */
  public async getPositions(): Promise<HyperliquidPosition[]> {
    try {
      const userState = await this.getUserState();
      
      // Map to our interface
      const positions: HyperliquidPosition[] = userState.assetPositions
        .filter((p: any) => p.position && p.position.szi !== 0)
        .map((p: any) => {
          const position = p.position;
          const entryPrice = parseFloat(position.entryPx);
          const markPrice = parseFloat(position.markPx);
          const size = parseFloat(position.szi);
          const leverage = parseFloat(position.leverage || "1");
          const pnl = (markPrice - entryPrice) * size;
          const pnlPercent = (markPrice / entryPrice - 1) * 100 * (size > 0 ? 1 : -1);
          
          return {
            symbol: p.name,
            size,
            entryPrice,
            markPrice,
            pnl,
            pnlPercent,
            liquidationPrice: position.liquidationPx ? parseFloat(position.liquidationPx) : undefined,
            leverage
          };
        });
      
      return positions;
    } catch (error: any) {
      logger.error(`Failed to get positions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Place an order on Hyperliquid
   */
  public async placeOrder(params: HyperliquidOrderParams): Promise<any> {
    if (!this.signer) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      // Construct order based on order type
      let orderJson;
      if (params.orderType === 'market') {
        orderJson = {
          a: params.symbol,
          b: params.isBuy,
          s: params.size.toString(),
          p: "0", // Market orders use price 0
          r: "market"
        };
      } else if (params.orderType === 'postOnly') {
        orderJson = {
          a: params.symbol,
          b: params.isBuy,
          s: params.size.toString(),
          p: params.price.toString(),
          r: "postOnly"
        };
      } else {
        // Default to limit order
        const timeInForce = params.timeInForce || 'GTC';
        orderJson = {
          a: params.symbol,
          b: params.isBuy,
          s: params.size.toString(),
          p: params.price.toString(),
          r: {
            limit: {
              tif: timeInForce === 'GTC' ? 'Gtc' : timeInForce === 'IOC' ? 'Ioc' : 'Fok'
            }
          }
        };
      }
      
      // In a real implementation, we would sign the order with the wallet
      // For now, we'll simulate the API call
      const response = await axios.post(`${this.apiUrl}/exchange`, {
        action: {
          type: 'order',
          order: orderJson
        },
        signature: 'simulated_signature', // In real implementation, this would be signed with the wallet
        nonce: Date.now(),
        wallet: this.accountAddress
      });
      
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to place order: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(symbol: string, orderId: string): Promise<any> {
    if (!this.signer) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/exchange`, {
        action: {
          type: 'cancel',
          asset: symbol,
          oid: orderId
        },
        signature: 'simulated_signature', // In real implementation, this would be signed with the wallet
        nonce: Date.now(),
        wallet: this.accountAddress
      });
      
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to cancel order: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get open orders
   */
  public async getOpenOrders(): Promise<any> {
    if (!this.accountAddress) {
      throw new Error('Account address not set');
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/info`, {
        type: 'openOrders',
        user: this.accountAddress
      });
      
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to get open orders: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get market data for a symbol
   */
  public async getMarketData(symbol: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/info`, {
        type: 'metaAndAssetCtxs'
      });
      
      // Find the specific asset data
      const allAssets = response.data.assetCtxs;
      const assetData = allAssets.find((asset: any) => asset.name === symbol);
      
      if (!assetData) {
        throw new Error(`Asset ${symbol} not found`);
      }
      
      return assetData;
    } catch (error: any) {
      logger.error(`Failed to get market data: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const hyperliquidService = new HyperliquidService();

// Export as default
export default hyperliquidService;
