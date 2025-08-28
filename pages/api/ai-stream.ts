import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

// AI Streaming for real-time bot intelligence
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt, botContext, stream = true } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  try {
    if (stream) {
      // Set up SSE headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Content-Encoding', 'none');

      // Stream AI responses
      await streamAIResponse(prompt, botContext, res);
    } else {
      // Non-streaming response
      const response = await getAIResponse(prompt, botContext);
      res.status(200).json({ response });
    }
  } catch (error) {
    console.error('AI Stream Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
}

async function streamAIResponse(
  prompt: string, 
  botContext: any, 
  res: NextApiResponse
) {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    // Fallback to mock streaming for demo
    return mockStreamResponse(prompt, botContext, res);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages: [{
          role: 'user',
          content: `Bot Context: ${JSON.stringify(botContext)}\n\nQuery: ${prompt}`
        }],
        stream: true,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    // Stream the response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.delta?.text) {
              res.write(`data: ${JSON.stringify({
                type: 'text',
                content: parsed.delta.text
              })}\n\n`);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('Anthropic streaming error:', error);
    return mockStreamResponse(prompt, botContext, res);
  }
}

async function mockStreamResponse(
  prompt: string,
  botContext: any,
  res: NextApiResponse
) {
  // Mock AI response for demo without API key
  const mockResponse = `Based on the bot context ${botContext?.botId || 'UNKNOWN'}, 
  I'm analyzing: "${prompt}". 
  
  Here's my intelligent response:
  1. Market conditions are favorable
  2. Risk assessment: MODERATE
  3. Recommended action: PROCEED with caution
  4. Confidence level: 85%
  
  This is a simulated response. Connect Anthropic API for real intelligence.`;

  // Simulate streaming
  const words = mockResponse.split(' ');
  for (const word of words) {
    res.write(`data: ${JSON.stringify({
      type: 'text',
      content: word + ' '
    })}\n\n`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
}

async function getAIResponse(prompt: string, botContext: any): Promise<string> {
  // Non-streaming version
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    return `Mock response for: ${prompt} (Connect Anthropic API for real responses)`;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      messages: [{
        role: 'user',
        content: `Bot Context: ${JSON.stringify(botContext)}\n\nQuery: ${prompt}`
      }],
      max_tokens: 1000
    })
  });

  const data = await response.json();
  return data.content[0].text;
}