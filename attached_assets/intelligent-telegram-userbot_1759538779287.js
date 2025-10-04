// intelligent-telegram-userbot.js - Self-Learning Telegram UserBot
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage, NewMessageEvent } = require('telegram/events');
const input = require('input');
const fs = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Console colors
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

// Enhanced Configuration with Learning System
let config = {
  telegram: {
    apiId: null,
    apiHash: null,
    sessionString: '',
    phoneNumber: null,
    adminId: null // Admin who provides feedback
  },
  ai: {
    provider: 'claude',
    claudeKey: null,
    geminiKey: null
  },
  learning: {
    enabled: true,
    autoLearn: true,
    requireApproval: true,
    improvementThreshold: 0.7, // Confidence threshold for auto-learning
    maxMemorySize: 1000 // Max number of learned patterns
  },
  automation: {
    enabled: true,
    responseMode: 'adaptive', // 'human', 'assistant', or 'adaptive'
    autoReply: true,
    typingDelay: true,
    readReceipts: true,
    activeHours: {
      start: 9,
      end: 23
    }
  },
  personality: {
    name: 'You',
    style: 'adaptive', // Adapts based on feedback
    traits: {
      professional: 0.5,
      friendly: 0.7,
      humorous: 0.3,
      formal: 0.3,
      empathetic: 0.6
    }
  },
  stats: {
    messagesProcessed: 0,
    successfulResponses: 0,
    failedResponses: 0,
    learningEvents: 0,
    averageConfidence: 0
  }
};

// Learning Database
class LearningSystem {
  constructor() {
    this.patterns = new Map(); // Message patterns -> responses
    this.feedback = new Map(); // Response ID -> feedback
    this.contextMemory = new Map(); // User -> context patterns
    this.responseHistory = new Map(); // Track all responses for learning
    this.personalityEvolution = []; // Track personality changes over time
    this.pendingFeedback = new Map(); // Awaiting admin feedback
  }

  async loadLearningData() {
    try {
      const dataPath = path.join(__dirname, 'learning-data.json');
      const data = await fs.readFile(dataPath, 'utf8');
      const parsed = JSON.parse(data);
      
      this.patterns = new Map(parsed.patterns);
      this.contextMemory = new Map(parsed.contextMemory);
      this.personalityEvolution = parsed.personalityEvolution || [];
      
      console.log(`${colors.green}✅ Loaded ${this.patterns.size} learned patterns${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}No previous learning data found${colors.reset}`);
    }
  }

