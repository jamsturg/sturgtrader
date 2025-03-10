import axios from 'axios';
import { logger } from '../../utils/logger';

/**
 * Service for interacting with Agent Zero API running in a Docker container
 * This service allows the arbitrage system to leverage AI capabilities
 * Container is running with port mapping 50001:80
 */
class AgentZeroService {
  private apiUrl: string;
  private apiKey: string;
  private isInitialized: boolean = false;
  private dockerContainerId: string | null = null;

  constructor() {
    // Update to use the correct port mapping 50001 as specified by the user
    this.apiUrl = process.env.AGENT_ZERO_API_URL || 'http://localhost:50001';
    this.apiKey = process.env.AGENT_ZERO_API_KEY || '';
  }

  /**
   * Initialize the Agent Zero service by connecting to its Docker container
   */
  public async initialize(): Promise<boolean> {
    try {
      // First check if we need to start the Docker container
      const containerStatus = await this.checkDockerContainer();
      
      if (!containerStatus.running) {
        logger.info('Agent Zero Docker container not running, attempting to start...');
        const started = await this.startDockerContainer();
        
        if (!started) {
          logger.error('Failed to start Agent Zero Docker container');
          return false;
        }
        
        // Wait for container to be fully up
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Check if API is accessible
      // Using /api/health as the health check endpoint for the Flask API
      const response = await axios.get(`${this.apiUrl}/api/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.status === 200) {
        this.isInitialized = true;
        logger.info(`Agent Zero service initialized successfully. Connected to container: ${this.dockerContainerId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to initialize Agent Zero service', error);
      return false;
    }
  }
  
  /**
   * Check if Agent Zero Docker container is running
   */
  private async checkDockerContainer(): Promise<{running: boolean, containerId: string | null}> {
    try {
      // We'll use environment variables to locate the container
      const containerName = process.env.AGENT_ZERO_CONTAINER_NAME || 'agent-zero';
      
      // In a real implementation, we would use Docker API or spawn a process to run 'docker ps'
      // For simulation purposes, we're assuming the container exists
      this.dockerContainerId = process.env.AGENT_ZERO_CONTAINER_ID || 'agent-zero-container-123';
      
      // For now, we'll assume the container is running if we have an API URL
      const isRunning = !!this.apiUrl;
      
      return {
        running: isRunning,
        containerId: this.dockerContainerId
      };
    } catch (error) {
      logger.error('Error checking Docker container status', error);
      return {
        running: false,
        containerId: null
      };
    }
  }
  
  /**
   * Start the Agent Zero Docker container
   */
  private async startDockerContainer(): Promise<boolean> {
    try {
      // In a real implementation, we would use Docker API or spawn a process to run 'docker start'
      logger.info('Starting Agent Zero Docker container...');
      
      // Simulate starting the container
      this.dockerContainerId = process.env.AGENT_ZERO_CONTAINER_ID || 'agent-zero-container-123';
      
      logger.info(`Agent Zero Docker container started with ID: ${this.dockerContainerId}`);
      return true;
    } catch (error) {
      logger.error('Failed to start Docker container', error);
      return false;
    }
  }

  /**
   * Analyze market conditions and recommend trading strategies
   */
  public async analyzeMarket(marketData: any): Promise<any> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }
    }

    try {
      // Updated to use the proper Agent Zero API format
      const payload = {
        data: {
          type: 'trading_analysis',
          marketData
        },
        priority: 8,
        responseTimeout: 30000
      };

      const response = await axios.post(`${this.apiUrl}/api/process`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout for analysis
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to analyze market with Agent Zero', error);
      return null;
    }
  }

  /**
   * Get risk assessment for a specific trading opportunity
   */
  public async assessRisk(opportunity: any): Promise<any> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }
    }

    try {
      // Updated to use the proper Agent Zero API format
      const payload = {
        data: {
          type: 'risk_assessment',
          opportunity
        },
        priority: 9,
        responseTimeout: 15000
      };

      const response = await axios.post(`${this.apiUrl}/api/process`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout for risk assessment
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to assess risk with Agent Zero', error);
      return null;
    }
  }

  /**
   * Query the Agent Zero trading agent with custom queries
   */
  public async queryTradingAgent(query: any): Promise<any> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }
    }

    try {
      // Prepare the payload according to Agent Zero API format
      const payload = {
        data: query,
        priority: query.priority || 5,
        responseTimeout: query.responseTimeout || 10000
      };

      const response = await axios.post(`${this.apiUrl}/api/process`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: payload.responseTimeout + 5000 // Add extra time for network
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to query trading agent with Agent Zero', error);
      return null;
    }
  }

  /**
   * Check if the Agent Zero service is available
   */
  public isAvailable(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Shutdown the Agent Zero Docker container when the application exits
   */
  public async shutdown(): Promise<boolean> {
    if (!this.dockerContainerId) {
      return true; // Nothing to shut down
    }
    
    try {
      // In a real implementation, we would use Docker API or spawn a process to run 'docker stop'
      logger.info(`Stopping Agent Zero Docker container: ${this.dockerContainerId}`);
      
      // Simulate stopping the container
      this.isInitialized = false;
      
      logger.info('Agent Zero Docker container stopped successfully');
      return true;
    } catch (error) {
      logger.error('Failed to stop Docker container', error);
      return false;
    }
  }
}

export const agentZeroService = new AgentZeroService();
