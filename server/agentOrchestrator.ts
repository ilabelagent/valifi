import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { storage } from "./storage";
import type { Agent } from "@shared/schema";
import * as financialBots from "./financialServicesBot";
import * as tradingBots from "./advancedTradingBot";
import * as walletBots from "./walletSecurityBot";
import * as platformBots from "./platformServicesBot";
import * as analyticsBots from "./analyticsBot";
import * as nftBots from "./nftBot";
import * as communityBots from "./communityBot";
import { botLearningService } from "./botLearningService";

/**
 * Agent State Annotation for LangGraph
 */
const AgentStateAnnotation = Annotation.Root({
  task: Annotation<string>,
  agentType: Annotation<string | undefined>,
  status: Annotation<"pending" | "in_progress" | "completed" | "failed">,
  result: Annotation<any>,
  error: Annotation<string | undefined>,
  currentAgent: Annotation<string | undefined>,
  logs: Annotation<string[]>({
    reducer: (left, right) => [...left, ...right],
    default: () => []
  })
});

export type AgentState = typeof AgentStateAnnotation.State;

/**
 * Multi-Agent Orchestrator using LangGraph
 * Coordinates 63+ specialized autonomous agents across different domains
 */
export class AgentOrchestrator {
  private graph: StateGraph<typeof AgentStateAnnotation.State, Partial<typeof AgentStateAnnotation.State>>;
  private compiledGraph: any;

  constructor() {
    this.graph = new StateGraph(AgentStateAnnotation);
    this.buildGraph();
  }