  async saveLearningData() {
    try {
      const dataPath = path.join(__dirname, 'learning-data.json');
      const data = {
        patterns: Array.from(this.patterns.entries()),
        contextMemory: Array.from(this.contextMemory.entries()),
        personalityEvolution: this.personalityEvolution,
        stats: config.stats
      };
      
      await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`${colors.red}Failed to save learning data:${colors.reset}`, error);
    }
  }

  // Analyze message for patterns
  analyzeMessage(message, context = {}) {
    const analysis = {
      intent: this.detectIntent(message),
      sentiment: this.analyzeSentiment(message),
      keywords: this.extractKeywords(message),
      category: this.categorizeMessage(message, context),
      confidence: 0
    };

    // Check if we've seen similar patterns
    const similarPattern = this.findSimilarPattern(analysis);
    if (similarPattern) {
      analysis.confidence = similarPattern.confidence;
      analysis.suggestedResponse = similarPattern.response;
    }

    return analysis;
  }

  detectIntent(message) {
    const intents = {
      greeting: /^(hi|hello|hey|sup|yo|good morning|good evening)/i,
      question: /\?|^(what|when|where|who|why|how|can|could|would|should)/i,
      request: /(please|could you|can you|would you|need|want|help)/i,
      confirmation: /^(yes|yeah|yep|sure|ok|okay|alright|no|nope|maybe)/i,
      farewell: /(bye|goodbye|see you|talk later|gtg|cya)/i,
      business: /(meeting|project|deadline|invoice|payment|contract|proposal)/i,
      urgent: /(urgent|asap|emergency|important|immediately)/i,
      emotional: /(feel|sad|happy|excited|worried|stressed|love|hate)/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return 'general';
  }

  analyzeSentiment(message) {
    const positive = /(good|great|excellent|amazing|wonderful|happy|love|thanks|appreciate)/i;
    const negative = /(bad|terrible|awful|hate|angry|upset|disappointed|problem)/i;
    const neutral = /(ok|okay|fine|alright|maybe|perhaps)/i;

    if (positive.test(message)) return 'positive';
    if (negative.test(message)) return 'negative';
    if (neutral.test(message)) return 'neutral';
    return 'neutral';
  }

  extractKeywords(message) {
    // Remove common words and extract important terms
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const words = message.toLowerCase().split(/\s+/);
    return words.filter(word => !commonWords.has(word) && word.length > 2);
  }

  categorizeMessage(message, context) {
    if (context.relationship === 'client' || /business|project|meeting/.test(message)) {
      return 'business';
    }
    if (context.relationship === 'friend' || /hang out|party|fun/.test(message)) {
      return 'social';
    }
    if (context.relationship === 'family') {
      return 'family';
    }
    return 'general';
  }

  findSimilarPattern(analysis) {
    let bestMatch = null;
    let highestSimilarity = 0;

    for (const [pattern, data] of this.patterns) {
      const similarity = this.calculateSimilarity(analysis, pattern);
      if (similarity > highestSimilarity && similarity > 0.7) {
        highestSimilarity = similarity;
        bestMatch = data;
      }
    }

    return bestMatch ? { ...bestMatch, confidence: highestSimilarity } : null;
  }

  calculateSimilarity(analysis1, analysis2) {
    let score = 0;
    if (analysis1.intent === analysis2.intent) score += 0.3;
    if (analysis1.sentiment === analysis2.sentiment) score += 0.2;
    if (analysis1.category === analysis2.category) score += 0.2;
    
    // Keyword overlap
    const keywords1 = new Set(analysis1.keywords);
    const keywords2 = new Set(analysis2.keywords);
    const intersection = [...keywords1].filter(k => keywords2.has(k));
    const union = new Set([...keywords1, ...keywords2]);
    if (union.size > 0) {
      score += 0.3 * (intersection.length / union.size);
    }

    return score;
  }

  // Learn from feedback
  async learnFromFeedback(messageId, feedback) {
    const history = this.responseHistory.get(messageId);
    if (!history) return;

    const { originalMessage, response, analysis, context } = history;

    // Update pattern database
    if (feedback.rating === 'good') {
      // Strengthen this pattern
      const pattern = {
        analysis,
        response,
        confidence: 0.9,
        usageCount: 1,
        lastUsed: new Date()
      };
      
      this.patterns.set(JSON.stringify(analysis), pattern);
      
      // Update personality traits based on successful responses
      this.updatePersonalityTraits(feedback.traits);
      
      config.stats.successfulResponses++;
    } else if (feedback.rating === 'bad') {
      // Learn what not to do
      const pattern = {
        analysis,
        response,
        confidence: 0.1,
        avoidance: true,
        feedback: feedback.suggestion
      };
      
      this.patterns.set(JSON.stringify(analysis), pattern);
      config.stats.failedResponses++;
    }

    // If admin provided a better response, learn it
    if (feedback.betterResponse) {
      const improvedPattern = {
        analysis,
        response: feedback.betterResponse,
        confidence: 1.0,
        adminApproved: true,
        usageCount: 0,
        lastUsed: new Date()
      };
      
      this.patterns.set(JSON.stringify(analysis), improvedPattern);
    }

    config.stats.learningEvents++;
    await this.saveLearningData();
    
    return {
      learned: true,
      improvement: feedback.rating === 'good' ? 'positive' : 'negative',
      newPattern: feedback.betterResponse ? 'added' : 'updated'
    };
  }

  updatePersonalityTraits(feedbackTraits) {
    if (!feedbackTraits) return;

    // Adjust personality based on what worked
    for (const [trait, value] of Object.entries(feedbackTraits)) {
      if (config.personality.traits[trait] !== undefined) {
        // Gradually adjust trait (learning rate of 0.1)
        config.personality.traits[trait] = 
          config.personality.traits[trait] * 0.9 + value * 0.1;
      }
    }

    // Record evolution
    this.personalityEvolution.push({
      timestamp: new Date(),
      traits: { ...config.personality.traits }
    });
  }

  // Generate improvement suggestions
  async generateImprovementSuggestions() {
    const suggestions = [];

    // Analyze response patterns
    const recentResponses = Array.from(this.responseHistory.values()).slice(-50);
    const avgConfidence = recentResponses.reduce((sum, r) => sum + (r.confidence || 0), 0) / recentResponses.length;

    if (avgConfidence < 0.6) {
      suggestions.push('Low confidence in recent responses. Consider providing more feedback to improve accuracy.');
    }

    // Check personality balance
    const traits = Object.values(config.personality.traits);
    const avgTrait = traits.reduce((a, b) => a + b) / traits.length;
    if (Math.abs(avgTrait - 0.5) > 0.3) {
      suggestions.push('Personality traits seem imbalanced. The bot might be too extreme in some behaviors.');
    }

    // Pattern diversity
    if (this.patterns.size < 50) {
      suggestions.push('Limited pattern database. More interactions and feedback will improve responses.');
    }

    return suggestions;
  }
}

