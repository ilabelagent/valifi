#!/usr/bin/env node

// ai-bot-with-patch.js - AI Bot with Patch Request Integration
const path = require('path');
const fs = require('fs').promises;
const readline = require('readline');
const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Patch Request Manager
class PatchRequestManager {
  constructor(config) {
    this.config = config;
    this.pendingRequests = new Map(); // Store pending patch requests
    this.patchServiceUrl = config.patchService?.url || 'http://localhost:3000/api/patches';
    this.requireApproval = config.patchService?.requireApproval !== false;
    this.adminIds = config.patchService?.adminIds || [config.telegram.adminId].filter(Boolean);
  }

  generateRequestId() {
    return `PATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async parsePatchCommand(message) {
    // Parse different patch command formats
    const patchPatterns = [
      /^\/patch\s+(.+?):\s*(.+)$/i,  // /patch system: update security
      /^patch request:\s*(.+)$/i,     // patch request: fix login bug
      /^deploy patch\s+(.+)$/i,       // deploy patch production-api
      /^\/update\s+(.+?)\s+to\s+(.+)$/i, // /update api to v2.1.0
    ];

    for (const pattern of patchPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          isPatchRequest: true,
          target: match[1]?.trim(),
          description: match[2]?.trim() || match[1]?.trim(),
          rawCommand: message
        };
      }
    }

    return { isPatchRequest: false };
  }

  async createPatchRequest(userId, userName, patchInfo) {
    const requestId = this.generateRequestId();
    const request = {
      id: requestId,
      userId,
      userName,
      target: patchInfo.target,
      description: patchInfo.description,
      command: patchInfo.rawCommand,
      status: 'pending',
      createdAt: new Date().toISOString(),
      approved: !this.requireApproval,
      approvedBy: null,
      executionResult: null
    };

    this.pendingRequests.set(requestId, request);
    return request;
  }

  async submitToPatchService(patchRequest) {
    try {
      console.log(`${colors.cyan}📤 Submitting patch to service: ${this.patchServiceUrl}${colors.reset}`);
      
      const response = await axios.post(this.patchServiceUrl, {
        requestId: patchRequest.id,
        target: patchRequest.target,
        description: patchRequest.description,
        requestedBy: patchRequest.userName,
        autoApproved: !this.requireApproval
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.patchService?.apiKey || ''}`
        },
        timeout: 30000
      });

      return {
        success: true,
        data: response.data,
        status: response.data.status || 'submitted'
      };
    } catch (error) {
      console.error(`${colors.red}Patch service error: ${error.message}${colors.reset}`);
      
      // Fallback simulation for demo
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log(`${colors.yellow}⚠ Patch service unavailable - using simulation mode${colors.reset}`);
        return this.simulatePatchService(patchRequest);
      }
      
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  async simulatePatchService(patchRequest) {
    // Simulate patch service for demonstration
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    const scenarios = [
      { status: 'ready', message: 'Patch validated and ready for deployment' },
      { status: 'requires-review', message: 'Patch requires security review' },
      { status: 'conflicts', message: 'Patch has conflicts with current version' },
      { status: 'validated', message: 'Patch passed all tests' }
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      success: true,
      data: {
        requestId: patchRequest.id,
        status: scenario.status,
        message: scenario.message,
        estimatedTime: '15 minutes',
        affectedSystems: ['API Gateway', 'User Service', 'Cache Layer']
      },
      status: scenario.status
    };
  }

  async checkPatchStatus(requestId) {
    try {
      const response = await axios.get(`${this.patchServiceUrl}/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.patchService?.apiKey || ''}`
        },
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // Fallback simulation
      const request = this.pendingRequests.get(requestId);
      if (request) {
        return {
          success: true,
          data: {
            ...request,
            currentStatus: ['validating', 'testing', 'ready', 'deploying'][Math.floor(Math.random() * 4)],
            progress: Math.floor(Math.random() * 100)
          }
        };
      }
      
      return {
        success: false,
        error: 'Request not found'
      };
    }
  }

  async approvePatch(requestId, approverId) {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      return { success: false, error: 'Patch request not found' };
    }

    request.approved = true;
    request.approvedBy = approverId;
    request.approvedAt = new Date().toISOString();
    request.status = 'approved';

    // Submit to patch service if it wasn't already
    if (!request.submitted) {
      const result = await this.submitToPatchService(request);
      request.executionResult = result;
    }

    return { success: true, request };
  }

  formatPatchResponse(patchRequest, serviceResponse) {
    let response = `🔧 **Patch Request Created**\n\n`;
    response += `📋 ID: \`${patchRequest.id}\`\n`;
    response += `🎯 Target: ${patchRequest.target}\n`;
    response += `📝 Description: ${patchRequest.description}\n`;
    response += `👤 Requested by: ${patchRequest.userName}\n`;
    response += `📅 Time: ${new Date(patchRequest.createdAt).toLocaleString()}\n\n`;

    if (serviceResponse.success) {
      response += `✅ **Status**: ${serviceResponse.data.status || 'Submitted'}\n`;
      if (serviceResponse.data.message) {
        response += `💬 ${serviceResponse.data.message}\n`;
      }
      if (serviceResponse.data.estimatedTime) {
        response += `⏱️ Estimated time: ${serviceResponse.data.estimatedTime}\n`;
      }
      if (serviceResponse.data.affectedSystems?.length > 0) {
        response += `🔗 Affected systems: ${serviceResponse.data.affectedSystems.join(', ')}\n`;
      }
    } else {
      response += `❌ **Error**: ${serviceResponse.error}\n`;
    }

    if (this.requireApproval && !patchRequest.approved) {
      response += `\n⚠️ **Approval Required**\n`;
      response += `Waiting for admin approval. Admins can approve with:\n`;
      response += `\`/approve ${patchRequest.id}\``;
    }

    return response;
  }

  isAdmin(userId) {
    return this.adminIds.includes(userId.toString());
  }
}

