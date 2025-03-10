import { Request, Response } from 'express';
import { HummingbotService } from '../../services/trading/HummingbotService';
import { Logger } from '../../utils/logger';

/**
 * HummingbotController handles requests related to Hummingbot trading operations
 * Exposes RESTful endpoints that the frontend can use to interact with Hummingbot
 */
export class HummingbotController {
  private hummingbotService: HummingbotService;
  private logger = new Logger('HummingbotController');

  constructor() {
    this.hummingbotService = new HummingbotService();
    this.initialize();
  }

  /**
   * Initialize the Hummingbot service
   */
  private async initialize(): Promise<void> {
    try {
      await this.hummingbotService.connect();
      this.logger.info('Hummingbot service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Hummingbot service', error);
    }
  }

  /**
   * Get Hummingbot system status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.hummingbotService.getStatus();
      res.json(status);
    } catch (error) {
      this.logger.error('Failed to get Hummingbot status', error);
      res.status(500).json({ error: 'Failed to get Hummingbot status' });
    }
  }

  /**
   * Get all available markets
   */
  async getMarkets(req: Request, res: Response): Promise<void> {
    try {
      const markets = await this.hummingbotService.getMarkets();
      res.json(markets);
    } catch (error) {
      this.logger.error('Failed to get markets', error);
      res.status(500).json({ error: 'Failed to get markets' });
    }
  }

  /**
   * Get candle data for a market
   */
  async getCandles(req: Request, res: Response): Promise<void> {
    try {
      const { market, timeframe, limit } = req.query;
      if (!market || !timeframe) {
        res.status(400).json({ error: 'Market and timeframe are required' });
        return;
      }

      const candles = await this.hummingbotService.getCandles(
        market as string,
        timeframe as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(candles);
    } catch (error) {
      this.logger.error('Failed to get candles', error);
      res.status(500).json({ error: 'Failed to get candles' });
    }
  }

  /**
   * Get current ticker for a market
   */
  async getTicker(req: Request, res: Response): Promise<void> {
    try {
      const { market } = req.query;
      if (!market) {
        res.status(400).json({ error: 'Market is required' });
        return;
      }

      const ticker = await this.hummingbotService.getTicker(market as string);
      res.json(ticker);
    } catch (error) {
      this.logger.error('Failed to get ticker', error);
      res.status(500).json({ error: 'Failed to get ticker' });
    }
  }

  /**
   * Get order book for a market
   */
  async getOrderBook(req: Request, res: Response): Promise<void> {
    try {
      const { market, depth } = req.query;
      if (!market) {
        res.status(400).json({ error: 'Market is required' });
        return;
      }

      const orderBook = await this.hummingbotService.getOrderBook(
        market as string,
        depth ? parseInt(depth as string) : undefined
      );
      res.json(orderBook);
    } catch (error) {
      this.logger.error('Failed to get order book', error);
      res.status(500).json({ error: 'Failed to get order book' });
    }
  }

  /**
   * Get account balances
   */
  async getBalances(req: Request, res: Response): Promise<void> {
    try {
      const balances = await this.hummingbotService.getBalances();
      res.json(balances);
    } catch (error) {
      this.logger.error('Failed to get balances', error);
      res.status(500).json({ error: 'Failed to get balances' });
    }
  }

  /**
   * Get open positions
   */
  async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const positions = await this.hummingbotService.getPositions();
      res.json(positions);
    } catch (error) {
      this.logger.error('Failed to get positions', error);
      res.status(500).json({ error: 'Failed to get positions' });
    }
  }

  /**
   * Get open orders
   */
  async getOpenOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.hummingbotService.getOpenOrders();
      res.json(orders);
    } catch (error) {
      this.logger.error('Failed to get open orders', error);
      res.status(500).json({ error: 'Failed to get open orders' });
    }
  }

  /**
   * Get closed orders
   */
  async getClosedOrders(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const orders = await this.hummingbotService.getClosedOrders(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(orders);
    } catch (error) {
      this.logger.error('Failed to get closed orders', error);
      res.status(500).json({ error: 'Failed to get closed orders' });
    }
  }

  /**
   * Get trade history
   */
  async getTrades(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const trades = await this.hummingbotService.getTrades(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(trades);
    } catch (error) {
      this.logger.error('Failed to get trades', error);
      res.status(500).json({ error: 'Failed to get trades' });
    }
  }

  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { market, type, side, amount, price } = req.body;
      
      if (!market || !type || !side || !amount) {
        res.status(400).json({ error: 'Market, type, side, and amount are required' });
        return;
      }

      const order = await this.hummingbotService.createOrder(
        market,
        type,
        side,
        parseFloat(amount),
        price ? parseFloat(price) : undefined
      );
      res.json(order);
    } catch (error) {
      this.logger.error('Failed to create order', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const result = await this.hummingbotService.cancelOrder(orderId);
      res.json({ success: result });
    } catch (error) {
      this.logger.error('Failed to cancel order', error);
      res.status(500).json({ error: 'Failed to cancel order' });
    }
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const { market } = req.query;
      const result = await this.hummingbotService.cancelAllOrders(market as string);
      res.json({ success: result });
    } catch (error) {
      this.logger.error('Failed to cancel all orders', error);
      res.status(500).json({ error: 'Failed to cancel all orders' });
    }
  }

  /**
   * Get all available strategies
   */
  async getStrategies(req: Request, res: Response): Promise<void> {
    try {
      const strategies = await this.hummingbotService.getStrategies();
      res.json(strategies);
    } catch (error) {
      this.logger.error('Failed to get strategies', error);
      res.status(500).json({ error: 'Failed to get strategies' });
    }
  }

  /**
   * Start a strategy
   */
  async startStrategy(req: Request, res: Response): Promise<void> {
    try {
      const { strategyName } = req.params;
      const config = req.body;
      
      if (!strategyName) {
        res.status(400).json({ error: 'Strategy name is required' });
        return;
      }

      const result = await this.hummingbotService.startStrategy(strategyName, config);
      res.json({ success: result });
    } catch (error) {
      this.logger.error('Failed to start strategy', error);
      res.status(500).json({ error: 'Failed to start strategy' });
    }
  }

  /**
   * Stop a strategy
   */
  async stopStrategy(req: Request, res: Response): Promise<void> {
    try {
      const { strategyName } = req.params;
      
      if (!strategyName) {
        res.status(400).json({ error: 'Strategy name is required' });
        return;
      }

      const result = await this.hummingbotService.stopStrategy(strategyName);
      res.json({ success: result });
    } catch (error) {
      this.logger.error('Failed to stop strategy', error);
      res.status(500).json({ error: 'Failed to stop strategy' });
    }
  }

  /**
   * Update a strategy configuration
   */
  async updateStrategy(req: Request, res: Response): Promise<void> {
    try {
      const { strategyName } = req.params;
      const config = req.body;
      
      if (!strategyName) {
        res.status(400).json({ error: 'Strategy name is required' });
        return;
      }

      const result = await this.hummingbotService.modifyStrategy(strategyName, config);
      res.json({ success: result });
    } catch (error) {
      this.logger.error('Failed to update strategy', error);
      res.status(500).json({ error: 'Failed to update strategy' });
    }
  }
}
