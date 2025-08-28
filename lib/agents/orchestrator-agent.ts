// Orchestrator Agent Implementation using LangGraph
import { StateGraph, END, START, Send } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ValifiAgent, AgentConfig } from './agent-config';
import { z } from 'zod';

// Worker Task Schema
const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dependencies: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

type Task = z.infer<typeof TaskSchema>;

// Orchestrator State
interface OrchestratorState {
  objective: string;
  tasks: Task[];
  completedTasks: Record<string, any>;
  currentTask?: string;
  finalReport?: string;
  error?: string;
}

// Worker State
interface WorkerState {
  task: Task;
  context: Record<string, any>;
  result?: any;
}

export class OrchestratorAgent extends ValifiAgent {
  private workers: Map<string, (task: Task) => Promise<any>> = new Map();

  constructor(config: AgentConfig) {
    super(config);
    this.registerDefaultWorkers();
  }

  // Register default worker types
  private registerDefaultWorkers() {
    // Analysis worker
    this.workers.set('analysis', async (task: Task) => {
      const response = await this.llm.invoke([
        new SystemMessage('You are an analysis worker. Analyze the given task.'),
        new HumanMessage(`Task: ${task.description}`),
      ]);
      return response.content;
    });

    // Research worker
    this.workers.set('research', async (task: Task) => {
      const response = await this.llm.invoke([
        new SystemMessage('You are a research worker. Research the given topic.'),
        new HumanMessage(`Task: ${task.description}`),
      ]);
      return response.content;
    });

    // Calculation worker
    this.workers.set('calculation', async (task: Task) => {
      const response = await this.llm.invoke([
        new SystemMessage('You are a calculation worker. Perform calculations.'),
        new HumanMessage(`Task: ${task.description}`),
      ]);
      return response.content;
    });

    // Summary worker
    this.workers.set('summary', async (task: Task) => {
      const response = await this.llm.invoke([
        new SystemMessage('You are a summary worker. Summarize the information.'),
        new HumanMessage(`Task: ${task.description}`),
      ]);
      return response.content;
    });
  }

  // Register custom worker
  registerWorker(type: string, worker: (task: Task) => Promise<any>) {
    this.workers.set(type, worker);
  }