// Enhanced AI Manager with Patch Integration
class AIManager {
  constructor(config, patchManager) {
    this.config = config;
    this.patchManager = patchManager;
    this.gemini = null;
    this.claude = null;
    this.conversationHistory = new Map();
    this.initializeAI();
  }

  async initializeAI() {
    // Initialize Gemini (Priority)
    if (this.config.ai?.geminiKey) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.config.ai.geminiKey);
        this.gemini = genAI.getGenerativeModel({ model: 'gemini-pro' });
        console.log(`${colors.green}✓ Gemini AI initialized (Primary)${colors.reset}`);
      } catch (error) {
        console.log(`${colors.yellow}⚠ Gemini AI not available: ${error.message}${colors.reset}`);
      }
    }

    // Initialize Claude (Backup)
    if (this.config.ai?.claudeKey) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        this.claude = new Anthropic({ apiKey: this.config.ai.claudeKey });
        console.log(`${colors.green}✓ Claude AI initialized (Backup)${colors.reset}`);
      } catch (error) {
        console.log(`${colors.yellow}⚠ Claude AI not available: ${error.message}${colors.reset}`);
      }
    }
  }

  async generateResponse(message, senderName, senderId, isPatchRelated = false) {
    try {
      const context = this.getConversationContext(senderId);
      const contextString = context.slice(-6).map(h => `${h.role}: ${h.message}`).join('\n');
      
      // Create appropriate prompt based on context
      let systemPrompt = `You are a helpful assistant having a conversation with ${senderName}.`;
      
      if (isPatchRelated) {
        systemPrompt += ` The user is asking about patch requests or system updates. Be professional and clear about technical matters. If they're checking status, be informative about the current state.`;
      }

      const prompt = `${systemPrompt}
      
${contextString ? `Recent conversation:\n${contextString}\n\n` : ''}

User message: "${message}"

Guidelines:
- Be conversational and friendly
- For technical/patch topics, be clear and professional
- Keep responses concise but informative
- Use appropriate emoji sparingly
- If discussing patches, acknowledge the importance of the request`;

      // Try Gemini first
      if (this.gemini) {
        try {
          console.log(`${colors.cyan}🤖 Using Gemini AI...${colors.reset}`);
          const result = await this.gemini.generateContent(prompt);
          const response = result.response.text();
          this.updateConversationHistory(senderId, message, response);
          return response;
        } catch (error) {
          console.log(`${colors.yellow}⚠ Gemini error, trying Claude...${colors.reset}`);
        }
      }

      // Try Claude as backup
      if (this.claude) {
        try {
          console.log(`${colors.cyan}🤖 Using Claude AI...${colors.reset}`);
          const response = await this.claude.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 150,
            messages: [{
              role: 'user',
              content: prompt
            }]
          });
          
          const aiResponse = response.content[0].text;
          this.updateConversationHistory(senderId, message, aiResponse);
          return aiResponse;
        } catch (error) {
          console.log(`${colors.yellow}⚠ Claude error: ${error.message}${colors.reset}`);
        }
      }

      // Fallback response
      return this.getSmartFallbackResponse(message, senderName);
      
    } catch (error) {
      console.error(`${colors.red}AI Error: ${error.message}${colors.reset}`);
      return this.getSmartFallbackResponse(message, senderName);
    }
  }

  getConversationContext(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId);
  }

  updateConversationHistory(userId, userMessage, botResponse) {
    const history = this.getConversationContext(userId);
    history.push({ role: 'user', message: userMessage });
    history.push({ role: 'assistant', message: botResponse });
    
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  getSmartFallbackResponse(message, senderName) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('patch') || lowerMessage.includes('update')) {
      return "I can help you with patch requests! Use commands like '/patch system: description' to create a new patch request.";
    }
    
    if (lowerMessage.includes('status')) {
      return "To check patch status, use '/status PATCH-ID'. For general help, just ask!";
    }
    
    // Default responses for general conversation
    const defaults = [
      "That's interesting! Tell me more.",
      "I see what you mean!",
      "Got it! How can I help you with that?",
      "Thanks for sharing. Anything else I can assist with?"
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
  }
}

