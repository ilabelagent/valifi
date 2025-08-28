// Workflow Agent Implementation using LangGraph
import { StateGraph, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ValifiAgent, AgentConfig } from './agent-config';

// Workflow State
interface WorkflowState {
  input: string;
  currentStep: string;
  results: Record<string, any>;
  finalOutput?: string;
  error?: string;
}

// Step Definition
interface WorkflowStep {
  name: string;
  description: string;
  execute: (state: WorkflowState) => Promise<Partial<WorkflowState>>;
  nextStep?: string | ((state: WorkflowState) => string);
}

export class WorkflowAgent extends ValifiAgent {
  private steps: Map<string, WorkflowStep> = new Map();
  private startStep: string = '';

  constructor(config: AgentConfig) {
    super(config);
  }

  // Add a step to the workflow
  addStep(step: WorkflowStep, isStart: boolean = false) {
    this.steps.set(step.name, step);
    if (isStart) {
      this.startStep = step.name;
    }
  }

  async build() {
    const graph = new StateGraph<WorkflowState>({
      channels: {
        input: {
          value: (x: any, y: any) => y ?? x,
          default: () => '',
        },
        currentStep: {
          value: (x: any, y: any) => y ?? x,
          default: () => this.startStep,
        },
        results: {
          value: (x: any, y: any) => ({ ...x, ...y }),
          default: () => ({}),
        },
        finalOutput: {
          value: (x: any, y: any) => y ?? x,
          default: () => null,
        },
        error: {
          value: (x: any, y: any) => y ?? x,
          default: () => null,
        },
      },
    });

    // Add nodes for each step
    this.steps.forEach((step, name) => {
      graph.addNode(name, async (state: WorkflowState) => {
        try {
          const result = await step.execute(state);
          
          // Store result
          const results = { ...state.results };
          results[name] = result;
          
          // Determine next step
          let nextStep = 'end';
          if (step.nextStep) {
            nextStep = typeof step.nextStep === 'function' 
              ? step.nextStep(state) 
              : step.nextStep;
          }
          
          return {
            ...result,
            results,
            currentStep: nextStep,
          };
        } catch (error: any) {
          return {
            error: `Error in step ${name}: ${error.message}`,
            currentStep: 'error',
          };
        }
      });
    });

    // Add error node
    graph.addNode('error', async (state: WorkflowState) => {
      return {
        finalOutput: `Workflow failed: ${state.error}`,
      };
    });

    // Add edges
    graph.addEdge(START, this.startStep);
    
    // Add conditional edges for each step
    this.steps.forEach((step, name) => {
      graph.addConditionalEdges(name, (state: WorkflowState) => {
        if (state.error) return 'error';
        return state.currentStep || 'end';
      }, {
        ...Object.fromEntries(
          Array.from(this.steps.keys()).map(k => [k, k])
        ),
        'error': 'error',
        'end': END,
      });
    });
    
    graph.addEdge('error', END);

    // Compile
    this.graph = graph;
    this.compiled = graph.compile();
  }

  async execute(input: any) {
    // Convert input to workflow state
    const workflowInput: WorkflowState = {
      input: typeof input === 'string' ? input : JSON.stringify(input),
      currentStep: this.startStep,
      results: {},
    };

    return super.execute(workflowInput);
  }
}

