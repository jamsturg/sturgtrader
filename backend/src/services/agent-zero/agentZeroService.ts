import axios from 'axios';
import { logger } from '../../server';

interface StrategyAnalysisRequest {
  strategyId: string;
  strategyCode: string;
  marketData: any;
  historicalPerformance?: any;
  parameters?: Record<string, any>;
}

interface AnalysisResponse {
  analysisId: string;
  recommendations: Array<{
    type: string;
    confidence: number;
    description: string;
    suggestedAction?: any;
  }>;
  optimizedParameters?: Record<string, any>;
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    details: string;
  };
  insights: string[];
}

class AgentZeroService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.AGENT_ZERO_API_URL || 'http://localhost:8000';
    this.apiKey = process.env.AGENT_ZERO_API_KEY || '';
  }

  /**
   * Analyzes a trading strategy using Agent Zero AI
   */
  async analyzeStrategy(request: StrategyAnalysisRequest): Promise<AnalysisResponse> {
    try {
      logger.info(`Submitting strategy ${request.strategyId} for Agent Zero analysis`);
      
      // Prepare the prompt for Agent Zero
      const promptData = {
        task: 'analyze_trading_strategy',
        strategy_code: request.strategyCode,
        market_data: request.marketData,
        historical_performance: request.historicalPerformance || null,
        parameters: request.parameters || {}
      };
      
      // Send request to Agent Zero API
      const response = await axios.post(`${this.baseUrl}/api/analyze`, promptData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Agent Zero API returned status code ${response.status}`);
      }
      
      logger.info(`Strategy analysis completed for ${request.strategyId}`);
      return this.formatAnalysisResponse(response.data);
    } catch (error: any) {
      logger.error(`Error analyzing strategy with Agent Zero: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Optimizes strategy parameters using Agent Zero's AI
   */
  async optimizeStrategyParameters(strategyId: string, code: string, currentParams: Record<string, any>, historicalData: any): Promise<Record<string, any>> {
    try {
      logger.info(`Optimizing parameters for strategy ${strategyId}`);
      
      // Prepare the prompt for parameter optimization
      const promptData = {
        task: 'optimize_strategy_parameters',
        strategy_id: strategyId,
        strategy_code: code,
        current_parameters: currentParams,
        historical_data: historicalData
      };
      
      // Send request to Agent Zero API
      const response = await axios.post(`${this.baseUrl}/api/optimize`, promptData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Agent Zero API returned status code ${response.status}`);
      }
      
      logger.info(`Parameter optimization completed for ${strategyId}`);
      return response.data.optimized_parameters;
    } catch (error: any) {
      logger.error(`Error optimizing strategy parameters: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Formats the raw Agent Zero response into a structured analysis
   */
  private formatAnalysisResponse(rawResponse: any): AnalysisResponse {
    return {
      analysisId: rawResponse.analysis_id || `analysis-${Date.now()}`,
      recommendations: rawResponse.recommendations || [],
      optimizedParameters: rawResponse.optimized_parameters,
      riskAssessment: rawResponse.risk_assessment,
      insights: rawResponse.insights || []
    };
  }
}

export default new AgentZeroService();
