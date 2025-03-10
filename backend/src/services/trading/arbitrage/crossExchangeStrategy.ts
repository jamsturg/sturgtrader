
import { 
  ArbitrageOpportunity,
  Exchange,
  TradingPair,
  ExecutionDetails,
  ExecutionStatus
} from './types';
import { logger } from '../../../utils/logger';

/**
 * Defines strategies for executing cross-exchange arbitrage trades
 * Provides specialized strategy implementations for different market conditions
 */
export class CrossExchangeStrategy {
  private readonly DEFAULT_SLIPPAGE_TOLERANCE = 0.005; // 0.5%
  private readonly DEFAULT_EXECUTION_TIMEOUT = 10000; // 10 seconds
  
  /**
   * Determine the optimal strategy for a given arbitrage opportunity
   */
  public determineStrategy(opportunity: ArbitrageOpportunity): string {
    // Simple decision tree based on opportunity characteristics
    if (opportunity.potentialProfitPct > 3.0) {
      return 'aggressive'; // High profit - aggressive execution
    } else if (opportunity.estimatedExecutionTimeMs < 1000) {
      return 'speed'; // Fast execution window - prioritize speed
    } else if (opportunity.confidence > 0.8) {
      return 'balanced'; // High confidence - balanced approach
    } else {
      return 'conservative'; // Default conservative approach
    }
  }
  
  /**
   * Calculate optimal execution size based on opportunity and risk parameters
   */
  public calculateOptimalSize(opportunity: ArbitrageOpportunity, riskFactor: number = 0.8): number {
    // Start with the maximum size from order book analysis
    let optimalSize = opportunity.maxSize;
    
    // Apply risk factor (0.0-1.0)
    optimalSize *= riskFactor;
    
    // Apply confidence-based adjustment
    optimalSize *= opportunity.confidence;
    
    // Apply profit-based scaling (higher profit -> larger position)
    const profitScale = Math.min(1.0, 0.5 + (opportunity.potentialProfitPct / 10));
    optimalSize *= profitScale;
    
    // Round to appropriate precision based on the trading pair
    // In a real implementation, this would use pair-specific quantity precision
    return Math.floor(optimalSize * 1000) / 1000;
  }
  
  /**
   * Generate execution plan for a specific strategy type
   */
  public generateExecutionPlan(opportunity: ArbitrageOpportunity, strategyType: string): any {
    switch (strategyType) {
      case 'aggressive':
        return this.generateAggressiveStrategy(opportunity);
      case 'speed':
        return this.generateSpeedStrategy(opportunity);
      case 'balanced':
        return this.generateBalancedStrategy(opportunity);
      case 'conservative':
        return this.generateConservativeStrategy(opportunity);
      default:
        return this.generateConservativeStrategy(opportunity);
    }
  }
  
  /**
   * Aggressive strategy - maximize profit capture with higher risk
   * Suitable for large profit opportunities where execution risk is acceptable
   */
  private generateAggressiveStrategy(opportunity: ArbitrageOpportunity): any {
    return {
      name: 'aggressive',
      executionSize: this.calculateOptimalSize(opportunity, 0.95), // Use 95% of max size
      executionApproach: 'parallel', // Execute both sides simultaneously
      priceTolerances: {
        buySlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE * 2, // 1.0% slippage tolerance
        sellSlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE * 2,
      },
      timing: {
        executionTimeout: this.DEFAULT_EXECUTION_TIMEOUT,
        retryDelayMs: 100, // Fast retry on failure
        maxRetries: 3
      },
      riskAssessment: {
        abortThreshold: 0.5, // Abort if expected profit drops by 50%
        adaptiveExecution: true // Adjust in real-time based on market conditions
      }
    };
  }
  
  /**
   * Speed strategy - prioritize execution speed over size
   * Suitable for opportunities with short execution windows
   */
  private generateSpeedStrategy(opportunity: ArbitrageOpportunity): any {
    return {
      name: 'speed',
      executionSize: this.calculateOptimalSize(opportunity, 0.6), // Use 60% of max size for speed
      executionApproach: 'parallel', // Execute both sides simultaneously
      priceTolerances: {
        buySlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE * 1.5, // 0.75% slippage tolerance
        sellSlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE * 1.5,
      },
      timing: {
        executionTimeout: this.DEFAULT_EXECUTION_TIMEOUT / 2, // Shorter timeout
        retryDelayMs: 50, // Very fast retry
        maxRetries: 1 // Minimal retries - speed is priority
      },
      riskAssessment: {
        abortThreshold: 0.7, // Abort if expected profit drops by 30%
        adaptiveExecution: true
      }
    };
  }
  
  /**
   * Balanced strategy - good balance between risk and profit capture
   * Suitable for most opportunities with good confidence
   */
  private generateBalancedStrategy(opportunity: ArbitrageOpportunity): any {
    return {
      name: 'balanced',
      executionSize: this.calculateOptimalSize(opportunity, 0.8), // Use 80% of max size
      executionApproach: 'sequential', // Buy first, then sell
      sequenceOrder: 'buy-first', // Buy first, then sell
      priceTolerances: {
        buySlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE, // 0.5% slippage tolerance
        sellSlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE,
      },
      timing: {
        executionTimeout: this.DEFAULT_EXECUTION_TIMEOUT,
        retryDelayMs: 200,
        maxRetries: 2
      },
      riskAssessment: {
        abortThreshold: 0.6, // Abort if expected profit drops by 40%
        adaptiveExecution: true
      }
    };
  }
  