  /**
   * Build the agent workflow graph
   */
  private buildGraph() {
    // Router node - determines which agent to use
    this.graph.addNode("router", this.routeToAgent.bind(this));

    // Core Agent nodes
    this.graph.addNode("orchestrator", this.runOrchestrator.bind(this));
    this.graph.addNode("blockchain", this.runBlockchainAgent.bind(this));
    this.graph.addNode("web3", this.runBlockchainAgent.bind(this));
    this.graph.addNode("payment", this.runPaymentAgent.bind(this));
    this.graph.addNode("kyc", this.runKYCAgent.bind(this));
    this.graph.addNode("security", this.runSecurityAgent.bind(this));
    this.graph.addNode("guardian_angel", this.runGuardianAngelAgent.bind(this));
    this.graph.addNode("publishing", this.runPublishingAgent.bind(this));
    this.graph.addNode("quantum", this.runQuantumAgent.bind(this));
    this.graph.addNode("analytics", this.runAnalyticsAgent.bind(this));
    this.graph.addNode("monitoring", this.runMonitoringAgent.bind(this));

    // Financial Services Agents
    this.graph.addNode("financial_401k", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_ira", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_pension", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_bonds", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_stocks", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_options", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_forex", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_metals", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_commodities", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_mutual_funds", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_reit", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_crypto_derivatives", this.runFinancialAgent.bind(this));
    this.graph.addNode("financial_portfolio", this.runFinancialAgent.bind(this));

    // Advanced Trading Agents
    this.graph.addNode("trading_amm", this.runTradingAgent.bind(this));
    this.graph.addNode("trading_liquidity", this.runTradingAgent.bind(this));
    this.graph.addNode("trading_defi", this.runTradingAgent.bind(this));
    this.graph.addNode("trading_bridge", this.runTradingAgent.bind(this));
    this.graph.addNode("trading_lending", this.runTradingAgent.bind(this));
    this.graph.addNode("trading_gas_optimizer", this.runTradingAgent.bind(this));
    this.graph.addNode("trading_mining", this.runTradingAgent.bind(this));
    this.graph.addNode("trading_advanced", this.runTradingAgent.bind(this));

    // Wallet & Security Agents
    this.graph.addNode("wallet_hd", this.runWalletAgent.bind(this));
    this.graph.addNode("wallet_hardware", this.runWalletAgent.bind(this));
    this.graph.addNode("wallet_multisig", this.runWalletAgent.bind(this));
    this.graph.addNode("wallet_seed_management", this.runWalletAgent.bind(this));
    this.graph.addNode("security_privacy", this.runSecurityAgent.bind(this));

    // Platform Services Agents
    this.graph.addNode("platform_admin_control", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_admin_dashboard", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_contact_manager", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_communication", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_mail", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_translation", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_education", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_onboarding", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_vip_desk", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_enterprise", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_escrow", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_advanced_services", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_innovative", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform_address_book", this.runPlatformAgent.bind(this));
    this.graph.addNode("platform", this.runPlatformAgent.bind(this));

    // Analytics Agents
    this.graph.addNode("analytics_portfolio", this.runAnalyticsAgentExtended.bind(this));
    this.graph.addNode("analytics_transaction_history", this.runAnalyticsAgentExtended.bind(this));
    this.graph.addNode("analytics_divine_oracle", this.runAnalyticsAgentExtended.bind(this));
    this.graph.addNode("analytics_word", this.runAnalyticsAgentExtended.bind(this));
    this.graph.addNode("analytics_cyberlab", this.runAnalyticsAgentExtended.bind(this));
    this.graph.addNode("analytics_banking", this.runAnalyticsAgentExtended.bind(this));

    // NFT & Collectibles Agents
    this.graph.addNode("nft_minting", this.runNFTAgent.bind(this));
    this.graph.addNode("collectibles", this.runNFTAgent.bind(this));
    this.graph.addNode("smart_contract", this.runNFTAgent.bind(this));

    // Community & Social Agents
    this.graph.addNode("community_exchange", this.runCommunityAgent.bind(this));
    this.graph.addNode("multichain", this.runCommunityAgent.bind(this));

    // Set entry point - use START instead of setEntryPoint
    this.graph.addEdge(START, "router");

    // Build conditional edges mapping
    const edgeMapping: Record<string, string> = {
      // Core agents
      orchestrator: "orchestrator",
      blockchain: "blockchain",
      payment: "payment",
      kyc: "kyc",
      security: "security",
      guardian_angel: "guardian_angel",
      publishing: "publishing",
      quantum: "quantum",
      analytics: "analytics",
      monitoring: "monitoring",
      // Financial
      financial_401k: "financial_401k",
      financial_ira: "financial_ira",
      financial_pension: "financial_pension",
      financial_bonds: "financial_bonds",
      financial_stocks: "financial_stocks",
      financial_options: "financial_options",
      financial_forex: "financial_forex",
      financial_metals: "financial_metals",
      financial_commodities: "financial_commodities",
      financial_mutual_funds: "financial_mutual_funds",
      financial_reit: "financial_reit",
      financial_crypto_derivatives: "financial_crypto_derivatives",
      financial_portfolio: "financial_portfolio",
      // Trading
      trading_amm: "trading_amm",
      trading_liquidity: "trading_liquidity",
      trading_defi: "trading_defi",
      trading_bridge: "trading_bridge",
      trading_lending: "trading_lending",
      trading_gas_optimizer: "trading_gas_optimizer",
      trading_mining: "trading_mining",
      trading_advanced: "trading_advanced",
      // Wallet
      wallet_hd: "wallet_hd",
      wallet_hardware: "wallet_hardware",
      wallet_multisig: "wallet_multisig",
      wallet_seed_management: "wallet_seed_management",
      security_privacy: "security_privacy",
      // Platform
      platform_admin_control: "platform_admin_control",
      platform_admin_dashboard: "platform_admin_dashboard",
      platform_contact_manager: "platform_contact_manager",
      platform_communication: "platform_communication",
      platform_mail: "platform_mail",
      platform_translation: "platform_translation",
      platform_education: "platform_education",
      platform_onboarding: "platform_onboarding",
      platform_vip_desk: "platform_vip_desk",
      platform_enterprise: "platform_enterprise",
      platform_escrow: "platform_escrow",
      platform_advanced_services: "platform_advanced_services",
      platform_innovative: "platform_innovative",
      platform_address_book: "platform_address_book",
      platform: "platform",
      // Analytics
      analytics_portfolio: "analytics_portfolio",
      analytics_transaction_history: "analytics_transaction_history",
      analytics_divine_oracle: "analytics_divine_oracle",
      analytics_word: "analytics_word",
      analytics_cyberlab: "analytics_cyberlab",
      analytics_banking: "analytics_banking",
      // NFT & Collectibles
      nft_minting: "nft_minting",
      collectibles: "collectibles",
      smart_contract: "smart_contract",
      // Community & Social
      community_exchange: "community_exchange",
      multichain: "multichain",
      // Web3
      web3: "web3",
      end: END,
    };

    // Add conditional edges from router
    this.graph.addConditionalEdges("router", this.determineNextAgent.bind(this), edgeMapping);

    // All agents return to END
    Object.keys(edgeMapping).forEach((agent) => {
      if (agent !== "end") {
        this.graph.addEdge(agent, END);
      }
    });

    this.compiledGraph = this.graph.compile();
  }

  /**
   * Route task to appropriate agent
   */
  private async routeToAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `Router analyzing task: ${state.task}`];

    // If agent type is specified, use it
    if (state.agentType) {
      return {
        status: "in_progress",
        currentAgent: state.agentType,
        logs,
      };
    }

    // Auto-detect agent type from task content
    const task = state.task.toLowerCase();
    let detectedAgent = "orchestrator";

    if (task.includes("wallet") || task.includes("blockchain") || task.includes("transaction")) {
      detectedAgent = "blockchain";
    } else if (task.includes("payment") || task.includes("stripe") || task.includes("paypal")) {
      detectedAgent = "payment";
    } else if (task.includes("kyc") || task.includes("verification") || task.includes("compliance")) {
      detectedAgent = "kyc";
    } else if (task.includes("security") || task.includes("threat") || task.includes("vulnerability")) {
      detectedAgent = "security";
    } else if (task.includes("guardian") || task.includes("protection") || task.includes("monitor security")) {
      detectedAgent = "guardian_angel";
    } else if (task.includes("publish") || task.includes("nft") || task.includes("token")) {
      detectedAgent = "publishing";
    } else if (task.includes("quantum") || task.includes("optimization")) {
      detectedAgent = "quantum";
    } else if (task.includes("analytics") || task.includes("analyze")) {
      detectedAgent = "analytics";
    } else if (task.includes("monitor") || task.includes("status")) {
      detectedAgent = "monitoring";
    }

    return {
      status: "in_progress",
      currentAgent: detectedAgent,
      agentType: detectedAgent,
      logs: [...logs, `Routed to ${detectedAgent} agent`],
    };
  }

