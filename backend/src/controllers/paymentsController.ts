import { Request, Response } from 'express';
import bitcoinService from '../services/payments/bitcoin/bitcoinService';
import hyperfluidService from '../services/payments/hyperfluidService';
import { logger } from '../server';

/**
 * Controller for payment functionality
 */
export const paymentsController = {
  /**
   * Generate a Bitcoin address for a user
   */
  generateBitcoinAddress: async (req: Request, res: Response) => {
    try {
      const { userId, label } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required'
        });
      }
      
      const address = await bitcoinService.generateAddress(userId, label);
      
      return res.status(200).json(address);
    } catch (error: any) {
      logger.error(`Error generating Bitcoin address: ${error.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },
  
  /**
   * Create a Bitcoin payment
   */
  createBitcoinPayment: async (req: Request, res: Response) => {
    try {
      const { userId, amount, currency, description, metadata } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'User ID and amount are required'
        });
      }
      
      const payment = await bitcoinService.createPayment({
        userId,
        amount: parseFloat(amount),
        currency,
        description,
        metadata
      });
      
      return res.status(200).json(payment);
    } catch (error: any) {
      logger.error(`Error creating Bitcoin payment: ${error.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },
  
  /**
   * Check a Bitcoin payment status
   */
  checkBitcoinPaymentStatus: async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Payment ID is required'
        });
      }
      
      const payment = await bitcoinService.checkPaymentStatus(paymentId);
      
      return res.status(200).json(payment);
    } catch (error: any) {
      logger.error(`Error checking Bitcoin payment status: ${error.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  },
  
  /**
   * Create a recurring payment using Hyperfluid
   */
  createRecurringPayment: async (req: Request, res: Response) => {
    try {
      const { userId, planId, amount, tokenSymbol, paymentDetails } = req.body;
      
      if (!userId || !planId || !amount || !tokenSymbol) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'User ID, plan ID, amount, and token symbol are required'
        });
      }
      
      // In a real implementation, you'd get a provider from the user's wallet
      // For demo purposes, we'll use a mock response
      
      // Mock response since we can't actually execute transactions without a wallet
      const mockTxHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      return res.status(200).json({
        txHash: mockTxHash,
        userId,
        planId,
        amount: parseFloat(amount),
        tokenSymbol,
        status: 'active',
        startDate: new Date(),
        paymentDetails
      });
    } catch (error: any) {
      logger.error(`Error creating recurring payment: ${error.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
};
