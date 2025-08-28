// ReAct Agent Implementation using LangGraph
import { StateGraph, MessagesState, END, START } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { ValifiAgent, AgentConfig, allFinancialTools } from './agent-config';

// ReAct Agent State
interface ReActState extends MessagesState {
  messages: any[];
  nextAction?: string;
  observations?: any[];
  finalAnswer?: string;
  iterations: number;
}

export class ReActAgent extends ValifiAgent {
  private tools: Map<string, any> = new Map();
  private maxIterations: number = 5;

  constructor(config: AgentConfig) {
    super(config);
    this.maxIterations = config.maxIterations || 5;
    
    // Register tools
    if (config.tools) {
      config.tools.forEach(tool => {
        this.tools.set(tool.name, tool);
      });
    }
  }

  async build() {
    const graph = new StateGraph<ReActState>({
      channels: {
        messages: {
          value: (x: any[], y: any[]) => [...x, ...y],
          default: () => [],
        },
        nextAction: {
          value: (x: any, y: any) => y ?? x,
          default: () => null,
        },
        observations: {
          value: (x: any[], y: any[]) => [...(x || []), ...(y || [])],
          default: () => [],
        },
        finalAnswer: {
          value: (x: any, y: any) => y ?? x,
          default: () => null,
        },
        iterations: {
          value: (x: number, y: number) => y ?? x,
          default: () => 0,
        },
      },
    });

    // Bind tools to LLM
    const toolsArray = Array.from(this.tools.values());
    const llmWithTools = this.llm.bindTools(toolsArray);

    // Define nodes
    graph.addNode('think', async (state: ReActState) => {
      // Check iteration limit
      if (state.iterations >= this.maxIterations) {
        return {
          finalAnswer: 'Maximum iterations reached. Please try a more specific query.',
          nextAction: 'end',
        };
      }

      // Add system prompt if first iteration
      const messages = [...state.messages];
      if (state.iterations === 0 && this.config.systemPrompt) {
        messages.unshift(new SystemMessage(this.config.systemPrompt));
      }

      // Call LLM to think about next action
      const response = await llmWithTools.invoke(messages);
      
      // Check if LLM wants to use a tool
      if (response.tool_calls && response.tool_calls.length > 0) {
        return {
          messages: [response],
          nextAction: 'act',
          iterations: state.iterations + 1,
        };
      } else {
        // LLM provided final answer
        return {
          messages: [response],
          finalAnswer: response.content,
          nextAction: 'end',
          iterations: state.iterations + 1,
        };
      }
    });

    graph.addNode('act', async (state: ReActState) => {
      const lastMessage = state.messages[state.messages.length - 1];
      
      if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
        return { nextAction: 'think' };
      }

      const toolResults = [];
      
      // Execute each tool call
      for (const toolCall of lastMessage.tool_calls) {
        const tool = this.tools.get(toolCall.name);
        
        if (tool) {
          try {
            const result = await tool.invoke(toolCall.args);
            toolResults.push(
              new ToolMessage({
                content: JSON.stringify(result),
                tool_call_id: toolCall.id,
              })
            );
          } catch (error: any) {
            toolResults.push(
              new ToolMessage({
                content: `Error executing tool: ${error.message}`,
                tool_call_id: toolCall.id,
              })
            );
          }
        } else {
          toolResults.push(
            new ToolMessage({
              content: `Tool not found: ${toolCall.name}`,
              tool_call_id: toolCall.id,
            })
          );
        }
      }

      return {
        messages: toolResults,
        observations: toolResults,
        nextAction: 'observe',
      };
    });

    graph.addNode('observe', async (state: ReActState) => {
      // Process observations and decide next action
      return { nextAction: 'think' };
    });

    // Define edges
    graph.addEdge(START, 'think');
    
    graph.addConditionalEdges('think', (state: ReActState) => {
      return state.nextAction || 'end';
    }, {
      'act': 'act',
      'end': END,
    });
    
    graph.addEdge('act', 'observe');
    graph.addEdge('observe', 'think');

    // Compile graph
    this.graph = graph;
    this.compiled = graph.compile();
  }

  async execute(input: any) {
    // Ensure input has messages
    if (typeof input === 'string') {
      input = { messages: [new HumanMessage(input)] };
    } else if (!input.messages) {
      input = { messages: [new HumanMessage(JSON.stringify(input))] };
    }

    // Add initial state
    input.iterations = 0;

    return super.execute(input);
  }

  async stream(input: any) {
    // Ensure input has messages
    if (typeof input === 'string') {
      input = { messages: [new HumanMessage(input)] };
    } else if (!input.messages) {
      input = { messages: [new HumanMessage(JSON.stringify(input))] };
    }

    // Add initial state
    input.iterations = 0;

    const stream = await this.compiled.stream(input, {
      streamMode: 'values',
    });

    return stream;
  }
}

// Example usage function
export async function createReActTradingAgent() {
  const agent = new ReActAgent({
    type: 'react' as any,
    name: 'ReActTradingAgent',
    description: 'ReAct agent for trading decisions',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
    },
    tools: allFinancialTools,
    systemPrompt: `You are an expert trading assistant using the ReAct framework.
    
For each user query:
1. THINK about what information you need
2. ACT by using appropriate tools
3. OBSERVE the results
4. REPEAT if more information is needed
5. Provide a final answer based on your observations

Available tools: ${allFinancialTools.map(t => t.name).join(', ')}`,
    maxIterations: 5,
    enableTracing: true,
  });

  await agent.build();
  return agent;
}