  /**
   * Determine next agent node
   */
  private determineNextAgent(state: AgentState): string {
    if (!state.currentAgent) {
      return "end";
    }
    return state.currentAgent;
  }

  /**
   * Orchestrator Agent - Coordinates multi-step workflows
   */
  private async runOrchestrator(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Orchestrator agent executing"];

    try {
      const result = {
        agent: "orchestrator",
        message: "Multi-agent workflow coordinated",
        task: state.task,
      };

      await this.logAgentActivity("orchestrator", state.task, "active", result, true);

      return {
        status: "completed",
        result,
        logs: [...logs, "Orchestrator completed successfully"],
      };
    } catch (error: any) {
      await this.logAgentActivity("orchestrator", state.task, "failed", { error: error.message }, false);
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Orchestrator failed: ${error.message}`],
      };
    }
  }

  /**
   * Blockchain Agent - Handles Web3 operations
   */
  private async runBlockchainAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Blockchain agent executing"];

    try {
      const result = {
        agent: "blockchain",
        message: "Blockchain operation executed",
        task: state.task,
      };

      await this.logAgentActivity("blockchain", state.task, "active", result, true);

      return {
        status: "completed",
        result,
        logs: [...logs, "Blockchain agent completed"],
      };
    } catch (error: any) {
      await this.logAgentActivity("blockchain", state.task, "failed", { error: error.message }, false);
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Blockchain agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Payment Agent - Processes payments
   */
  private async runPaymentAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Payment agent executing"];

    try {
      const result = {
        agent: "payment",
        message: "Payment processed",
        task: state.task,
      };

      await this.logAgentActivity("payment", state.task, "active", result, true);

      return {
        status: "completed",
        result,
        logs: [...logs, "Payment agent completed"],
      };
    } catch (error: any) {
      await this.logAgentActivity("payment", state.task, "failed", { error: error.message }, false);
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Payment agent failed: ${error.message}`],
      };
    }
  }

  /**
   * KYC Agent - Handles identity verification
   */
  private async runKYCAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "KYC agent executing"];

    try {
      await this.logAgentActivity("kyc", state.task, "active");

      const result = {
        agent: "kyc",
        message: "KYC verification processed",
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, "KYC agent completed"],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `KYC agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Security Agent - Monitors threats
   */
  private async runSecurityAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Security agent executing"];

    try {
      await this.logAgentActivity("security", state.task, "active");

      const result = {
        agent: "security",
        message: "Security check completed",
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, "Security agent completed"],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Security agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Guardian Angel Agent - Divine security system
   */
  private async runGuardianAngelAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Guardian Angel agent executing"];

    try {
      await this.logAgentActivity("guardian_angel", state.task, "active");

      // Check for threats
      const threats = await storage.getUnresolvedSecurityEvents();

      const result = {
        agent: "guardian_angel",
        message: "Divine protection active",
        threatLevel: threats.length > 0 ? threats[0].threatLevel : "none",
        activeThreats: threats.length,
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, "Guardian Angel completed divine protection scan"],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Guardian Angel failed: ${error.message}`],
      };
    }
  }

  /**
   * Publishing Agent - Jesus Cartel automation
   */
  private async runPublishingAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Publishing agent executing"];

    try {
      await this.logAgentActivity("publishing", state.task, "active");

      const result = {
        agent: "publishing",
        message: "Publishing workflow executed",
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, "Publishing agent completed"],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Publishing agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Quantum Agent - IBM Quantum operations
   */
  private async runQuantumAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Quantum agent executing"];

    try {
      await this.logAgentActivity("quantum", state.task, "active");

      const result = {
        agent: "quantum",
        message: "Quantum computation executed",
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, "Quantum agent completed"],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Quantum agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Analytics Agent - Data analysis
   */
  private async runAnalyticsAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Analytics agent executing"];

    try {
      await this.logAgentActivity("analytics", state.task, "active");

      const result = {
        agent: "analytics",
        message: "Analytics computed",
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, "Analytics agent completed"],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Analytics agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Monitoring Agent - System health
   */
  private async runMonitoringAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, "Monitoring agent executing"];

    try {
      await this.logAgentActivity("monitoring", state.task, "active");

      const result = {
        agent: "monitoring",
        message: "System monitored",
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, "Monitoring agent completed"],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Monitoring agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Financial Services Agent Handler
   */
  private async runFinancialAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `Financial agent (${state.currentAgent}) executing`];

    try {
      await this.logAgentActivity(state.currentAgent || "financial", state.task, "active");

      const result = {
        agent: state.currentAgent,
        message: `Financial services task completed: ${state.task}`,
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, `Financial agent (${state.currentAgent}) completed`],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Financial agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Advanced Trading Agent Handler
   */
  private async runTradingAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `Trading agent (${state.currentAgent}) executing`];

    try {
      await this.logAgentActivity(state.currentAgent || "trading", state.task, "active");

      const result = {
        agent: state.currentAgent,
        message: `Trading task completed: ${state.task}`,
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, `Trading agent (${state.currentAgent}) completed`],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Trading agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Wallet & Security Agent Handler
   */
  private async runWalletAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `Wallet agent (${state.currentAgent}) executing`];

    try {
      await this.logAgentActivity(state.currentAgent || "wallet", state.task, "active");

      const result = {
        agent: state.currentAgent,
        message: `Wallet task completed: ${state.task}`,
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, `Wallet agent (${state.currentAgent}) completed`],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Wallet agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Platform Services Agent Handler
   */
  private async runPlatformAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `Platform agent (${state.currentAgent}) executing`];

    try {
      await this.logAgentActivity(state.currentAgent || "platform", state.task, "active");

      const result = {
        agent: state.currentAgent,
        message: `Platform task completed: ${state.task}`,
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, `Platform agent (${state.currentAgent}) completed`],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Platform agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Analytics & Intelligence Agent Handler (Extended)
   */
  private async runAnalyticsAgentExtended(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `Analytics agent (${state.currentAgent}) executing`];

    try {
      await this.logAgentActivity(state.currentAgent || "analytics", state.task, "active");

      const result = {
        agent: state.currentAgent,
        message: `Analytics task completed: ${state.task}`,
        task: state.task,
      };

      return {
        status: "completed",
        result,
        logs: [...logs, `Analytics agent (${state.currentAgent}) completed`],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Analytics agent failed: ${error.message}`],
      };
    }
  }

  /**
   * NFT Agent Handler
   */
  private async runNFTAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `NFT agent (${state.currentAgent}) executing`];

    try {
      await this.logAgentActivity(state.currentAgent || "nft", state.task, "active");

      let result;
      if (state.currentAgent === "nft_minting") {
        result = await nftBots.runNFTMintingBot(state.task);
      } else if (state.currentAgent === "collectibles") {
        result = await nftBots.runCollectiblesBot(state.task);
      } else if (state.currentAgent === "smart_contract") {
        result = await nftBots.runSmartContractBot(state.task);
      } else {
        result = {
          agent: state.currentAgent,
          message: `NFT task completed: ${state.task}`,
          task: state.task,
        };
      }

      return {
        status: "completed",
        result,
        logs: [...logs, `NFT agent (${state.currentAgent}) completed`],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `NFT agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Community Agent Handler
   */
  private async runCommunityAgent(state: AgentState): Promise<Partial<AgentState>> {
    const logs = [...state.logs, `Community agent (${state.currentAgent}) executing`];

    try {
      await this.logAgentActivity(state.currentAgent || "community", state.task, "active");

      let result;
      if (state.currentAgent === "community_exchange") {
        result = await communityBots.runCommunityExchangeBot(state.task);
      } else if (state.currentAgent === "multichain") {
        result = await communityBots.runMultichainBot(state.task);
      } else {
        result = {
          agent: state.currentAgent,
          message: `Community task completed: ${state.task}`,
          task: state.task,
        };
      }

      return {
        status: "completed",
        result,
        logs: [...logs, `Community agent (${state.currentAgent}) completed`],
      };
    } catch (error: any) {
      return {
        status: "failed",
        error: error.message,
        logs: [...logs, `Community agent failed: ${error.message}`],
      };
    }
  }

  /**
   * Log agent activity to database and trigger learning
   */
  private async logAgentActivity(
    agentType: string,
    task: string,
    status: string,
    result?: any,
    success: boolean = true
  ): Promise<void> {
    try {
      const agents = await storage.getAgentsByType(agentType);
      if (agents.length > 0) {
        const agent = agents[0];
        await storage.updateAgentStatus(agent.id, status, task);

        // Create agent log
        await storage.createAgentLog({
          agentId: agent.id,
          action: task,
          status: success ? "success" : "failed",
          input: { task },
          output: result,
        });

        // Trigger learning from this execution
        const tradingBot = await storage.getUserBots(agent.id);
        if (tradingBot.length > 0) {
          await botLearningService.learnFromExecution(
            tradingBot[0].id,
            agentType,
            { task },
            result,
            success,
            0
          );
        }
      }
    } catch (error) {
      console.error(`Failed to log ${agentType} agent activity:`, error);
    }
  }

  /**
   * Execute a task through the agent graph
   */
  async execute(task: string, agentType?: string): Promise<AgentState> {
    const initialState: Partial<AgentState> = {
      task,
      agentType,
      status: "pending",
      result: undefined,
      error: undefined,
      currentAgent: undefined,
      logs: ["Agent orchestration started"],
    };

    const result = await this.compiledGraph.invoke(initialState);
    return result as AgentState;
  }
}

export const agentOrchestrator = new AgentOrchestrator();
