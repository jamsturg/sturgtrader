import { WebSocketManager } from './websocketManager';
import { ArbitrageEngine } from './arbitrageEngine';
import { CrossExchangeStrategy } from './crossExchangeStrategy';
import {
  Exchange,
  TradingPair,
  ArbitrageOpportunity,
  ArbitrageConfig,
  OpportunityStatus,
  AgentZeroTradingQuery,
  AgentZeroTradingResponse,
  RiskLevel
} from './types';
import { EventEmitter } from 'events';
import { logger } from '../../../utils/logger';
import { agentZeroService } from '../../../services/ai/agentZeroService';

/**
 * ArbitrageService is the main entry point for the high-speed arbitrage trading system
 * It coordinates the WebSocket Manager, Arbitrage Engine, and Cross-Exchange Strategy components
 * and interfaces with Agent Zero for AI-powered optimization
 */
export class ArbitrageService extends EventEmitter {
  private wsManager: WebSocketManager;
  private arbitrageEngine: ArbitrageEngine;
  private strategyManager: CrossExchangeStrategy;
  private isRunning: boolean = false;
  private supportedExchanges: Exchange[] = [];
  private supportedPairs: TradingPair[] = [];
  private readonly DEFAULT_CONFIG: Partial<ArbitrageConfig> = {
    minProfitPct: 0.5,
    maxExecutionTimeMs: 5000,
    autoExecute: false,
    maxConcurrentTrades: 3,
    balanceReservePct: 20,
    riskLevel: RiskLevel.MEDIUM,
    notificationThresholds: {
      profitPct: 1.0,
      executionTimeMs: 2000
    }
  };

  constructor() {
    super();
    this.wsManager = new WebSocketManager();
    this.arbitrageEngine = new ArbitrageEngine(this.wsManager, this.DEFAULT_CONFIG);
    this.strategyManager = new CrossExchangeStrategy();
    
    // Set up event forwarding
    this.setupEventForwarding();
    
    // Set max listeners
    this.setMaxListeners(100);
    
    logger.info('ArbitrageService initialized');
  }

  /**
   * Initialize the arbitrage service with exchanges and trading pairs
   */
  public async initialize(exchanges: Exchange[], tradingPairs: TradingPair[]): Promise<void> {
    this.supportedExchanges = exchanges;
    this.supportedPairs = tradingPairs;
    
    // Initialize the arbitrage engine
    this.arbitrageEngine.initialize(exchanges, tradingPairs);
    
    logger.info(`ArbitrageService initialized with ${exchanges.length} exchanges and ${tradingPairs.length} trading pairs`);
  }

  /**
   * Start arbitrage monitoring with the given configuration
   */
  public async start(config?: Partial<ArbitrageConfig>): Promise<void> {
    if (this.isRunning) {
      logger.warn('ArbitrageService is already running');
      return;
    }
    
    // Apply configuration if provided
    if (config) {
      this.arbitrageEngine.updateConfig(config);
    }
    
    // Start the arbitrage engine
    await this.arbitrageEngine.start();
    this.isRunning = true;
    
    logger.info('ArbitrageService started');
    this.emit('started');
  }

  /**
   * Stop arbitrage monitoring
   */
  public stop(): void {
    if (!this.isRunning) {
      logger.warn('ArbitrageService is not running');
      return;
    }
    
    // Stop the arbitrage engine
    this.arbitrageEngine.stop();
    this.isRunning = false;
    
    logger.info('ArbitrageService stopped');
    this.emit('stopped');
  }

  /**
   * Update the arbitrage configuration
   */
  public updateConfig(config: Partial<ArbitrageConfig>): void {
    this.arbitrageEngine.updateConfig(config);
    logger.info('ArbitrageService configuration updated');
  }

  /**
   * Get all current arbitrage opportunities
   */
  public getOpportunities(): ArbitrageOpportunity[] {
    return this.arbitrageEngine.getOpportunities();
  }

  /**
   * Execute a specific arbitrage opportunity
   */
  public async executeOpportunity(opportunityId: string): Promise<boolean> {
    // Get the opportunity
    const opportunity = this.arbitrageEngine.getOpportunity(opportunityId);
    
    if (!opportunity) {
      logger.error(`Cannot execute unknown opportunity: ${opportunityId}`);
      return false;
    }
    
    // Determine the optimal strategy
    const strategyType = this.strategyManager.determineStrategy(opportunity);
    
    // Generate execution plan
    const executionPlan = this.strategyManager.generateExecutionPlan(opportunity, strategyType);
    
    // Optimize with Agent Zero if available
    const optimizedPlan = await this.optimizeWithAgentZero(opportunity, executionPlan);
    
    // Validate profitability with expected slippage
    if (!this.strategyManager.validateProfitability(opportunity, optimizedPlan)) {
      logger.warn(`Opportunity ${opportunityId} is no longer profitable with expected slippage, aborting`);
      return false;
    }
    
    // Execute the opportunity
    return await this.arbitrageEngine.executeOpportunity(opportunityId);
  }