  /**
   * Conservative strategy - prioritize risk management over profit capture
   * Suitable for opportunities with lower confidence or during volatile markets
   */
  private generateConservativeStrategy(opportunity: ArbitrageOpportunity): any {
    return {
      name: 'conservative',
      executionSize: this.calculateOptimalSize(opportunity, 0.5), // Use 50% of max size for safety
      executionApproach: 'sequential',
      sequenceOrder: 'buy-first', // Buy first, then sell
      priceTolerances: {
        buySlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE * 0.6, // 0.3% slippage tolerance
        sellSlippageTolerance: this.DEFAULT_SLIPPAGE_TOLERANCE * 0.6,
      },
      timing: {
        executionTimeout: this.DEFAULT_EXECUTION_TIMEOUT * 1.5, // Longer timeout for safety
        retryDelayMs: 500, // Slower retry
        maxRetries: 3
      },
      riskAssessment: {
        abortThreshold: 0.8, // Abort if expected profit drops by 20%
        adaptiveExecution: false // Fixed execution parameters
      }
    };
  }
  
  /**
   * Calculate the expected execution prices accounting for slippage
   */
  public calculateExpectedExecutionPrices(opportunity: ArbitrageOpportunity, strategy: any): { buyPrice: number, sellPrice: number } {
    const buySlippage = 1 + strategy.priceTolerances.buySlippageTolerance;
    const sellSlippage = 1 - strategy.priceTolerances.sellSlippageTolerance;
    
    return {
      buyPrice: opportunity.buyPrice * buySlippage,
      sellPrice: opportunity.sellPrice * sellSlippage
    };
  }
  
  /**
   * Validate that the opportunity is still profitable with the given strategy and expected slippage
   */
  public validateProfitability(opportunity: ArbitrageOpportunity, strategy: any): boolean {
    const { buyPrice, sellPrice } = this.calculateExpectedExecutionPrices(opportunity, strategy);
    const executionSize = strategy.executionSize;
    
    // Get trading fees from opportunity exchanges (in a real implementation)
    const buyFeeRate = 0.001; // Example 0.1% fee
    const sellFeeRate = 0.001; // Example 0.1% fee
    
    // Calculate expected costs and revenue
    const buyCost = buyPrice * executionSize * (1 + buyFeeRate);
    const sellRevenue = sellPrice * executionSize * (1 - sellFeeRate);
    
    // Calculate expected profit
    const expectedProfit = sellRevenue - buyCost;
    const expectedProfitPct = (expectedProfit / buyCost) * 100;
    
    // Validate profitability against minimum thresholds
    return expectedProfitPct > 0;
  }
  
  /**
   * Decide whether to abort an ongoing execution based on changing market conditions
   */
  public shouldAbortExecution(opportunity: ArbitrageOpportunity, strategy: any, currentMarketData: any): boolean {
    // Calculate the original expected profit
    const originalProfitPct = opportunity.potentialProfitPct;
    
    // Extract current prices from market data
    const currentBuyPrice = currentMarketData.buyExchange.ask;
    const currentSellPrice = currentMarketData.sellExchange.bid;
    
    // Calculate current spread and profit percentage
    const currentSpreadPct = ((currentSellPrice - currentBuyPrice) / currentBuyPrice) * 100;
    const buyFeeRate = 0.001; // Example 0.1% fee
    const sellFeeRate = 0.001; // Example 0.1% fee
    
    // Calculate current profit after fees
    const buyCost = currentBuyPrice * (1 + buyFeeRate);
    const sellRevenue = currentSellPrice * (1 - sellFeeRate);
    const currentProfitPct = ((sellRevenue - buyCost) / buyCost) * 100;
    
    // Calculate profit degradation
    const profitDegradation = 1 - (currentProfitPct / originalProfitPct);
    
    // Check if degradation exceeds the abort threshold
    return profitDegradation > strategy.riskAssessment.abortThreshold;
  }
  
  /**
   * Apply Agent Zero intelligence to optimize strategy parameters
   */
  public applyAgentZeroOptimization(strategy: any, agentZeroRecommendation: any): any {
    // If no Agent Zero recommendation is available, return the original strategy
    if (!agentZeroRecommendation) return strategy;
    
    // Clone the strategy to avoid modifying the original
    const optimizedStrategy = { ...strategy };
    
    // Apply Agent Zero size recommendation if available
    if (agentZeroRecommendation.optimizedSize) {
      optimizedStrategy.executionSize = agentZeroRecommendation.optimizedSize;
    }
    
    // Apply execution approach recommendation if available
    if (agentZeroRecommendation.executionStrategy) {
      optimizedStrategy.executionApproach = agentZeroRecommendation.executionStrategy;
    }
    
    // Apply timing recommendations if available
    if (agentZeroRecommendation.timing) {
      if (agentZeroRecommendation.timing.maxDelayMs) {
        optimizedStrategy.timing.retryDelayMs = agentZeroRecommendation.timing.maxDelayMs;
      }
      
      if (agentZeroRecommendation.timing.buyFirst !== undefined) {
        optimizedStrategy.sequenceOrder = agentZeroRecommendation.timing.buyFirst ? 'buy-first' : 'sell-first';
      }
    }
    
    // Apply risk assessment recommendations if available
    if (agentZeroRecommendation.riskAssessment) {
      if (agentZeroRecommendation.riskAssessment.confidence) {
        // Adjust abort threshold based on AI confidence (higher confidence = lower abort threshold)
        const confidenceAdjustment = 1 - agentZeroRecommendation.riskAssessment.confidence;
        optimizedStrategy.riskAssessment.abortThreshold = 
          Math.min(0.9, strategy.riskAssessment.abortThreshold + (confidenceAdjustment * 0.2));
      }
    }
    
    return optimizedStrategy;
  }
}
