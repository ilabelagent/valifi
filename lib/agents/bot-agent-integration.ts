// Integration between Valifi Bots and LangGraph Agents
import { AgentFactory, AgentType, ValifiAgent } from '../agents/agent-config';
import { createReActTradingAgent } from '../agents/react-agent';
import { createTradingWorkflow, createDeFiWorkflow } from '../agents/workflow-agent';
import { createInvestmentOrchestrator, createPortfolioOrchestrator } from '../agents/orchestrator-agent';
import KingdomCore from '../core/KingdomCore';
import KingdomBot from '../core/KingdomBot';

// Agent-enhanced Bot class
export class AgentEnhancedBot extends KingdomBot {
  private agent: ValifiAgent | null = null;
  private agentType: AgentType | null = null;
  private agentConfig: any = null;

  async initializeAgent(agentType: AgentType, config?: any) {
    this.agentType = agentType;
    this.agentConfig = config;

    try {
      // Create agent based on type
      switch (agentType) {
        case AgentType.REACT:
          this.agent = await createReActTradingAgent();
          break;
        
        case AgentType.WORKFLOW:
          if (config?.workflowType === 'defi') {
            this.agent = await createDeFiWorkflow();
          } else {
            this.agent = await createTradingWorkflow();
          }
          break;
        
        case AgentType.ORCHESTRATOR:
          if (config?.orchestratorType === 'portfolio') {
            this.agent = await createPortfolioOrchestrator();
          } else {
            this.agent = await createInvestmentOrchestrator();
          }
          break;
        
        default:
          this.agent = await AgentFactory.createAgent({
            type: agentType,
            name: `${this.constructor.name}-Agent`,
            description: 'AI agent for enhanced bot capabilities',
            llmConfig: config?.llmConfig || {
              provider: 'openai',
              model: 'gpt-4-turbo-preview',
              temperature: 0.7,
            },
            tools: config?.tools || [],
            systemPrompt: config?.systemPrompt,
            enableTracing: true,
          });
      }

      this.logDivineAction('Agent initialized', { 
        agentType, 
        botClass: this.constructor.name 
      });
      
      return true;
    } catch (error: any) {
      this.logDivineAction('Agent initialization failed', { 
        error: error.message,
        agentType,
      });
      return false;
    }
  }

  // Execute agent with input
  async executeAgent(input: any) {
    if (!this.agent) {
      throw new Error('Agent not initialized. Call initializeAgent() first.');
    }

    const startTime = Date.now();
    
    try {
      const result = await this.agent.execute(input);
      
      this.logDivineAction('Agent execution completed', {
        executionTime: Date.now() - startTime,
        inputType: typeof input,
        hasResult: !!result,
      });
      
      return result;
    } catch (error: any) {
      this.logDivineAction('Agent execution failed', {
        error: error.message,
        executionTime: Date.now() - startTime,
      });
      throw error;
    }
  }

  // Stream agent execution
  async streamAgent(input: any) {
    if (!this.agent) {
      throw new Error('Agent not initialized. Call initializeAgent() first.');
    }

    try {
      const stream = await this.agent.stream(input);
      return stream;
    } catch (error: any) {
      this.logDivineAction('Agent streaming failed', { error: error.message });
      throw error;
    }
  }

  // Get agent info
  getAgentInfo() {
    if (!this.agent) {
      return null;
    }
    return this.agent.getInfo();
  }
}

// Agent Registry - Maps bot types to recommended agents
export const BotAgentRegistry = {
  // Trading bots use ReAct agents
  'trading': {
    agentType: AgentType.REACT,
    config: {
      systemPrompt: 'You are an expert trading assistant. Analyze markets and execute trades strategically.',
    },
  },
  
  // Portfolio bots use Orchestrator agents
  'portfolio': {
    agentType: AgentType.ORCHESTRATOR,
    config: {
      orchestratorType: 'portfolio',
      systemPrompt: 'You are a portfolio manager. Optimize asset allocation and manage risk.',
    },
  },
  
  // DeFi bots use Workflow agents
  'defi': {
    agentType: AgentType.WORKFLOW,
    config: {
      workflowType: 'defi',
      systemPrompt: 'You are a DeFi expert. Find and execute optimal yield strategies.',
    },
  },
  
  // Analytics bots use Evaluator agents
  'analytics': {
    agentType: AgentType.EVALUATOR,
    config: {
      systemPrompt: 'You are a market analyst. Provide detailed analysis and insights.',
    },
  },
  
  // P2P bots use Router agents
  'p2p': {
    agentType: AgentType.ROUTER,
    config: {
      systemPrompt: 'You are a P2P trading coordinator. Match orders and manage escrow.',
    },
  },
  
  // Crypto bots use Parallel agents
  'crypto': {
    agentType: AgentType.PARALLEL,
    config: {
      systemPrompt: 'You are a crypto trading expert. Monitor multiple chains and execute cross-chain strategies.',
    },
  },
};

