import { Request, Response } from 'express';
import { ethers } from 'ethers';
import hyperfluidService from '../../services/payments/hyperfluidService';
import { logger } from '../../utils/logger';

/**
 * HyperfluidController handles requests related to Hyperfluid streaming payments
 * Exposes RESTful endpoints for the frontend to interact with Hyperfluid SDK
 */
export class HyperfluidController {
  private hyperfluidService = hyperfluidService;
  private provider: ethers.providers.Web3Provider | null = null;

  constructor() {
    // Logger is already initialized as a singleton
    logger.info('HyperfluidController initialized');
  }

  /**
   * Initialize the Hyperfluid service with network provider
   */
  async initialize(req: Request, res: Response): Promise<void> {
    try {
      const { network } = req.body;
      
      // In production, we'd use the actual provider from Web3.js or ethers.js
      // This initialization would typically involve connection to MetaMask or another wallet
      // For this implementation, we're assuming a provider is available and connected
      if (!this.provider) {
        // In a real implementation, we'd get the provider from a frontend wallet connection
        // For now, we'll just log that we need a proper provider in production
        logger.info('Using configured provider for Hyperfluid - in production this would be from a real wallet connection');
      }
      
      // For our implementation we'll use a configured provider from environment
      const providerUrl = process.env.ETHEREUM_RPC_URL || '';
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      
      const success = await this.hyperfluidService.initialize(provider as any);
      
      if (success) {
        res.json({ success: true, initialized: true, network });
      } else {
        res.status(500).json({ success: false, error: 'Failed to initialize Hyperfluid service' });
      }
    } catch (error) {
      logger.error('Failed to initialize Hyperfluid service', error);
      res.status(500).json({ success: false, error: 'Failed to initialize Hyperfluid service' });
    }
  }

  /**
   * Check if the Hyperfluid service is initialized
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const initialized = this.hyperfluidService.isReady();
      res.json({ initialized });
    } catch (error) {
      logger.error('Failed to get Hyperfluid status', error);
      res.status(500).json({ error: 'Failed to get Hyperfluid status' });
    }
  }

  /**
   * Create a new flow (streaming payment)
   */
  async createFlow(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress, sender, receiver, flowRate } = req.body;
      
      if (!tokenAddress || !sender || !receiver || !flowRate) {
        res.status(400).json({ error: 'Token address, sender, receiver, and flow rate are required' });
        return;
      }

      if (!this.hyperfluidService.isReady()) {
        res.status(400).json({ error: 'Hyperfluid service not initialized' });
        return;
      }

      const transactionHash = await this.hyperfluidService.createFlow(tokenAddress, sender, receiver, flowRate);
      res.json({ success: true, transactionHash });
    } catch (error) {
      logger.error('Failed to create flow', error);
      res.status(500).json({ error: 'Failed to create flow' });
    }
  }

  /**
   * Update an existing flow
   */
  async updateFlow(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress, sender, receiver, flowRate } = req.body;
      
      if (!tokenAddress || !sender || !receiver || !flowRate) {
        res.status(400).json({ error: 'Token address, sender, receiver, and flow rate are required' });
        return;
      }

      if (!this.hyperfluidService.isReady()) {
        res.status(400).json({ error: 'Hyperfluid service not initialized' });
        return;
      }

      const transactionHash = await this.hyperfluidService.updateFlow(tokenAddress, sender, receiver, flowRate);
      res.json({ success: true, transactionHash });
    } catch (error) {
      logger.error('Failed to update flow', error);
      res.status(500).json({ error: 'Failed to update flow' });
    }
  }

  /**
   * Delete an existing flow
   */
  async deleteFlow(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress, sender, receiver } = req.body;
      
      if (!tokenAddress || !sender || !receiver) {
        res.status(400).json({ error: 'Token address, sender, and receiver are required' });
        return;
      }

      if (!this.hyperfluidService.isReady()) {
        res.status(400).json({ error: 'Hyperfluid service not initialized' });
        return;
      }

      const transactionHash = await this.hyperfluidService.deleteFlow(tokenAddress, sender, receiver);
      res.json({ success: true, transactionHash });
    } catch (error) {
      logger.error('Failed to delete flow', error);
      res.status(500).json({ error: 'Failed to delete flow' });
    }
  }

  /**
   * Get flow information
   */
  async getFlow(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress, sender, receiver } = req.query;
      
      if (!tokenAddress || !sender || !receiver) {
        res.status(400).json({ error: 'Token address, sender, and receiver are required' });
        return;
      }

      if (!this.hyperfluidService.isReady()) {
        res.status(400).json({ error: 'Hyperfluid service not initialized' });
        return;
      }

      const flow = await this.hyperfluidService.getFlow(
        tokenAddress as string,
        sender as string,
        receiver as string
      );
      res.json(flow);
    } catch (error) {
      logger.error('Failed to get flow information', error);
      res.status(500).json({ error: 'Failed to get flow information' });
    }
  }

  /**
   * Get account flow information
   */
  async getAccountFlowInfo(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress } = req.query;
      const { account } = req.params;
      
      if (!tokenAddress || !account) {
        res.status(400).json({ error: 'Token address and account are required' });
        return;
      }

      if (!this.hyperfluidService.isReady()) {
        res.status(400).json({ error: 'Hyperfluid service not initialized' });
        return;
      }

      const flowInfo = await this.hyperfluidService.getAccountFlowInfo(
        tokenAddress as string,
        account
      );
      res.json(flowInfo);
    } catch (error) {
      logger.error('Failed to get account flow information', error);
      res.status(500).json({ error: 'Failed to get account flow information' });
    }
  }
}