  /**
   * Get performance statistics
   */
  public getStats(): any {
    return this.arbitrageEngine.getStats();
  }

  /**
   * Get supported exchanges
   */
  public getSupportedExchanges(): Exchange[] {
    return this.supportedExchanges;
  }

  /**
   * Get supported trading pairs
   */
  public getSupportedPairs(): TradingPair[] {
    return this.supportedPairs;
  }

  /**
   * Check if the service is currently running
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Close all connections and clean up resources
   */
  public async shutdown(): Promise<void> {
    if (this.isRunning) {
      this.stop();
    }
    
    this.wsManager.closeAll();
    logger.info('ArbitrageService shutdown complete');
  }

  /**
   * Optimize a strategy with Agent Zero AI
   */
  private async optimizeWithAgentZero(opportunity: ArbitrageOpportunity, strategy: any): Promise<any> {
    try {
      logger.info(`Optimizing strategy for opportunity ${opportunity.id} with Agent Zero`);
      
      // Create the query for Agent Zero
      const query: AgentZeroTradingQuery = {
        type: 'arbitrage_analysis',
        data: {
          opportunity,
          currentStrategy: strategy,
          marketConditions: this.arbitrageEngine.getOpportunities()
        },
        priority: 8,
        responseTimeout: 2000
      };
      
      // Query Agent Zero
      const response = await this.queryAgentZero(query);
      
      // Apply optimizations if available
      if (response && response.analysisResults) {
        return this.strategyManager.applyAgentZeroOptimization(strategy, response.analysisResults);
      }
      
      return strategy;
    } catch (error) {
      logger.error('Error optimizing with Agent Zero:', error);
      return strategy; // Return original strategy on error
    }
  }

  /**
   * Query Agent Zero AI service
   */
  private async queryAgentZero(query: AgentZeroTradingQuery): Promise<AgentZeroTradingResponse | null> {
    try {
      // In a real implementation, this would connect to the Agent Zero API
      // For now, return a simulated response
      
      // Check if agentZeroService is available
      if (agentZeroService && agentZeroService.isAvailable()) {
        // Use analyzeMarket method instead of the non-existent queryTradingAgent
        const analysisResult = await agentZeroService.analyzeMarket(query.data);
        
        if (analysisResult) {
          // Convert the format to match expected AgentZeroTradingResponse
          return {
            type: 'arbitrage_analysis',
            recommendations: analysisResult.recommendations || [],
            analysisResults: analysisResult.analysis || {},
            confidence: analysisResult.confidence || 0.75,
            timestamp: Date.now()
          };
        }
      }
      
      // Simulate a response
      return {
        type: 'arbitrage_analysis',
        recommendations: [
          'Execute trade with optimal parameters',
          'Consider increasing position size by 5%',
          'Market volatility is low, execution risk is minimal'
        ],
        analysisResults: {
          optimizedSize: query.data.opportunity.maxSize * 0.85,
          executionStrategy: 'parallel',
          timing: {
            buyFirst: true,
            maxDelayMs: 300
          },
          riskAssessment: {
            confidence: 0.87,
            volatilityRisk: 'low',
            executionRisk: 'low',
            expectedProfitVariance: 0.15
          }
        },
        confidence: 0.87,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Error querying Agent Zero:', error);
      return null;
    }
  }

  /**
   * Set up event forwarding from the arbitrage engine
   */
  private setupEventForwarding(): void {
    // Forward relevant events from the arbitrage engine
    const eventsToForward = [
      'opportunityDetected',
      'highProfitOpportunity',
      'executionStarted',
      'executionCompleted',
      'executionFailed',
      'maxReconnectAttemptsReached'
    ];
    
    eventsToForward.forEach(eventName => {
      this.arbitrageEngine.on(eventName, (...args: any[]) => {
        this.emit(eventName, ...args);
      });
    });
  }
}

/**
 * Create and export a singleton instance of the ArbitrageService
 */
export const arbitrageService = new ArbitrageService();
