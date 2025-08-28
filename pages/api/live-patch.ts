import type { NextApiRequest, NextApiResponse } from 'next';

// Live patching system for bot updates
const patches: Map<string, any> = new Map();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS for live updates
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH');
  
  if (req.method === 'GET') {
    // Stream patches to client using Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send heartbeat
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);
    
    // Send patches as they come
    const sendPatch = (patch: any) => {
      res.write(`data: ${JSON.stringify(patch)}\n\n`);
    };
    
    // Check for new patches every second
    const patchChecker = setInterval(() => {
      const pendingPatches = Array.from(patches.values());
      if (pendingPatches.length > 0) {
        pendingPatches.forEach(patch => {
          sendPatch(patch);
        });
        patches.clear();
      }
    }, 1000);
    
    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(patchChecker);
      res.end();
    });
    
  } else if (req.method === 'POST') {
    // Receive new patch from GitHub webhook or admin
    const { botId, patch, type } = req.body;
    
    if (!botId || !patch) {
      return res.status(400).json({ error: 'Missing botId or patch' });
    }
    
    // Store patch for distribution
    patches.set(botId, {
      botId,
      patch,
      type: type || 'code',
      timestamp: new Date().toISOString(),
      version: Date.now()
    });
    
    // Log the patch
    console.log(`[LIVE PATCH] Bot ${botId} patched with:`, patch);
    
    res.status(200).json({ 
      success: true, 
      message: `Patch applied to ${botId}`,
      version: patches.get(botId).version
    });
    
  } else if (req.method === 'PATCH') {
    // Apply patch to running bot
    const { botId, code, strategy } = req.body;
    
    try {
      // Dynamically update bot code
      const updateResult = await applyPatchToBot(botId, { code, strategy });
      
      res.status(200).json({
        success: true,
        botId,
        result: updateResult
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

async function applyPatchToBot(botId: string, patch: any) {
  // This would connect to your bot registry and hot-reload the code
  // For demo, we'll simulate it
  return {
    status: 'applied',
    botId,
    patchType: patch.code ? 'code' : 'strategy',
    timestamp: new Date().toISOString()
  };
}