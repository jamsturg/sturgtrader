import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import hyperliquidService from '../../services/trading/hyperliquid/hyperliquidService';

export class HyperliquidController {
  /**
   * Get user positions
   */
  public async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const positions = await hyperliquidService.getPositions();
      res.status(200).json({ success: true, data: positions });
    } catch (error: any) {
      logger.error(`Error getting positions: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user's open orders
   */
  public async getOpenOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await hyperliquidService.getOpenOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error: any) {
      logger.error(`Error getting open orders: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Place an order
   */
  public async placeOrder(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, isBuy, size, price, orderType, timeInForce } = req.body;
      
      // Validate required parameters
      if (!symbol || isBuy === undefined || !size || (orderType !== 'market' && !price)) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters: symbol, isBuy, size, and price (for non-market orders)' 
        });
        return;
      }
      
      const order = await hyperliquidService.placeOrder({
        symbol,
        isBuy,
        size: parseFloat(size),
        price: parseFloat(price || 0),
        orderType: orderType || 'limit',
        timeInForce: timeInForce
      });
      
      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      logger.error(`Error placing order: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, orderId } = req.body;
      
      // Validate required parameters
      if (!symbol || !orderId) {
        res.status(400).json({ 
          success: false, 
          message: 'Missing required parameters: symbol, orderId' 
        });
        return;
      }
      
      const result = await hyperliquidService.cancelOrder(symbol, orderId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error(`Error canceling order: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get market data for a symbol
   */
  public async getMarketData(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        res.status(400).json({ success: false, message: 'Symbol is required' });
        return;
      }
      
      const marketData = await hyperliquidService.getMarketData(symbol);
      res.status(200).json({ success: true, data: marketData });
    } catch (error: any) {
      logger.error(`Error getting market data: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new HyperliquidController();
