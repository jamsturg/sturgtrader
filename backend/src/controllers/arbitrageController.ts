import { Request, Response } from 'express';
import { arbitrageService } from '../services/trading/arbitrage/arbitrageService';
import { logger } from '../utils/logger';
import { ArbitrageConfig, ArbitrageOpportunity } from '../services/trading/arbitrage/types';

/**
 * Controller for the high-speed arbitrage trading system
 * Exposes REST endpoints for the frontend to interact with the arbitrage service
 */
export class ArbitrageController {
  /**
   * Initialize the arbitrage system with the specified exchanges and pairs
   */
  public async initialize(req: Request, res: Response): Promise<void> {
    try {
      const { exchanges, tradingPairs } = req.body;
      
      if (!exchanges || !Array.isArray(exchanges) || !tradingPairs || !Array.isArray(tradingPairs)) {
        res.status(400).json({ error: 'Invalid request format. Exchanges and tradingPairs arrays are required.' });
        return;
      }
      
      await arbitrageService.initialize(exchanges, tradingPairs);
      
      res.status(200).json({
        message: 'Arbitrage system initialized successfully',
        exchanges: exchanges.length,
        tradingPairs: tradingPairs.length
      });
    } catch (error: any) {
      logger.error('Error initializing arbitrage system:', error);
      res.status(500).json({ error: 'Failed to initialize arbitrage system', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Start the arbitrage monitoring with optional configuration
   */
  public async start(req: Request, res: Response): Promise<void> {
    try {
      const config: Partial<ArbitrageConfig> = req.body.config || {};
      
      await arbitrageService.start(config);
      
      res.status(200).json({
        message: 'Arbitrage monitoring started',
        config
      });
    } catch (error: any) {
      logger.error('Error starting arbitrage monitoring:', error);
      res.status(500).json({ error: 'Failed to start arbitrage monitoring', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Stop the arbitrage monitoring
   */
  public stop(req: Request, res: Response): void {
    try {
      arbitrageService.stop();
      
      res.status(200).json({
        message: 'Arbitrage monitoring stopped'
      });
    } catch (error: any) {
      logger.error('Error stopping arbitrage monitoring:', error);
      res.status(500).json({ error: 'Failed to stop arbitrage monitoring', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Update the arbitrage configuration
   */
  public updateConfig(req: Request, res: Response): void {
    try {
      const config: Partial<ArbitrageConfig> = req.body.config;
      
      if (!config) {
        res.status(400).json({ error: 'Configuration object is required' });
        return;
      }
      
      arbitrageService.updateConfig(config);
      
      res.status(200).json({
        message: 'Arbitrage configuration updated',
        config
      });
    } catch (error: any) {
      logger.error('Error updating arbitrage configuration:', error);
      res.status(500).json({ error: 'Failed to update configuration', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Get all detected arbitrage opportunities
   */
  public getOpportunities(req: Request, res: Response): void {
    try {
      const opportunities = arbitrageService.getOpportunities();
      
      res.status(200).json({
        count: opportunities.length,
        opportunities
      });
    } catch (error: any) {
      logger.error('Error getting arbitrage opportunities:', error);
      res.status(500).json({ error: 'Failed to get arbitrage opportunities', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Execute a specific arbitrage opportunity
   */
  public async executeOpportunity(req: Request, res: Response): Promise<void> {
    try {
      const { opportunityId } = req.params;
      
      if (!opportunityId) {
        res.status(400).json({ error: 'Opportunity ID is required' });
        return;
      }
      
      const success = await arbitrageService.executeOpportunity(opportunityId);
      
      if (success) {
        res.status(200).json({
          message: 'Arbitrage opportunity executed successfully',
          opportunityId
        });
      } else {
        res.status(400).json({
          error: 'Failed to execute arbitrage opportunity',
          opportunityId
        });
      }
    } catch (error: any) {
      logger.error(`Error executing arbitrage opportunity ${req.params.opportunityId}:`, error);
      res.status(500).json({ error: 'Failed to execute arbitrage opportunity', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Get arbitrage system statistics
   */
  public getStats(req: Request, res: Response): void {
    try {
      const stats = arbitrageService.getStats();
      
      res.status(200).json(stats);
    } catch (error: any) {
      logger.error('Error getting arbitrage statistics:', error);
      res.status(500).json({ error: 'Failed to get arbitrage statistics', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Get supported exchanges
   */
  public getSupportedExchanges(req: Request, res: Response): void {
    try {
      const exchanges = arbitrageService.getSupportedExchanges();
      
      res.status(200).json({
        count: exchanges.length,
        exchanges
      });
    } catch (error: any) {
      logger.error('Error getting supported exchanges:', error);
      res.status(500).json({ error: 'Failed to get supported exchanges', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Get supported trading pairs
   */
  public getSupportedPairs(req: Request, res: Response): void {
    try {
      const pairs = arbitrageService.getSupportedPairs();
      
      res.status(200).json({
        count: pairs.length,
        pairs
      });
    } catch (error: any) {
      logger.error('Error getting supported trading pairs:', error);
      res.status(500).json({ error: 'Failed to get supported trading pairs', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Get arbitrage system status
   */
  public getStatus(req: Request, res: Response): void {
    try {
      const isActive = arbitrageService.isActive();
      
      res.status(200).json({
        active: isActive,
        status: isActive ? 'running' : 'stopped'
      });
    } catch (error: any) {
      logger.error('Error getting arbitrage system status:', error);
      res.status(500).json({ error: 'Failed to get arbitrage system status', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * Shut down the arbitrage system
   */
  public shutdown(req: Request, res: Response): void {
    try {
      arbitrageService.shutdown();
      
      res.status(200).json({
        message: 'Arbitrage system shut down successfully'
      });
    } catch (error: any) {
      logger.error('Error shutting down arbitrage system:', error);
      res.status(500).json({ error: 'Failed to shut down arbitrage system', details: error?.message || 'Unknown error' });
    }
  }

  /**
   * WebSocket endpoint handler - for real-time arbitrage updates
   * This would be implemented in a separate WebSocket controller, but here's the outline
   */
  public setupWebSocketEvents(socket: any): void {
    // Subscribe to real-time opportunity updates
    socket.on('subscribe:opportunities', () => {
      const onOpportunityDetected = (opportunity: ArbitrageOpportunity) => {
        socket.emit('opportunity:detected', opportunity);
      };
      
      const onHighProfitOpportunity = (opportunity: ArbitrageOpportunity) => {
        socket.emit('opportunity:highProfit', opportunity);
      };
      
      arbitrageService.on('opportunityDetected', onOpportunityDetected);
      arbitrageService.on('highProfitOpportunity', onHighProfitOpportunity);
      
      // Clean up when client disconnects
      socket.on('disconnect', () => {
        arbitrageService.removeListener('opportunityDetected', onOpportunityDetected);
        arbitrageService.removeListener('highProfitOpportunity', onHighProfitOpportunity);
      });
    });
    
    // Subscribe to execution updates
    socket.on('subscribe:executions', () => {
      const onExecutionStarted = (opportunity: ArbitrageOpportunity) => {
        socket.emit('execution:started', opportunity);
      };
      
      const onExecutionCompleted = (opportunity: ArbitrageOpportunity) => {
        socket.emit('execution:completed', opportunity);
      };
      
      const onExecutionFailed = (opportunity: ArbitrageOpportunity, error: any) => {
        socket.emit('execution:failed', { opportunity, error });
      };
      
      arbitrageService.on('executionStarted', onExecutionStarted);
      arbitrageService.on('executionCompleted', onExecutionCompleted);
      arbitrageService.on('executionFailed', onExecutionFailed);
      
      // Clean up when client disconnects
      socket.on('disconnect', () => {
        arbitrageService.removeListener('executionStarted', onExecutionStarted);
        arbitrageService.removeListener('executionCompleted', onExecutionCompleted);
        arbitrageService.removeListener('executionFailed', onExecutionFailed);
      });
    });
  }
}

// Create and export controller instance
export const arbitrageController = new ArbitrageController();