// Enhanced Trading Bot with Agent
export class AgentTradingBot extends AgentEnhancedBot {
  async initialize() {
    // Initialize base bot
    await super.initialize();
    
    // Initialize ReAct agent
    await this.initializeAgent(AgentType.REACT, {
      systemPrompt: `You are an advanced trading bot with access to real-time market data and execution capabilities.
      
Your responsibilities:
1. Analyze market conditions
2. Identify trading opportunities
3. Execute trades with proper risk management
4. Monitor positions and performance
5. Provide detailed explanations for all actions`,
    });
    
    return true;
  }

  async execute(params: any) {
    const { action, ...data } = params;
    
    // Use agent for complex trading decisions
    if (action === 'analyze_and_trade') {
      const agentResult = await this.executeAgent({
        objective: 'Analyze market and execute optimal trade',
        data,
      });
      return agentResult;
    }
    
    // Fall back to traditional bot logic for simple actions
    return super.execute(params);
  }
}

// Enhanced Portfolio Bot with Orchestrator
export class AgentPortfolioBot extends AgentEnhancedBot {
  async initialize() {
    await super.initialize();
    
    // Initialize Orchestrator agent
    await this.initializeAgent(AgentType.ORCHESTRATOR, {
      orchestratorType: 'portfolio',
      systemPrompt: `You are a portfolio optimization orchestrator. Break down complex portfolio tasks into subtasks and coordinate their execution.`,
    });
    
    return true;
  }

  async execute(params: any) {
    const { action, ...data } = params;
    
    // Use orchestrator for complex portfolio operations
    if (action === 'optimize_portfolio' || action === 'rebalance') {
      const agentResult = await this.executeAgent({
        objective: `${action}: ${JSON.stringify(data)}`,
      });
      return agentResult;
    }
    
    return super.execute(params);
  }
}

// Enhanced DeFi Bot with Workflow
export class AgentDeFiBot extends AgentEnhancedBot {
  async initialize() {
    await super.initialize();
    
    // Initialize Workflow agent
    await this.initializeAgent(AgentType.WORKFLOW, {
      workflowType: 'defi',
      systemPrompt: `You are a DeFi workflow coordinator. Execute multi-step DeFi strategies efficiently.`,
    });
    
    return true;
  }

  async execute(params: any) {
    const { action, ...data } = params;
    
    // Use workflow for DeFi strategies
    if (action === 'find_yield' || action === 'execute_strategy') {
      const agentResult = await this.executeAgent({
        input: `${action}: ${JSON.stringify(data)}`,
      });
      return agentResult;
    }
    
    return super.execute(params);
  }
}

// Factory to create agent-enhanced bots
export class AgentBotFactory {
  static async createBot(botType: string, core: KingdomCore) {
    const registry = BotAgentRegistry[botType.toLowerCase()];
    
    if (!registry) {
      throw new Error(`No agent configuration found for bot type: ${botType}`);
    }
    
    let bot: AgentEnhancedBot;
    
    // Create specific bot based on type
    switch (botType.toLowerCase()) {
      case 'trading':
        bot = new AgentTradingBot(core);
        break;
      
      case 'portfolio':
        bot = new AgentPortfolioBot(core);
        break;
      
      case 'defi':
        bot = new AgentDeFiBot(core);
        break;
      
      default:
        // Generic agent-enhanced bot
        bot = new AgentEnhancedBot(core);
        await bot.initializeAgent(registry.agentType, registry.config);
    }
    
    await bot.initialize();
    return bot;
  }

  // Create all agent-enhanced bots
  static async createAllBots(core: KingdomCore) {
    const bots: Record<string, AgentEnhancedBot> = {};
    
    for (const botType of Object.keys(BotAgentRegistry)) {
      try {
        bots[botType] = await this.createBot(botType, core);
        console.log(`✅ Created agent-enhanced bot: ${botType}`);
      } catch (error: any) {
        console.error(`❌ Failed to create bot ${botType}:`, error.message);
      }
    }
    
    return bots;
  }
}

export default AgentBotFactory;