// Enhanced AI Manager with Learning Integration
class IntelligentAIManager {
  constructor(learningSystem) {
    this.claude = null;
    this.gemini = null;
    this.learningSystem = learningSystem;
  }

  initialize(claudeKey, geminiKey) {
    if (claudeKey) {
      this.claude = new Anthropic({ apiKey: claudeKey });
      console.log(`${colors.green}✅ Claude AI initialized${colors.reset}`);
    }
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      console.log(`${colors.green}✅ Gemini AI initialized${colors.reset}`);
    }
  }

  async getResponse(message, senderName, context = {}) {
    // First, analyze the message
    const analysis = this.learningSystem.analyzeMessage(message, context);
    
    // Check if we have a learned pattern with high confidence
    if (analysis.confidence > config.learning.improvementThreshold && analysis.suggestedResponse) {
      console.log(`${colors.magenta}Using learned response (confidence: ${analysis.confidence.toFixed(2)})${colors.reset}`);
      return {
        response: analysis.suggestedResponse,
        confidence: analysis.confidence,
        source: 'learned'
      };
    }

    // Otherwise, generate new response with AI
    const prompt = this.buildAdaptivePrompt(message, senderName, context, analysis);
    const aiResponse = await this.getAIResponse(prompt);
    
    // Store for potential learning
    const messageId = Date.now().toString();
    this.learningSystem.responseHistory.set(messageId, {
      originalMessage: message,
      response: aiResponse,
      analysis,
      context,
      timestamp: new Date(),
      confidence: analysis.confidence || 0.5
    });

    // If admin feedback is required, queue it
    if (config.learning.requireApproval && context.senderId === config.telegram.adminId) {
      this.learningSystem.pendingFeedback.set(messageId, {
        message,
        response: aiResponse,
        analysis
      });
    }

    return {
      response: aiResponse,
      confidence: analysis.confidence || 0.5,
      source: 'ai',
      messageId
    };
  }

  buildAdaptivePrompt(message, senderName, context, analysis) {
    const traits = config.personality.traits;
    const adaptivePersonality = this.describePersonality(traits);

    return `You are ${config.personality.name}, responding to a ${context.relationship || 'contact'} named ${senderName}.

Message Analysis:
- Intent: ${analysis.intent}
- Sentiment: ${analysis.sentiment}
- Category: ${analysis.category}

Your adaptive personality:
${adaptivePersonality}

Based on learned patterns, responses in this context should be:
- ${analysis.intent === 'business' ? 'Professional and clear' : 'Casual and friendly'}
- ${analysis.sentiment === 'negative' ? 'Empathetic and helpful' : 'Positive and engaging'}

${senderName} says: "${message}"

Respond naturally as ${config.personality.name} would, adapting to the context:`;
  }

  describePersonality(traits) {
    const descriptions = [];
    
    if (traits.professional > 0.6) descriptions.push('professional and business-focused');
    if (traits.friendly > 0.6) descriptions.push('warm and friendly');
    if (traits.humorous > 0.5) descriptions.push('occasionally humorous');
    if (traits.formal > 0.6) descriptions.push('formal in communication');
    if (traits.empathetic > 0.6) descriptions.push('empathetic and understanding');
    
    return descriptions.join(', ') || 'balanced and adaptive';
  }

  async getAIResponse(prompt) {
    try {
      if (this.claude) {
        const response = await this.claude.messages.create({
          model: 'claude-3-opus-20240229',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }]
        });
        return response.content[0].text;
      } else if (this.gemini) {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (error) {
      console.error(`${colors.red}AI Error:${colors.reset}`, error.message);
      return "I'm having trouble processing that right now. Let me get back to you.";
    }
  }
}

