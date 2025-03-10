import { Request, Response } from 'express';
import { FreqtradeService } from '../../services/trading/FreqtradeService';
import { Logger } from '../../utils/logger';

/**
 * FreqtradeController handles requests related to Freqtrade trading operations
 * Exposes RESTful endpoints that the frontend can use to interact with Freqtrade
 */
export class FreqtradeController {
  private freqtradeService: FreqtradeService;
  private logger = new Logger('FreqtradeController');

  constructor() {
    this.freqtradeService = new FreqtradeService();
    this.initialize();
  }

  /**
   * Initialize the Freqtrade service
   */
  private async initialize(): Promise<void> {
    try {
      await this.freqtradeService.connect();
      this.logger.info('Freqtrade service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Freqtrade service', error);
    }
  }

  /**
   * Get Freqtrade system status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.freqtradeService.getStatus();
      res.json(status);
    } catch (error) {
      this.logger.error('Failed to get Freqtrade status', error);
      res.status(500).json({ error: 'Failed to get Freqtrade status' });
    }
  }

  /**
   * Get all available markets
   */
  async getMarkets(req: Request, res: Response): Promise<void> {
    try {
      const markets = await this.freqtradeService.getMarkets();
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

      const candles = await this.freqtradeService.getCandles(
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

      const ticker = await this.freqtradeService.getTicker(market as string);
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

      const orderBook = await this.freqtradeService.getOrderBook(
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
      const balances = await this.freqtradeService.getBalances();
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
      const positions = await this.freqtradeService.getPositions();
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
      const orders = await this.freqtradeService.getOpenOrders();
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
      const orders = await this.freqtradeService.getClosedOrders(
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
      const trades = await this.freqtradeService.getTrades(
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

      const order = await this.freqtradeService.createOrder(
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

      const result = await this.freqtradeService.cancelOrder(orderId);
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
      const result = await this.freqtradeService.cancelAllOrders(market as string);
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
      const strategies = await this.freqtradeService.getStrategies();
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

      const result = await this.freqtradeService.startStrategy(strategyName, config);
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

      const result = await this.freqtradeService.stopStrategy(strategyName);
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

      const result = await this.freqtradeService.modifyStrategy(strategyName, config);
      res.json({ success: result });
    } catch (error) {
      this.logger.error('Failed to update strategy', error);
      res.status(500).json({ error: 'Failed to update strategy' });
    }
  }
}
