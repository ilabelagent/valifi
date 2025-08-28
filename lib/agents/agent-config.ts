// Agent Configuration Module
// This module handles agent configurations for the valifi bot platform

export interface AgentConfig {
  id: string;
  name: string;
  type: 'trading' | 'defi' | 'portfolio' | 'compliance' | 'support';
  enabled: boolean;
  settings: Record<string, any>;
  permissions: string[];
  rateLimit: number;
  timeout: number;
}

export const defaultAgentConfigs: Record<string, AgentConfig> = {
  trading: {
    id: 'trading-agent',
    name: 'Trading Agent',
    type: 'trading',
    enabled: true,
    settings: {
      maxTradeAmount: 10000,
      riskLevel: 'medium',
      stopLoss: 0.02,
      takeProfit: 0.05,
    },
    permissions: ['execute_trades', 'view_portfolio', 'analyze_market'],
    rateLimit: 100,
    timeout: 30000,
  },
  defi: {
    id: 'defi-agent',
    name: 'DeFi Agent',
    type: 'defi',
    enabled: true,
    settings: {
      protocols: ['uniswap', 'compound', 'aave'],
      maxGas: 100,
      slippage: 0.01,
    },
    permissions: ['swap_tokens', 'provide_liquidity', 'stake'],
    rateLimit: 50,
    timeout: 60000,
  },
  portfolio: {
    id: 'portfolio-agent',
    name: 'Portfolio Manager',
    type: 'portfolio',
    enabled: true,
    settings: {
      rebalanceFrequency: 'weekly',
      targetAllocation: {
        stocks: 0.4,
        crypto: 0.3,
        bonds: 0.2,
        cash: 0.1,
      },
    },
    permissions: ['view_portfolio', 'rebalance', 'generate_reports'],
    rateLimit: 20,
    timeout: 45000,
  },
  compliance: {
    id: 'compliance-agent',
    name: 'Compliance Agent',
    type: 'compliance',
    enabled: true,
    settings: {
      kycLevel: 2,
      amlCheck: true,
      sanctionsCheck: true,
    },
    permissions: ['verify_identity', 'check_compliance', 'flag_suspicious'],
    rateLimit: 10,
    timeout: 120000,
  },
  support: {
    id: 'support-agent',
    name: 'Support Agent',
    type: 'support',
    enabled: true,
    settings: {
      responseTime: 'instant',
      aiModel: 'gpt-4',
      fallbackToHuman: true,
    },
    permissions: ['answer_queries', 'escalate_issues', 'update_tickets'],
    rateLimit: 200,
    timeout: 15000,
  },
};

export class AgentConfigManager {
  private configs: Map<string, AgentConfig>;

  constructor() {
    this.configs = new Map(Object.entries(defaultAgentConfigs));
  }

  getConfig(agentId: string): AgentConfig | undefined {
    return this.configs.get(agentId);
  }

  getAllConfigs(): AgentConfig[] {
    return Array.from(this.configs.values());
  }

  updateConfig(agentId: string, updates: Partial<AgentConfig>): boolean {
    const config = this.configs.get(agentId);
    if (!config) return false;

    this.configs.set(agentId, { ...config, ...updates });
    return true;
  }

  enableAgent(agentId: string): boolean {
    return this.updateConfig(agentId, { enabled: true });
  }

  disableAgent(agentId: string): boolean {
    return this.updateConfig(agentId, { enabled: false });
  }

  validatePermissions(agentId: string, permission: string): boolean {
    const config = this.getConfig(agentId);
    return config?.enabled && config.permissions.includes(permission) || false;
  }
}

// Export singleton instance
const agentConfigManager = new AgentConfigManager();
export default agentConfigManager;

// Export AgentType enum
export enum AgentType {
  REACT = 'react',
  WORKFLOW = 'workflow',
  ORCHESTRATOR = 'orchestrator',
  EVALUATOR = 'evaluator',
  ROUTER = 'router',
  PARALLEL = 'parallel',
  CHAIN = 'chain',
}

// Export AgentFactory class
export class AgentFactory {
  static async createAgent(config: any): Promise<any> {
    // Mock agent creation
    return {
      execute: async (input: any) => {
        return {
          success: true,
          output: `Processed: ${JSON.stringify(input)}`,
          timestamp: new Date(),
        };
      },
      stream: async function* (input: any) {
        yield { chunk: 'Starting...', timestamp: new Date() };
        yield { chunk: `Processing: ${JSON.stringify(input)}`, timestamp: new Date() };
        yield { chunk: 'Complete!', timestamp: new Date() };
      },
      getInfo: () => ({
        type: config.type,
        name: config.name,
        description: config.description,
      }),
    };
  }

  static async createTradingAgent(): Promise<any> {
    return this.createAgent({
      type: AgentType.REACT,
      name: 'TradingAgent',
      description: 'Agent for trading operations',
    });
  }

  static async createDeFiAgent(): Promise<any> {
    return this.createAgent({
      type: AgentType.WORKFLOW,
      name: 'DeFiAgent',
      description: 'Agent for DeFi operations',
    });
  }

  static async createAnalysisAgent(): Promise<any> {
    return this.createAgent({
      type: AgentType.EVALUATOR,
      name: 'AnalysisAgent',
      description: 'Agent for market analysis',
    });
  }
}