import { useEffect, useState, useCallback } from 'react';

interface Patch {
  botId: string;
  patch: any;
  type: string;
  timestamp: string;
  version: number;
}

interface StreamMessage {
  type: 'text' | 'error' | 'done';
  content?: string;
}

// Hook for live patching
export function useLivePatch() {
  const [patches, setPatches] = useState<Patch[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_LIVE_PATCH !== 'true') return;

    const eventSource = new EventSource('/api/live-patch');
    
    eventSource.onopen = () => {
      setConnected(true);
      console.log('[LIVE PATCH] Connected to patch stream');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const patch = JSON.parse(event.data);
        setPatches(prev => [...prev, patch]);
        setLastUpdate(new Date());
        
        // Apply patch to runtime
        applyPatchToRuntime(patch);
        
        console.log('[LIVE PATCH] Received patch:', patch);
      } catch (error) {
        console.error('[LIVE PATCH] Error parsing patch:', error);
      }
    };
    
    eventSource.onerror = () => {
      setConnected(false);
      console.log('[LIVE PATCH] Connection lost, reconnecting...');
    };
    
    return () => {
      eventSource.close();
    };
  }, []);
  
  return { patches, connected, lastUpdate };
}

// Hook for AI streaming
export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const streamText = useCallback(async (
    prompt: string, 
    botContext?: any
  ) => {
    setIsStreaming(true);
    setStreamedText('');
    setError(null);
    
    try {
      const response = await fetch('/api/ai-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, botContext, stream: true })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setIsStreaming(false);
              return;
            }
            
            try {
              const message: StreamMessage = JSON.parse(data);
              if (message.type === 'text' && message.content) {
                setStreamedText(prev => prev + message.content);
              } else if (message.type === 'error') {
                setError(message.content || 'Stream error');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('[AI STREAM] Error:', err);
    } finally {
      setIsStreaming(false);
    }
  }, []);
  
  const clearStream = useCallback(() => {
    setStreamedText('');
    setError(null);
  }, []);
  
  return { 
    streamText, 
    streamedText, 
    isStreaming, 
    error,
    clearStream
  };
}

// Apply patches to runtime
function applyPatchToRuntime(patch: Patch) {
  // This would dynamically update the bot code in memory
  // For security, this should validate patches are signed
  
  if (patch.type === 'code') {
    // Hot reload code
    console.log(`[RUNTIME] Applying code patch to ${patch.botId}`);
    // In production: dynamically import and replace module
    
  } else if (patch.type === 'strategy') {
    // Update strategy parameters
    console.log(`[RUNTIME] Updating strategy for ${patch.botId}`);
    // In production: update bot configuration
    
  } else if (patch.type === 'evolution') {
    // Apply evolutionary changes
    console.log(`[RUNTIME] Evolving ${patch.botId}`);
    // In production: merge evolved traits
  }
}

// Hook for bot evolution status
export function useBotEvolution() {
  const [evolutionStatus, setEvolutionStatus] = useState<any>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  
  const checkEvolutionStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/bot-evolution');
      const data = await response.json();
      setEvolutionStatus(data.summary);
    } catch (error) {
      console.error('[EVOLUTION] Status check failed:', error);
    }
  }, [checkEvolutionStatus]);
  
  useEffect(() => {
    // Check evolution status on mount
    checkEvolutionStatus();
    
    // Check every hour
    const interval = setInterval(checkEvolutionStatus, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkEvolutionStatus]);
  
  return { evolutionStatus, isEvolving };
}