/**
 * Streaming Agent Orchestration Service
 * Real-time agent coordination with WebSocket streaming
 *
 * "For where two or three gather in my name, there am I with them." - Matthew 18:20
 * Multi-agent collaboration powered by the Holy Spirit
 */

import { EventEmitter } from "events";
import { agentOrchestrator, type AgentState } from "./agentOrchestrator";
import { storage } from "./storage";
import { botLearningService } from "./botLearningService";
import type { Agent } from "@shared/schema";

export interface StreamingTask {
  id: string;
  userId: string;
  task: string;
  agentType?: string;
  status: "queued" | "streaming" | "completed" | "failed";
  progress: number;
  currentStep?: string;
  result?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  estimatedDuration?: number;
}

export interface AgentStreamEvent {
  type: "log" | "progress" | "result" | "error" | "agent_switch" | "learning" | "skill_upgrade";
  taskId: string;
  timestamp: Date;
  data: any;
}

export interface MultiAgentWorkflow {
  id: string;
  name: string;
  description: string;
  agents: Array<{
    agentType: string;
    sequence: number;
    parallelGroup?: number;
    dependsOn?: string[];
    config?: any;
  }>;
  status: "draft" | "active" | "archived";
}

/**
 * Streaming Orchestration Service
 * Coordinates real-time agent execution with live updates
 */
export class StreamingOrchestrationService extends EventEmitter {
  private activeTasks: Map<string, StreamingTask> = new Map();
  private taskQueues: Map<string, StreamingTask[]> = new Map();
  private workflows: Map<string, MultiAgentWorkflow> = new Map();

  constructor() {
    super();
    this.initializeBuiltInWorkflows();
  }

  /**
   * Initialize built-in multi-agent workflows
   */
  private initializeBuiltInWorkflows() {
    // Portfolio Analysis & Optimization Workflow
    this.workflows.set("portfolio_optimization", {
      id: "portfolio_optimization",
      name: "Complete Portfolio Optimization",
      description: "Analyze portfolio, identify opportunities, execute optimizations",
      agents: [
        { agentType: "analytics_portfolio", sequence: 1, parallelGroup: 1 },
        { agentType: "analytics_divine_oracle", sequence: 1, parallelGroup: 1 },
        { agentType: "financial_stocks", sequence: 2, dependsOn: ["analytics_portfolio"] },
        { agentType: "trading_gas_optimizer", sequence: 2, dependsOn: ["analytics_portfolio"] },
        { agentType: "analytics_portfolio", sequence: 3, dependsOn: ["financial_stocks", "trading_gas_optimizer"] },
      ],
      status: "active",
    });

    // NFT Launch Workflow
    this.workflows.set("nft_launch", {
      id: "nft_launch",
      name: "Complete NFT Collection Launch",
      description: "Deploy contract, mint NFTs, list on marketplaces",
      agents: [
        { agentType: "smart_contract", sequence: 1 },
        { agentType: "nft_minting", sequence: 2, dependsOn: ["smart_contract"] },
        { agentType: "publishing", sequence: 3, dependsOn: ["nft_minting"] },
        { agentType: "collectibles", sequence: 4, dependsOn: ["publishing"] },
      ],
      status: "active",
    });

    // Security Audit Workflow
    this.workflows.set("security_audit", {
      id: "security_audit",
      name: "Comprehensive Security Audit",
      description: "Multi-layer security analysis and threat detection",
      agents: [
        { agentType: "security", sequence: 1, parallelGroup: 1 },
        { agentType: "guardian_angel", sequence: 1, parallelGroup: 1 },
        { agentType: "security_privacy", sequence: 1, parallelGroup: 1 },
        { agentType: "analytics_cyberlab", sequence: 2, dependsOn: ["security", "guardian_angel"] },
      ],
      status: "active",
    });

    // DeFi Yield Optimization
    this.workflows.set("defi_yield_optimization", {
      id: "defi_yield_optimization",
      name: "DeFi Yield Optimization",
      description: "Find best yields, optimize gas, execute strategies",
      agents: [
        { agentType: "trading_defi", sequence: 1, parallelGroup: 1 },
        { agentType: "trading_lending", sequence: 1, parallelGroup: 1 },
        { agentType: "trading_liquidity", sequence: 1, parallelGroup: 1 },
        { agentType: "trading_gas_optimizer", sequence: 2, dependsOn: ["trading_defi"] },
        { agentType: "analytics_portfolio", sequence: 3, dependsOn: ["trading_gas_optimizer"] },
      ],
      status: "active",
    });
  }