// Pre-configured Trading Workflow
export async function createTradingWorkflow() {
  const workflow = new WorkflowAgent({
    type: 'workflow' as any,
    name: 'TradingWorkflow',
    description: 'Multi-step trading analysis and execution workflow',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
    },
    enableTracing: true,
  });

  // Step 1: Parse user intent
  workflow.addStep({
    name: 'parseIntent',
    description: 'Parse user trading intent',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Extract the trading intent from the user input. Identify: action (buy/sell), symbol, quantity, and any conditions.'),
        new HumanMessage(state.input),
      ]);
      
      return {
        results: { intent: response.content },
        currentStep: 'analyzeMarket',
      };
    },
    nextStep: 'analyzeMarket',
  }, true);

  // Step 2: Analyze market
  workflow.addStep({
    name: 'analyzeMarket',
    description: 'Analyze market conditions',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Analyze current market conditions based on the trading intent.'),
        new HumanMessage(`Intent: ${state.results['parseIntent']?.intent}`),
      ]);
      
      return {
        results: { analysis: response.content },
        currentStep: 'assessRisk',
      };
    },
    nextStep: 'assessRisk',
  });

  // Step 3: Assess risk
  workflow.addStep({
    name: 'assessRisk',
    description: 'Assess trading risk',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Assess the risk of this trade based on market analysis.'),
        new HumanMessage(`Analysis: ${state.results['analyzeMarket']?.analysis}`),
      ]);
      
      return {
        results: { riskAssessment: response.content },
        currentStep: 'generateRecommendation',
      };
    },
    nextStep: 'generateRecommendation',
  });

  // Step 4: Generate recommendation
  workflow.addStep({
    name: 'generateRecommendation',
    description: 'Generate final trading recommendation',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Generate a final trading recommendation based on all analysis.'),
        new HumanMessage(`
          Intent: ${state.results['parseIntent']?.intent}
          Market Analysis: ${state.results['analyzeMarket']?.analysis}
          Risk Assessment: ${state.results['assessRisk']?.riskAssessment}
        `),
      ]);
      
      return {
        finalOutput: response.content,
        currentStep: 'end',
      };
    },
  });

  await workflow.build();
  return workflow;
}

// DeFi Workflow
export async function createDeFiWorkflow() {
  const workflow = new WorkflowAgent({
    type: 'workflow' as any,
    name: 'DeFiWorkflow',
    description: 'DeFi opportunity discovery and execution workflow',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
    },
    enableTracing: true,
  });

  // Step 1: Identify DeFi goals
  workflow.addStep({
    name: 'identifyGoals',
    description: 'Identify user DeFi goals',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Identify the user\'s DeFi goals: yield farming, liquidity provision, lending, borrowing, etc.'),
        new HumanMessage(state.input),
      ]);
      
      return {
        results: { goals: response.content },
        currentStep: 'scanProtocols',
      };
    },
    nextStep: 'scanProtocols',
  }, true);

  // Step 2: Scan DeFi protocols
  workflow.addStep({
    name: 'scanProtocols',
    description: 'Scan available DeFi protocols',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('List relevant DeFi protocols for the user\'s goals with current APYs.'),
        new HumanMessage(`Goals: ${state.results['identifyGoals']?.goals}`),
      ]);
      
      return {
        results: { protocols: response.content },
        currentStep: 'calculateReturns',
      };
    },
    nextStep: 'calculateReturns',
  });

  // Step 3: Calculate potential returns
  workflow.addStep({
    name: 'calculateReturns',
    description: 'Calculate potential returns',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Calculate potential returns for each protocol option.'),
        new HumanMessage(`Protocols: ${state.results['scanProtocols']?.protocols}`),
      ]);
      
      return {
        results: { returns: response.content },
        currentStep: 'assessRisks',
      };
    },
    nextStep: 'assessRisks',
  });

  // Step 4: Assess DeFi risks
  workflow.addStep({
    name: 'assessRisks',
    description: 'Assess DeFi-specific risks',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Assess risks: impermanent loss, smart contract risk, protocol risk, etc.'),
        new HumanMessage(`
          Protocols: ${state.results['scanProtocols']?.protocols}
          Returns: ${state.results['calculateReturns']?.returns}
        `),
      ]);
      
      return {
        results: { risks: response.content },
        currentStep: 'generateStrategy',
      };
    },
    nextStep: 'generateStrategy',
  });

  // Step 5: Generate DeFi strategy
  workflow.addStep({
    name: 'generateStrategy',
    description: 'Generate optimal DeFi strategy',
    execute: async (state) => {
      const llm = workflow['llm'];
      const response = await llm.invoke([
        new SystemMessage('Generate an optimal DeFi strategy with specific recommendations.'),
        new HumanMessage(`
          Goals: ${state.results['identifyGoals']?.goals}
          Protocols: ${state.results['scanProtocols']?.protocols}
          Returns: ${state.results['calculateReturns']?.returns}
          Risks: ${state.results['assessRisks']?.risks}
        `),
      ]);
      
      return {
        finalOutput: response.content,
        currentStep: 'end',
      };
    },
  });

  await workflow.build();
  return workflow;
}