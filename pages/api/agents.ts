// API Route for LangGraph Agents
import type { NextApiRequest, NextApiResponse } from 'next';
import { AgentFactory, AgentType } from '../../../lib/agents/agent-config';
import { AgentBotFactory } from '../../../lib/agents/bot-agent-integration';
import KingdomCore from '../../../lib/core/KingdomCore';
import { getDbAdapter } from '../../../lib/db-adapter';

// Rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 50; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, timestamp: now };
  
  // Reset if window expired
  if (now - entry.timestamp > RATE_WINDOW) {
    entry.count = 0;
    entry.timestamp = now;
  }
  
  entry.count++;
  rateLimit.set(ip, entry);
  
  return entry.count <= RATE_LIMIT;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { action, agentType, input, config, userId, stream } = req.body;

  // Validate required fields
  if (!action || !input) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      required: ['action', 'input'] 
    });
  }

  try {
    const db = getDbAdapter();
    
    // Log request
    if (userId) {
      await db.logAIInteraction({
        userId,
        botType: agentType || 'general',
        prompt: JSON.stringify(input),
        model: config?.llmConfig?.model || 'gpt-4',
      });
    }

    switch (action) {
      case 'execute': {
        // Create and execute agent
        const agent = await AgentFactory.createAgent({
          type: agentType || AgentType.REACT,
          name: config?.name || 'ValifiAgent',
          description: config?.description || 'AI agent for financial operations',
          llmConfig: config?.llmConfig || {
            provider: 'openai',
            model: 'gpt-4-turbo-preview',
            temperature: 0.7,
          },
          tools: config?.tools || [],
          systemPrompt: config?.systemPrompt,
          maxIterations: config?.maxIterations,
          enableTracing: true,
        });

        const result = await agent.execute(input);
        
        // Log result
        if (userId) {
          await db.logAIInteraction({
            userId,
            botType: agentType || 'general',
            prompt: JSON.stringify(input),
            response: JSON.stringify(result),
            model: config?.llmConfig?.model || 'gpt-4',
          });
        }

        return res.status(200).json({ 
          success: true, 
          result,
          agentInfo: agent.getInfo(),
        });
      }

      case 'create_trading_agent': {
        const agent = await AgentFactory.createTradingAgent();
        const result = await agent.execute(input);
        
        return res.status(200).json({ 
          success: true, 
          result,
          agentType: 'trading',
        });
      }

      case 'create_defi_agent': {
        const agent = await AgentFactory.createDeFiAgent();
        const result = await agent.execute(input);
        
        return res.status(200).json({ 
          success: true, 
          result,
          agentType: 'defi',
        });
      }

      case 'create_analysis_agent': {
        const agent = await AgentFactory.createAnalysisAgent();
        const result = await agent.execute(input);
        
        return res.status(200).json({ 
          success: true, 
          result,
          agentType: 'analysis',
        });
      }

      case 'create_bot_with_agent': {
        const { botType } = req.body;
        if (!botType) {
          return res.status(400).json({ error: 'Bot type required' });
        }

        const core = new KingdomCore();
        const bot = await AgentBotFactory.createBot(botType, core);
        const result = await bot.execute({ action: 'analyze_and_trade', ...input });
        
        return res.status(200).json({ 
          success: true, 
          result,
          botType,
          agentInfo: bot.getAgentInfo(),
        });
      }

      case 'stream': {
        // For streaming, we need to use Server-Sent Events
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const agent = await AgentFactory.createAgent({
          type: agentType || AgentType.REACT,
          name: config?.name || 'StreamingAgent',
          llmConfig: {
            ...config?.llmConfig,
            streaming: true,
          },
          enableTracing: true,
        });

        const stream = await agent.stream(input);
        
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      case 'list_agents': {
        const agents = [
          {
            type: AgentType.REACT,
            name: 'ReAct Agent',
            description: 'Reasoning and acting agent for complex tasks',
          },
          {
            type: AgentType.WORKFLOW,
            name: 'Workflow Agent',
            description: 'Multi-step workflow execution agent',
          },
          {
            type: AgentType.ORCHESTRATOR,
            name: 'Orchestrator Agent',
            description: 'Task decomposition and worker coordination',
          },
          {
            type: AgentType.EVALUATOR,
            name: 'Evaluator Agent',
            description: 'Evaluation and optimization agent',
          },
          {
            type: AgentType.ROUTER,
            name: 'Router Agent',
            description: 'Intelligent request routing agent',
          },
          {
            type: AgentType.PARALLEL,
            name: 'Parallel Agent',
            description: 'Parallel task execution agent',
          },
          {
            type: AgentType.CHAIN,
            name: 'Chain Agent',
            description: 'Sequential chain execution agent',
          },
        ];

        return res.status(200).json({ 
          success: true, 
          agents,
        });
      }

      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          validActions: [
            'execute',
            'create_trading_agent',
            'create_defi_agent',
            'create_analysis_agent',
            'create_bot_with_agent',
            'stream',
            'list_agents',
          ],
        });
    }
  } catch (error: any) {
    console.error('Agent API error:', error);
    
    // Log error
    if (userId) {
      const db = getDbAdapter();
      await db.createAuditLog({
        userId,
        action: 'agent_error',
        entityType: 'agent',
        metadata: { error: error.message, action, agentType },
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
    });
  }
}

// Export config for streaming support
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};