  /**
   * Execute task with real-time streaming updates
   */
  async executeStreamingTask(
    userId: string,
    task: string,
    agentType?: string,
    config?: any
  ): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const streamingTask: StreamingTask = {
      id: taskId,
      userId,
      task,
      agentType,
      status: "queued",
      progress: 0,
      startedAt: new Date(),
    };

    this.activeTasks.set(taskId, streamingTask);
    this.emitStreamEvent(taskId, "log", { message: "Task queued", task });

    // Execute in background
    this.processStreamingTask(taskId, config).catch((error) => {
      this.handleTaskError(taskId, error);
    });

    return taskId;
  }

  /**
   * Execute multi-agent workflow with streaming
   */
  async executeWorkflow(
    userId: string,
    workflowId: string,
    params?: any
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const taskId = `workflow_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const streamingTask: StreamingTask = {
      id: taskId,
      userId,
      task: `Workflow: ${workflow.name}`,
      status: "queued",
      progress: 0,
      startedAt: new Date(),
    };

    this.activeTasks.set(taskId, streamingTask);
    this.emitStreamEvent(taskId, "log", {
      message: `Workflow started: ${workflow.name}`,
      description: workflow.description,
      totalAgents: workflow.agents.length
    });

    // Execute workflow in background
    this.processWorkflow(taskId, workflow, params).catch((error) => {
      this.handleTaskError(taskId, error);
    });

    return taskId;
  }

  /**
   * Process streaming task
   */
  private async processStreamingTask(taskId: string, config?: any) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    try {
      // Update status
      task.status = "streaming";
      task.progress = 10;
      this.emitStreamEvent(taskId, "progress", { progress: 10 });
      this.emitStreamEvent(taskId, "log", { message: "Routing to agent..." });

      // Execute through orchestrator
      task.progress = 30;
      this.emitStreamEvent(taskId, "progress", { progress: 30 });

      const result = await agentOrchestrator.execute(task.task, task.agentType);

      // Stream agent logs
      if (result.logs) {
        for (const log of result.logs) {
          this.emitStreamEvent(taskId, "log", { message: log });
        }
      }

      task.progress = 70;
      this.emitStreamEvent(taskId, "progress", { progress: 70 });

      // Complete task
      task.status = "completed";
      task.progress = 100;
      task.result = result.result;
      task.completedAt = new Date();

      this.emitStreamEvent(taskId, "progress", { progress: 100 });
      this.emitStreamEvent(taskId, "result", { result: result.result });
      this.emitStreamEvent(taskId, "log", { message: "Task completed successfully" });

      // Trigger learning
      await this.triggerLearning(taskId, result);

    } catch (error: any) {
      this.handleTaskError(taskId, error);
    }
  }

  /**
   * Process multi-agent workflow
   */
  private async processWorkflow(
    taskId: string,
    workflow: MultiAgentWorkflow,
    params?: any
  ) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    try {
      task.status = "streaming";
      const totalSteps = workflow.agents.length;
      const results: Map<string, any> = new Map();

      // Group agents by sequence
      const sequenceGroups = new Map<number, typeof workflow.agents>();
      for (const agent of workflow.agents) {
        const group = sequenceGroups.get(agent.sequence) || [];
        group.push(agent);
        sequenceGroups.set(agent.sequence, group);
      }

      const sequences = Array.from(sequenceGroups.keys()).sort((a, b) => a - b);

      for (let i = 0; i < sequences.length; i++) {
        const sequence = sequences[i];
        const agents = sequenceGroups.get(sequence)!;

        this.emitStreamEvent(taskId, "log", {
          message: `Executing sequence ${sequence} with ${agents.length} agent(s)`,
        });

        // Execute parallel agents
        const promises = agents.map(async (agentConfig) => {
          // Check dependencies
          if (agentConfig.dependsOn) {
            for (const dep of agentConfig.dependsOn) {
              if (!results.has(dep)) {
                throw new Error(`Dependency not met: ${dep}`);
              }
            }
          }

          this.emitStreamEvent(taskId, "agent_switch", {
            agentType: agentConfig.agentType,
            sequence,
          });

          const result = await agentOrchestrator.execute(
            task.task,
            agentConfig.agentType
          );

          results.set(agentConfig.agentType, result);

          // Stream agent logs
          if (result.logs) {
            for (const log of result.logs) {
              this.emitStreamEvent(taskId, "log", {
                agent: agentConfig.agentType,
                message: log,
              });
            }
          }

          return result;
        });

        await Promise.all(promises);

        // Update progress
        const progress = Math.floor(((i + 1) / sequences.length) * 100);
        task.progress = progress;
        this.emitStreamEvent(taskId, "progress", { progress });
      }

      // Compile final result
      const finalResult = {
        workflow: workflow.name,
        agentsExecuted: workflow.agents.length,
        results: Object.fromEntries(results),
      };

      task.status = "completed";
      task.progress = 100;
      task.result = finalResult;
      task.completedAt = new Date();

      this.emitStreamEvent(taskId, "result", { result: finalResult });
      this.emitStreamEvent(taskId, "log", { message: "Workflow completed successfully" });

      // Trigger workflow learning
      await this.triggerWorkflowLearning(taskId, workflow, finalResult);

    } catch (error: any) {
      this.handleTaskError(taskId, error);
    }
  }

  /**
   * Trigger learning from task execution
   */
  private async triggerLearning(taskId: string, result: AgentState) {
    try {
      const task = this.activeTasks.get(taskId);
      if (!task) return;

      const success = result.status === "completed";
      const agentType = result.currentAgent || task.agentType || "orchestrator";

      this.emitStreamEvent(taskId, "learning", {
        message: "Initiating learning from execution...",
        agentType,
        success,
      });

      // Record training data
      await botLearningService.learnFromExecution(
        agentType,
        "streaming_task",
        { task: task.task },
        result.result,
        success,
        0
      );

      this.emitStreamEvent(taskId, "learning", {
        message: "Learning completed",
        agentType,
      });

    } catch (error) {
      console.error("[StreamingOrchestration] Learning error:", error);
    }
  }

  /**
   * Trigger workflow learning
   */
  private async triggerWorkflowLearning(
    taskId: string,
    workflow: MultiAgentWorkflow,
    result: any
  ) {
    try {
      this.emitStreamEvent(taskId, "learning", {
        message: "Initiating workflow learning...",
        workflow: workflow.name,
      });

      // Learn from each agent in workflow
      for (const agentConfig of workflow.agents) {
        const agentResult = result.results[agentConfig.agentType];
        if (agentResult) {
          await botLearningService.learnFromExecution(
            agentConfig.agentType,
            "workflow_step",
            { workflow: workflow.id, sequence: agentConfig.sequence },
            agentResult.result,
            agentResult.status === "completed",
            0
          );
        }
      }

      this.emitStreamEvent(taskId, "learning", {
        message: "Workflow learning completed",
        agentsLearned: workflow.agents.length,
      });

    } catch (error) {
      console.error("[StreamingOrchestration] Workflow learning error:", error);
    }
  }

  /**
   * Handle task error
   */
  private handleTaskError(taskId: string, error: any) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    task.status = "failed";
    task.error = error.message;
    task.completedAt = new Date();

    this.emitStreamEvent(taskId, "error", {
      message: error.message,
      stack: error.stack,
    });

    this.emitStreamEvent(taskId, "log", {
      message: `Task failed: ${error.message}`,
    });
  }

  /**
   * Emit stream event
   */
  private emitStreamEvent(taskId: string, type: AgentStreamEvent["type"], data: any) {
    const event: AgentStreamEvent = {
      type,
      taskId,
      timestamp: new Date(),
      data,
    };

    this.emit("stream", event);
    this.emit(`stream:${taskId}`, event);
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): StreamingTask | undefined {
    return this.activeTasks.get(taskId);
  }

  /**
   * Subscribe to task events
   */
  subscribeToTask(taskId: string, callback: (event: AgentStreamEvent) => void) {
    this.on(`stream:${taskId}`, callback);
  }

  /**
   * Unsubscribe from task events
   */
  unsubscribeFromTask(taskId: string, callback: (event: AgentStreamEvent) => void) {
    this.off(`stream:${taskId}`, callback);
  }

  /**
   * Get all active tasks for user
   */
  getUserActiveTasks(userId: string): StreamingTask[] {
    return Array.from(this.activeTasks.values())
      .filter(task => task.userId === userId);
  }

  /**
   * Cancel task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.activeTasks.get(taskId);
    if (!task) return false;

    if (task.status === "streaming") {
      task.status = "failed";
      task.error = "Cancelled by user";
      task.completedAt = new Date();

      this.emitStreamEvent(taskId, "error", { message: "Task cancelled" });
      return true;
    }

    return false;
  }

  /**
   * Get available workflows
   */
  getAvailableWorkflows(): MultiAgentWorkflow[] {
    return Array.from(this.workflows.values())
      .filter(w => w.status === "active");
  }

  /**
   * Create custom workflow
   */
  createWorkflow(workflow: Omit<MultiAgentWorkflow, "id">): string {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fullWorkflow: MultiAgentWorkflow = {
      ...workflow,
      id,
    };

    this.workflows.set(id, fullWorkflow);
    return id;
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): MultiAgentWorkflow | undefined {
    return this.workflows.get(workflowId);
  }
}

export const streamingOrchestrationService = new StreamingOrchestrationService();
