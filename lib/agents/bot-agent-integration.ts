// Bot Agent Integration Module
// Handles integration between bots and agents

import { AgentConfig, AgentConfigManager } from './agent-config';

export interface BotAgent {
  id: string;
  botId: string;
  agentId: string;
  status: 'idle' | 'active' | 'processing' | 'error';
  lastActivity: Date;
  metrics: {
    requestsHandled: number;
    successRate: number;
    averageResponseTime: number;
  };
}

export interface IntegrationEvent {
  type: 'request' | 'response' | 'error' | 'status';
  botId: string;
  agentId: string;
  timestamp: Date;
  data: any;
}

export class BotAgentIntegration {
  private agents: Map<string, BotAgent> = new Map();
  private eventQueue: IntegrationEvent[] = [];
  private configManager: AgentConfigManager;

  constructor(configManager: AgentConfigManager) {
    this.configManager = configManager;
  }

  async registerBot(botId: string, agentId: string): Promise<BotAgent> {
    const agentConfig = this.configManager.getConfig(agentId);
    
    if (!agentConfig) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (!agentConfig.enabled) {
      throw new Error(`Agent ${agentId} is disabled`);
    }

    const botAgent: BotAgent = {
      id: `${botId}-${agentId}`,
      botId,
      agentId,
      status: 'idle',
      lastActivity: new Date(),
      metrics: {
        requestsHandled: 0,
        successRate: 100,
        averageResponseTime: 0,
      },
    };

    this.agents.set(botAgent.id, botAgent);
    return botAgent;
  }

  async processRequest(botId: string, agentId: string, request: any): Promise<any> {
    const botAgentId = `${botId}-${agentId}`;
    const botAgent = this.agents.get(botAgentId);

    if (!botAgent) {
      throw new Error(`Bot-Agent integration ${botAgentId} not found`);
    }

    const agentConfig = this.configManager.getConfig(agentId);
    if (!agentConfig?.enabled) {
      throw new Error(`Agent ${agentId} is not available`);
    }

    // Update status
    botAgent.status = 'processing';
    botAgent.lastActivity = new Date();

    // Record event
    this.recordEvent({
      type: 'request',
      botId,
      agentId,
      timestamp: new Date(),
      data: request,
    });

    try {
      // Simulate processing based on agent type
      const response = await this.simulateAgentProcessing(agentConfig, request);

      // Update metrics
      botAgent.metrics.requestsHandled++;
      botAgent.status = 'idle';

      // Record response event
      this.recordEvent({
        type: 'response',
        botId,
        agentId,
        timestamp: new Date(),
        data: response,
      });

      return response;
    } catch (error) {
      botAgent.status = 'error';
      botAgent.metrics.successRate = 
        (botAgent.metrics.successRate * (botAgent.metrics.requestsHandled - 1) + 0) / 
        botAgent.metrics.requestsHandled;

      this.recordEvent({
        type: 'error',
        botId,
        agentId,
        timestamp: new Date(),
        data: error,
      });

      throw error;
    }
  }

  private async simulateAgentProcessing(config: AgentConfig, request: any): Promise<any> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    // Return mock response based on agent type
    switch (config.type) {
      case 'trading':
        return {
          action: 'trade_executed',
          symbol: request.symbol || 'BTC',
          amount: request.amount || 100,
          price: request.price || 50000,
          timestamp: new Date(),
        };

      case 'defi':
        return {
          action: 'swap_completed',
          fromToken: request.fromToken || 'ETH',
          toToken: request.toToken || 'USDT',
          amount: request.amount || 1,
          rate: 3500,
          timestamp: new Date(),
        };

      case 'portfolio':
        return {
          action: 'portfolio_analyzed',
          totalValue: 100000,
          allocation: config.settings.targetAllocation,
          recommendations: ['Rebalance suggested'],
          timestamp: new Date(),
        };

      case 'compliance':
        return {
          action: 'compliance_checked',
          status: 'approved',
          kycLevel: config.settings.kycLevel,
          timestamp: new Date(),
        };

      case 'support':
        return {
          action: 'query_answered',
          question: request.question || 'How can I help?',
          answer: 'This is an automated response from the support agent.',
          confidence: 0.95,
          timestamp: new Date(),
        };

      default:
        return {
          action: 'processed',
          timestamp: new Date(),
        };
    }
  }

  private recordEvent(event: IntegrationEvent): void {
    this.eventQueue.push(event);
    
    // Keep only last 1000 events
    if (this.eventQueue.length > 1000) {
      this.eventQueue.shift();
    }
  }

  getAgentStatus(botId: string, agentId: string): BotAgent | undefined {
    return this.agents.get(`${botId}-${agentId}`);
  }

  getAllAgents(): BotAgent[] {
    return Array.from(this.agents.values());
  }

  getEvents(limit: number = 100): IntegrationEvent[] {
    return this.eventQueue.slice(-limit);
  }

  async disconnectBot(botId: string, agentId: string): Promise<void> {
    const botAgentId = `${botId}-${agentId}`;
    this.agents.delete(botAgentId);
    
    this.recordEvent({
      type: 'status',
      botId,
      agentId,
      timestamp: new Date(),
      data: { status: 'disconnected' },
    });
  }
}

// Export singleton instance
import agentConfigManager from './agent-config';
const botAgentIntegration = new BotAgentIntegration(agentConfigManager);
export default botAgentIntegration;

// Export AgentBotFactory
export class AgentBotFactory {
  static async createBot(botType: string, core: any): Promise<any> {
    return {
      execute: async (input: any) => {
        return {
          success: true,
          botType,
          action: input.action,
          result: `Bot ${botType} executed action: ${input.action}`,
          timestamp: new Date(),
        };
      },
      getAgentInfo: () => ({
        botType,
        status: 'active',
        capabilities: ['trading', 'analysis', 'execution'],
      }),
    };
  }
}