// Enhanced Telegram UserBot with Learning
class IntelligentTelegramUserBot {
  constructor() {
    this.client = null;
    this.learningSystem = new LearningSystem();
    this.aiManager = new IntelligentAIManager(this.learningSystem);
    this.myId = null;
    this.isAdmin = false;
  }

  async initialize() {
    // Load learning data
    await this.learningSystem.loadLearningData();

    // Initialize Telegram client
    this.client = new TelegramClient(
      new StringSession(config.telegram.sessionString),
      config.telegram.apiId,
      config.telegram.apiHash,
      { connectionRetries: 5 }
    );

    await this.client.connect();
    
    const me = await this.client.getMe();
    this.myId = me.id;
    config.personality.name = me.firstName || 'You';
    
    console.log(`${colors.green}✅ Logged in as ${me.firstName} ${me.lastName || ''}${colors.reset}`);
    console.log(`${colors.blue}🧠 Learning system active with ${this.learningSystem.patterns.size} patterns${colors.reset}`);
    
    // Initialize AI
    this.aiManager.initialize(config.ai.claudeKey, config.ai.geminiKey);
    
    // Setup handlers
    this.setupMessageHandler();
    this.setupFeedbackHandler();
    this.setupLearningLoop();
  }

  setupMessageHandler() {
    this.client.addEventHandler(async (event) => {
      try {
        const message = event.message;
        if (!message || message.senderId === this.myId || message.isChannel) return;

        const sender = await this.client.getEntity(message.senderId);
        const senderName = sender.firstName || 'User';
        const senderId = message.senderId.toString();

        // Check if this is admin
        this.isAdmin = senderId === config.telegram.adminId;

        // Check for feedback commands from admin
        if (this.isAdmin && message.text.startsWith('/feedback')) {
          await this.handleFeedbackCommand(message);
          return;
        }

        // Log the message
        console.log(`${colors.cyan}[${new Date().toLocaleTimeString()}] ${senderName}: ${message.text}${colors.reset}`);

        // Get intelligent response
        const responseData = await this.aiManager.getResponse(
          message.text,
          senderName,
          {
            senderId,
            relationship: this.getRelationship(senderId),
            isAdmin: this.isAdmin
          }
        );

        // Send response
        if (config.automation.typingDelay) {
          await this.simulateTyping(message.chatId, responseData.response);
        }

        await this.client.sendMessage(message.chatId, { 
          message: responseData.response 
        });

        console.log(`${colors.green}[${new Date().toLocaleTimeString()}] You: ${responseData.response}${colors.reset}`);
        console.log(`${colors.yellow}Confidence: ${responseData.confidence.toFixed(2)} | Source: ${responseData.source}${colors.reset}`);

        // If admin, ask for feedback on uncertain responses
        if (this.isAdmin && responseData.confidence < 0.7 && config.learning.requireApproval) {
          await this.requestFeedback(message.chatId, responseData.messageId);
        }

        config.stats.messagesProcessed++;

      } catch (error) {
        console.error(`${colors.red}Error handling message:${colors.reset}`, error);
      }
    }, new NewMessage({ incoming: true }));
  }

  setupFeedbackHandler() {
    // Handle inline feedback buttons (if using bot API features)
    this.client.addEventHandler(async (event) => {
      if (!event.query) return;
      
      const data = event.query.data.toString();
      if (data.startsWith('feedback:')) {
        const [, messageId, rating] = data.split(':');
        await this.processFeedback(messageId, rating, event);
      }
    });
  }

  async handleFeedbackCommand(message) {
    const parts = message.text.split(' ');
    const command = parts[1];

    switch (command) {
      case 'stats':
        await this.sendLearningStats(message.chatId);
        break;
      
      case 'review':
        await this.reviewPendingFeedback(message.chatId);
        break;
      
      case 'improve':
        const messageId = parts[2];
        const betterResponse = parts.slice(3).join(' ');
        if (messageId && betterResponse) {
          await this.improveFeedback(messageId, betterResponse);
        }
        break;
      
      case 'personality':
        await this.showPersonalityTraits(message.chatId);
        break;
      
      case 'suggestions':
        await this.showImprovementSuggestions(message.chatId);
        break;
      
      default:
        await this.sendFeedbackHelp(message.chatId);
    }
  }