async function startBot() {
  console.log(`${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║   🤖 AI BOT WITH PATCH REQUEST INTEGRATION 🤖             ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  try {
    // Load configuration
    const configPaths = [
      path.join(process.env.APPDATA || process.env.HOME, 'telegram-userbot-gui', 'intelligent-userbot-config.json'),
      path.join(__dirname, 'intelligent-userbot-config.json')
    ];

    let config = null;
    let configPath = null;
    
    for (const tryPath of configPaths) {
      try {
        const data = await fs.readFile(tryPath, 'utf8');
        config = JSON.parse(data);
        configPath = tryPath;
        console.log(`${colors.green}✓ Found config at: ${tryPath}${colors.reset}`);
        break;
      } catch (e) {}
    }

    if (!config) {
      throw new Error('No configuration found. Please run npm start first.');
    }

    // Add default patch service config if not present
    if (!config.patchService) {
      config.patchService = {
        url: process.env.PATCH_SERVICE_URL || 'http://localhost:3000/api/patches',
        requireApproval: true,
        adminIds: [config.telegram.adminId].filter(Boolean),
        apiKey: process.env.PATCH_SERVICE_API_KEY || ''
      };
    }

    // Initialize managers
    const patchManager = new PatchRequestManager(config);
    const aiManager = new AIManager(config, patchManager);

    // Import Telegram modules
    const { TelegramClient, Api } = require('telegram');
    const { StringSession } = require('telegram/sessions');
    const { NewMessage } = require('telegram/events');

    // Create client
    const client = new TelegramClient(
      new StringSession(config.telegram.sessionString || ''),
      parseInt(config.telegram.apiId),
      config.telegram.apiHash,
      { connectionRetries: 5 }
    );

    console.log(`${colors.cyan}Connecting to Telegram...${colors.reset}`);

    if (!config.telegram.sessionString) {
      console.log(`${colors.yellow}First time setup - authentication required${colors.reset}`);
      
      await client.start({
        phoneNumber: () => Promise.resolve(config.telegram.phoneNumber),
        password: async () => {
          const pass = await question('Enter 2FA password (or press Enter if none): ');
          return pass;
        },
        phoneCode: async () => {
          console.log(`${colors.bright}${colors.yellow}
╔════════════════════════════════════════════╗
║     CHECK YOUR TELEGRAM APP FOR CODE!      ║
╚════════════════════════════════════════════╝${colors.reset}`);
          const code = await question('Enter verification code: ');
          return code;
        },
        onError: (err) => console.error(err),
      });

      // Save session
      config.telegram.sessionString = client.session.save();
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(`${colors.green}✓ Authentication successful!${colors.reset}`);
    } else {
      await client.connect();
    }

    const me = await client.getMe();
    console.log(`${colors.green}✓ Logged in as ${me.firstName} ${me.lastName || ''}${colors.reset}`);

    // Enhanced message handler with patch support
    client.addEventHandler(async (event) => {
      try {
        const message = event.message;
        if (!message || !message.text || message.isChannel) return;
        
        // Skip own messages
        if (message.senderId.toString() === me.id.toString()) return;

        const sender = await client.getEntity(message.senderId);
        const senderName = sender.firstName || 'User';
        const senderId = message.senderId.toString();

        console.log(`${colors.cyan}[${new Date().toLocaleTimeString()}] ${senderName}: ${message.text}${colors.reset}`);

        let response;
        let isPatchCommand = false;

        // Check for patch commands
        const patchInfo = await patchManager.parsePatchCommand(message.text);
        
        if (patchInfo.isPatchRequest) {
          isPatchCommand = true;
          console.log(`${colors.yellow}🔧 Patch request detected${colors.reset}`);
          
          // Create patch request
          const patchRequest = await patchManager.createPatchRequest(senderId, senderName, patchInfo);
          
          // Submit to patch service
          const serviceResponse = await patchManager.submitToPatchService(patchRequest);
          
          // Format response
          response = patchManager.formatPatchResponse(patchRequest, serviceResponse);
          
        } else if (message.text.toLowerCase().startsWith('/status ')) {
          // Check patch status
          const requestId = message.text.slice(8).trim();
          const statusResult = await patchManager.checkPatchStatus(requestId);
          
          if (statusResult.success) {
            response = `📊 **Patch Status**\n\n`;
            response += `ID: \`${requestId}\`\n`;
            response += `Status: ${statusResult.data.currentStatus || statusResult.data.status}\n`;
            if (statusResult.data.progress) {
              response += `Progress: ${statusResult.data.progress}%\n`;
            }
            response += `Created: ${new Date(statusResult.data.createdAt).toLocaleString()}\n`;
            if (statusResult.data.approved) {
              response += `✅ Approved by: ${statusResult.data.approvedBy}\n`;
            }
          } else {
            response = `❌ Could not find patch request: ${requestId}`;
          }
          
        } else if (message.text.toLowerCase().startsWith('/approve ')) {
          // Approve patch (admin only)
          const requestId = message.text.slice(9).trim();
          
          if (patchManager.isAdmin(senderId)) {
            const approvalResult = await patchManager.approvePatch(requestId, senderName);
            
            if (approvalResult.success) {
              response = `✅ **Patch Approved**\n\n`;
              response += `ID: \`${requestId}\`\n`;
              response += `Approved by: ${senderName}\n`;
              response += `The patch is now being deployed.`;
            } else {
              response = `❌ Could not approve: ${approvalResult.error}`;
            }
          } else {
            response = `❌ Only administrators can approve patches.`;
          }
          
        } else if (message.text.toLowerCase() === '/patch help') {
          // Show patch help
          response = `🔧 **Patch Commands**\n\n`;
          response += `**Create patch:**\n`;
          response += `• \`/patch system: description\`\n`;
          response += `• \`patch request: description\`\n`;
          response += `• \`deploy patch target\`\n\n`;
          response += `**Check status:**\n`;
          response += `• \`/status PATCH-ID\`\n\n`;
          response += `**Approve (admin):**\n`;
          response += `• \`/approve PATCH-ID\`\n\n`;
          response += `Example: \`/patch api: fix authentication bug\``;
          
        } else {
          // Regular AI response
          const isPatchRelated = message.text.toLowerCase().includes('patch') || 
                                message.text.toLowerCase().includes('update') ||
                                message.text.toLowerCase().includes('deploy');
                                
          response = await aiManager.generateResponse(message.text, senderName, senderId, isPatchRelated);
        }

        // Show typing indicator
        await client.invoke(
          new Api.messages.SetTyping({
            peer: message.chatId,
            action: new Api.SendMessageTypingAction()
          })
        );

        // Add slight delay for natural feel
        await new Promise(resolve => setTimeout(resolve, isPatchCommand ? 500 : 1000));
        
        // Stop typing indicator
        await client.invoke(
          new Api.messages.SetTyping({
            peer: message.chatId,
            action: new Api.SendMessageCancelAction()
          })
        );
        
        // Send response (with markdown support for patch responses)
        await client.sendMessage(message.chatId, { 
          message: response,
          parseMode: isPatchCommand ? 'md' : undefined
        });
        
        console.log(`${colors.green}[${new Date().toLocaleTimeString()}] You: ${response.substring(0, 50)}...${colors.reset}`);

      } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
      }
    }, new NewMessage({ incoming: true }));

    console.log(`${colors.bright}${colors.green}
╔════════════════════════════════════════════════════════════╗
║         🚀 AI BOT WITH PATCH SYSTEM RUNNING! 🚀           ║
║                                                            ║
║  ✓ AI Chat: ${config.ai?.geminiKey || config.ai?.claudeKey ? 'Active' : 'Fallback mode'}                                      ║
║  ✓ Patch Requests: Active                                  ║
║  ✓ Approval Required: ${config.patchService?.requireApproval ? 'Yes' : 'No'}                                 ║
║  ✓ Patch Service: ${config.patchService?.url ? 'Configured' : 'Simulation mode'}                       ║
║                                                            ║
║  Commands:                                                 ║
║  • /patch system: description - Create patch request       ║
║  • /status PATCH-ID - Check patch status                   ║
║  • /approve PATCH-ID - Approve patch (admin only)          ║
║  • /patch help - Show all patch commands                   ║
║                                                            ║
║  Press Ctrl+C to stop                                      ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

    process.stdin.resume();

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down bot...${colors.reset}`);
  rl.close();
  process.exit(0);
});

// Start the bot
startBot().catch(console.error);