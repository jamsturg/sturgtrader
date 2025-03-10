import apiClient from './apiClient';

/**
 * AgentZeroApiService provides methods to interact with Agent Zero
 * for AI-powered trading strategy analysis. This service makes real API calls
 * to our backend endpoints that integrate with Agent Zero.
 */
export class AgentZeroApiService {
  private baseUrl = '/api/ai/agent-zero';

  /**
   * Analyze a trading strategy using Agent Zero
   * @param strategy Strategy configuration and parameters
   * @param marketData Historical market data for analysis
   */
  async analyzeStrategy(strategy: any, marketData?: any): Promise<any> {
    return apiClient.post(`${this.baseUrl}/analyze`, { strategy, marketData });
  }

  /**
   * Generate trading strategy recommendations based on market conditions
   * @param market The market symbol
   * @param timeframe The timeframe to analyze
   * @param preferences User preferences for strategy generation
   */
  async generateRecommendations(market: string, timeframe: string, preferences?: any): Promise<any> {
    return apiClient.post(`${this.baseUrl}/recommendations`, { market, timeframe, preferences });
  }

  /**
   * Optimize strategy parameters using AI
   * @param strategy Base strategy configuration
   * @param parameters Parameters to optimize with their ranges
   * @param marketData Historical market data for optimization
   * @param optimizationCriteria Criteria to optimize for (e.g., 'profit', 'drawdown', 'sharpe')
   */
  async optimizeParameters(strategy: any, parameters: any, marketData: any, optimizationCriteria: string = 'profit'): Promise<any> {
    return apiClient.post(`${this.baseUrl}/optimize`, {
      strategy,
      parameters,
      marketData,
      optimizationCriteria
    });
  }

  /**
   * Predict market direction using machine learning
   * @param market The market symbol
   * @param timeframe The timeframe to analyze
   * @param indicators Technical indicators to use in prediction
   */
  async predictMarketDirection(market: string, timeframe: string, indicators: string[] = []): Promise<any> {
    return apiClient.post(`${this.baseUrl}/predict`, { market, timeframe, indicators });
  }

  /**
   * Analyze a trading bot's performance and provide improvement suggestions
   * @param botId The ID of the trading bot to analyze
   * @param tradeHistory Trade history for analysis
   */
  async analyzeBotPerformance(botId: string, tradeHistory?: any): Promise<any> {
    return apiClient.post(`${this.baseUrl}/bots/${botId}/analyze`, { tradeHistory });
  }

  /**
   * Generate a natural language explanation of a strategy's performance
   * @param strategyId The strategy ID
   * @param backtestResults Backtest results for explanation
   */
  async explainPerformance(strategyId: string, backtestResults: any): Promise<any> {
    return apiClient.post(`${this.baseUrl}/strategies/${strategyId}/explain`, { backtestResults });
  }

  /**
   * Convert a natural language strategy description to code
   * @param description Natural language description of the strategy
   * @param format Output format (e.g., 'freqtrade', 'hummingbot', 'python')
   */
  async generateStrategyCode(description: string, format: string = 'freqtrade'): Promise<any> {
    return apiClient.post(`${this.baseUrl}/generate-code`, { description, format });
  }

  /**
   * Tokenize a trading strategy as an NFT
   * @param strategyId The strategy ID to tokenize
   * @param metadata Additional metadata for the NFT
   */
  async tokenizeStrategy(strategyId: string, metadata: any): Promise<any> {
    return apiClient.post(`${this.baseUrl}/strategies/${strategyId}/tokenize`, { metadata });
  }
}

// Export a singleton instance
const agentZeroApi = new AgentZeroApiService();
export default agentZeroApi;