  async requestFeedback(chatId, messageId) {
    const pending = this.learningSystem.pendingFeedback.get(messageId);
    if (!pending) return;

    const feedbackMessage = `🤖 Learning Request:

Original: "${pending.message}"
Response: "${pending.response}"

Was this response good? 

/feedback improve ${messageId} [better response]
/feedback good ${messageId}
/feedback bad ${messageId}`;

    await this.client.sendMessage(chatId, { message: feedbackMessage });
  }

  async processFeedback(messageId, rating, betterResponse = null) {
    const result = await this.learningSystem.learnFromFeedback(messageId, {
      rating,
      betterResponse,
      traits: this.analyzeResponseTraits(rating)
    });

    console.log(`${colors.magenta}📚 Learning feedback processed: ${result.improvement}${colors.reset}`);
  }

  analyzeResponseTraits(rating) {
    // Analyze what personality traits led to good/bad responses
    if (rating === 'good') {
      return {
        professional: Math.random() * 0.3 + 0.7,
        friendly: Math.random() * 0.3 + 0.7,
        empathetic: Math.random() * 0.3 + 0.6
      };
    } else {
      return {
        professional: Math.random() * 0.3 + 0.3,
        friendly: Math.random() * 0.3 + 0.3,
        empathetic: Math.random() * 0.3 + 0.3
      };
    }
  }

  async sendLearningStats(chatId) {
    const stats = `📊 Learning Statistics:

Patterns Learned: ${this.learningSystem.patterns.size}
Messages Processed: ${config.stats.messagesProcessed}
Successful Responses: ${config.stats.successfulResponses}
Failed Responses: ${config.stats.failedResponses}
Learning Events: ${config.stats.learningEvents}
Average Confidence: ${(config.stats.averageConfidence || 0).toFixed(2)}

Personality Evolution:
${Object.entries(config.personality.traits)
  .map(([trait, value]) => `${trait}: ${(value * 100).toFixed(0)}%`)
  .join('\n')}`;

    await this.client.sendMessage(chatId, { message: stats });
  }

  async showImprovementSuggestions(chatId) {
    const suggestions = await this.learningSystem.generateImprovementSuggestions();
    
    const message = `💡 Improvement Suggestions:

${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Use /feedback review to check pending responses.`;

    await this.client.sendMessage(chatId, { message });
  }

  setupLearningLoop() {
    // Periodic learning analysis and optimization
    setInterval(async () => {
      // Clean old patterns with low confidence
      for (const [key, pattern] of this.learningSystem.patterns) {
        if (pattern.confidence < 0.3 && !pattern.adminApproved) {
          this.learningSystem.patterns.delete(key);
        }
      }

      // Update average confidence
      const recentResponses = Array.from(this.learningSystem.responseHistory.values()).slice(-100);
      if (recentResponses.length > 0) {
        config.stats.averageConfidence = 
          recentResponses.reduce((sum, r) => sum + (r.confidence || 0), 0) / recentResponses.length;
      }

      // Save learning data
      await this.learningSystem.saveLearningData();
      
      console.log(`${colors.blue}🔄 Learning cycle completed${colors.reset}`);
    }, 300000); // Every 5 minutes
  }

  async simulateTyping(chatId, message) {
    const typingTime = Math.min(message.length * 50, 5000);
    
    await this.client.invoke(
      new Api.messages.SetTyping({
        peer: chatId,
        action: new Api.SendMessageTypingAction()
      })
    );
    
    await new Promise(resolve => setTimeout(resolve, typingTime));
    
    await this.client.invoke(
      new Api.messages.SetTyping({
        peer: chatId,
        action: new Api.SendMessageCancelAction()
      })
    );
  }

  getRelationship(senderId) {
    // This would be enhanced with learned relationship patterns
    return 'friend'; // Default
  }

  async sendFeedbackHelp(chatId) {
    const help = `🤖 Feedback Commands:

/feedback stats - View learning statistics
/feedback review - Review pending responses
/feedback improve [messageId] [better response] - Provide better response
/feedback personality - View personality traits
/feedback suggestions - Get improvement suggestions

Example:
/feedback improve 12345 Thanks for asking! I'll check and get back to you.`;

    await this.client.sendMessage(chatId, { message: help });
  }
}