  async build() {
    const graph = new StateGraph<OrchestratorState>({
      channels: {
        objective: {
          value: (x: any, y: any) => y ?? x,
          default: () => '',
        },
        tasks: {
          value: (x: any, y: any) => y ?? x,
          default: () => [],
        },
        completedTasks: {
          value: (x: any, y: any) => ({ ...x, ...y }),
          default: () => ({}),
        },
        currentTask: {
          value: (x: any, y: any) => y ?? x,
          default: () => null,
        },
        finalReport: {
          value: (x: any, y: any) => y ?? x,
          default: () => null,
        },
        error: {
          value: (x: any, y: any) => y ?? x,
          default: () => null,
        },
      },
    });

    // Planning node
    graph.addNode('plan', async (state: OrchestratorState) => {
      const response = await this.llm.invoke([
        new SystemMessage(`You are an orchestrator. Break down the objective into specific tasks.
        Return a JSON array of tasks with: id, name, description, dependencies (optional), priority (optional).
        Available worker types: ${Array.from(this.workers.keys()).join(', ')}`),
        new HumanMessage(`Objective: ${state.objective}`),
      ]);

      try {
        // Parse tasks from response
        const content = response.content.toString();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const tasks = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        
        return { tasks };
      } catch (error) {
        return {
          error: `Failed to parse tasks: ${error}`,
          tasks: [],
        };
      }
    });

    // Task assignment node
    graph.addNode('assign', async (state: OrchestratorState) => {
      // Find next task to execute (considering dependencies)
      const availableTasks = state.tasks.filter(task => {
        // Check if dependencies are completed
        if (task.dependencies && task.dependencies.length > 0) {
          return task.dependencies.every(dep => dep in state.completedTasks);
        }
        // Check if not already completed
        return !(task.id in state.completedTasks);
      });

      if (availableTasks.length === 0) {
        return { currentTask: 'synthesize' };
      }

      // Sort by priority
      availableTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        return bPriority - aPriority;
      });

      // Return workers to execute in parallel
      return availableTasks.map(task => 
        Send('worker', { 
          task, 
          context: state.completedTasks 
        } as WorkerState)
      );
    });

    // Worker node
    graph.addNode('worker', async (state: WorkerState) => {
      const workerType = state.task.name.toLowerCase();
      const worker = this.workers.get(workerType) || this.workers.get('analysis');
      
      try {
        const result = await worker!(state.task);
        return {
          completedTasks: { [state.task.id]: result },
        };
      } catch (error: any) {
        return {
          completedTasks: { [state.task.id]: `Error: ${error.message}` },
        };
      }
    });

    // Synthesis node
    graph.addNode('synthesize', async (state: OrchestratorState) => {
      const response = await this.llm.invoke([
        new SystemMessage('Synthesize all task results into a comprehensive final report.'),
        new HumanMessage(`
          Objective: ${state.objective}
          Tasks Completed: ${JSON.stringify(state.tasks, null, 2)}
          Results: ${JSON.stringify(state.completedTasks, null, 2)}
        `),
      ]);

      return {
        finalReport: response.content,
      };
    });

    // Define edges
    graph.addEdge(START, 'plan');
    graph.addEdge('plan', 'assign');
    
    graph.addConditionalEdges('assign', (state: OrchestratorState) => {
      if (state.currentTask === 'synthesize') {
        return 'synthesize';
      }
      return 'worker';
    }, {
      'worker': 'worker',
      'synthesize': 'synthesize',
    });

    graph.addEdge('worker', 'assign');
    graph.addEdge('synthesize', END);

    // Compile
    this.graph = graph;
    this.compiled = graph.compile();
  }

  async execute(input: any) {
    const orchestratorInput: OrchestratorState = {
      objective: typeof input === 'string' ? input : input.objective || JSON.stringify(input),
      tasks: [],
      completedTasks: {},
    };

    return super.execute(orchestratorInput);
  }
}

// Create Investment Research Orchestrator
export async function createInvestmentOrchestrator() {
  const orchestrator = new OrchestratorAgent({
    type: 'orchestrator' as any,
    name: 'InvestmentOrchestrator',
    description: 'Orchestrates complex investment research and analysis',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
    },
    enableTracing: true,
  });

  // Register specialized workers
  orchestrator.registerWorker('fundamental_analysis', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Perform fundamental analysis on the given company or asset.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  orchestrator.registerWorker('technical_analysis', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Perform technical analysis including price patterns and indicators.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  orchestrator.registerWorker('sentiment_analysis', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Analyze market sentiment and news sentiment.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  orchestrator.registerWorker('risk_assessment', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Assess investment risks and provide risk metrics.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  await orchestrator.build();
  return orchestrator;
}

// Create Portfolio Optimization Orchestrator
export async function createPortfolioOrchestrator() {
  const orchestrator = new OrchestratorAgent({
    type: 'orchestrator' as any,
    name: 'PortfolioOrchestrator',
    description: 'Orchestrates portfolio optimization and rebalancing',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
    },
    enableTracing: true,
  });

  // Register portfolio-specific workers
  orchestrator.registerWorker('asset_allocation', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Determine optimal asset allocation based on risk profile.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  orchestrator.registerWorker('correlation_analysis', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Analyze asset correlations for diversification.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  orchestrator.registerWorker('rebalancing', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Calculate rebalancing trades to achieve target allocation.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  orchestrator.registerWorker('performance_attribution', async (task) => {
    const llm = orchestrator['llm'];
    const response = await llm.invoke([
      new SystemMessage('Analyze portfolio performance attribution.'),
      new HumanMessage(task.description),
    ]);
    return response.content;
  });

  await orchestrator.build();
  return orchestrator;
}