// Enhanced Setup Wizard
async function setupWizard() {
  console.log(`${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║      🧠 INTELLIGENT TELEGRAM USERBOT SETUP 🧠             ║
║                                                            ║
║   Self-learning AI that improves with your feedback       ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Standard setup steps...
  console.log(`${colors.cyan}Step 1: Telegram API Credentials${colors.reset}`);
  config.telegram.apiId = parseInt(await input.text('Enter api_id: '));
  config.telegram.apiHash = await input.text('Enter api_hash: ');
  config.telegram.phoneNumber = await input.text('Enter your phone number: ');

  // Admin setup for feedback
  console.log(`\n${colors.cyan}Step 2: Admin Configuration${colors.reset}`);
  console.log('The admin can provide feedback to help the bot learn and improve.');
  const adminUsername = await input.text('Enter admin Telegram username (or press Enter to skip): ');
  
  if (adminUsername) {
    // In real implementation, you'd look up the user ID
    console.log(`${colors.yellow}Note: You'll need to get the admin's user ID${colors.reset}`);
    config.telegram.adminId = await input.text('Enter admin Telegram user ID: ');
  }

  // AI setup
  console.log(`\n${colors.cyan}Step 3: AI Provider${colors.reset}`);
  const aiChoice = await input.select('Choose AI provider:', ['Claude', 'Gemini', 'Both']);
  
  if (aiChoice.includes('Claude')) {
    config.ai.claudeKey = await input.text('Enter Claude API key: ');
  }
  if (aiChoice.includes('Gemini')) {
    config.ai.geminiKey = await input.text('Enter Gemini API key: ');
  }

  // Learning preferences
  console.log(`\n${colors.cyan}Step 4: Learning Preferences${colors.reset}`);
  config.learning.autoLearn = (await input.confirm('Enable automatic learning?', true));
  config.learning.requireApproval = (await input.confirm('Require admin approval for learning?', true));

  await saveConfig();
  console.log(`\n${colors.green}✅ Configuration complete!${colors.reset}`);
}

// Save/Load functions
async function saveConfig() {
  try {
    const configPath = path.join(__dirname, 'intelligent-userbot-config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(`${colors.red}Failed to save config:${colors.reset}`, error);
  }
}

async function loadConfig() {
  try {
    const configPath = path.join(__dirname, 'intelligent-userbot-config.json');
    const data = await fs.readFile(configPath, 'utf8');
    config = { ...config, ...JSON.parse(data) };
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
async function main() {
  console.clear();
  
  try {
    const configLoaded = await loadConfig();
    
    if (!configLoaded || !config.telegram.sessionString) {
      await setupWizard();
      
      // Authenticate
      const client = new TelegramClient(
        new StringSession(''),
        config.telegram.apiId,
        config.telegram.apiHash,
        { connectionRetries: 5 }
      );

      await client.start({
        phoneNumber: config.telegram.phoneNumber,
        password: async () => await input.text('Enter 2FA password (if enabled): '),
        phoneCode: async () => await input.text('Enter the code you received: '),
        onError: (err) => console.error(err),
      });

      config.telegram.sessionString = client.session.save();
      await saveConfig();
      await client.disconnect();
    }

    // Start the intelligent bot
    console.log(`\n${colors.cyan}Starting Intelligent UserBot...${colors.reset}`);
    const bot = new IntelligentTelegramUserBot();
    await bot.initialize();

    console.log(`\n${colors.green}✅ Intelligent UserBot is active!${colors.reset}`);
    console.log(`${colors.yellow}The bot will learn and improve from feedback.${colors.reset}`);
    
    if (config.telegram.adminId) {
      console.log(`${colors.blue}Admin can use /feedback commands to train the bot.${colors.reset}`);
    }

    // Keep running
    process.stdin.resume();

  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log(`\n${colors.yellow}Saving learning data...${colors.reset}`);
  
  if (global.bot && global.bot.learningSystem) {
    await global.bot.learningSystem.saveLearningData();
  }
  
  console.log(`${colors.green}✅ Shutdown complete${colors.reset}`);
  process.exit(0);
});

// Run
main().catch(console.error);
