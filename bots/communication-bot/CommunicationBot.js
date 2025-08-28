const KingdomBot = require('../../lib/core/KingdomBot');
const { readData, writeData } = require('../../lib/storage');
const TradingBot = require('../trading-bot/TradingBot');
const KingdomCore = require('../../lib/core/KingdomCore');

/**
 * CommunicationBot provides a variety of social and advisory
 * features for the Kingdom platform.  It supports secure
 * peer‑to‑peer messaging, AI investment advice, community
 * forums, webinars, live trading signals, news aggregation,
 * sentiment analysis and collaborative portfolio management.
 * All data is persisted to a JSON file.
 */
class CommunicationBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('Communication Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/communication.json');
    data.messages = data.messages || [];
    data.forums = data.forums || {};
    data.webinars = data.webinars || [];
    data.sharedPortfolios = data.sharedPortfolios || {};
    return data;
  }
  _saveData(data) {
    writeData('data/communication.json', data);
  }

  /**
   * Send a secure message from one user to another.  Messages
   * include subject and body.  They are stored for later retrieval.
   */
  sendMessage({ fromUser, toUser, subject = '', body = '' }) {
    if (!fromUser || !toUser || !body) {
      return { success: false, message: 'Missing fromUser, toUser or body' };
    }
    const data = this._getData();
    const msg = {
      id: `msg_${Date.now()}`,
      fromUser,
      toUser,
      subject,
      body,
      timestamp: new Date().toISOString(),
    };
    data.messages.push(msg);
    this._saveData(data);
    this.logDivineAction('Message Sent', { msg });
    return { success: true, message: msg };
  }

  /**
   * Retrieve messages for a given user.  Returns both inbox and
   * sent messages sorted by timestamp.
   */
  getMessages({ userId }) {
    if (!userId) return { success: false, message: 'userId required' };
    const data = this._getData();
    const inbox = data.messages.filter((m) => m.toUser === userId);
    const sent = data.messages.filter((m) => m.fromUser === userId);
    return { success: true, inbox, sent };
  }

  /**
   * Ask the AI advisor for investment advice.  This uses the
   * underlying AI engine stub to generate a response.  The
   * prompt can contain any question.  Returns the AI's answer.
   */
  async aiAdvisor({ userId = 'default', question }) {
    if (!question) return { success: false, message: 'Question required' };
    const answer = await this.queryAI(question, { user: userId });
    return { success: true, answer };
  }

  /**
   * Post a message to a community forum.  Creates the forum if it
   * does not exist.  Each post includes the user and timestamp.
   */
  postForum({ userId, forumId, content }) {
    if (!userId || !forumId || !content) {
      return { success: false, message: 'Missing userId, forumId or content' };
    }
    const data = this._getData();
    const posts = data.forums[forumId] || [];
    const post = {
      id: `post_${Date.now()}`,
      userId,
      content,
      timestamp: new Date().toISOString(),
    };
    posts.push(post);
    data.forums[forumId] = posts;
    this._saveData(data);
    this.logDivineAction('Forum Post', { forumId, post });
    return { success: true, post };
  }

  /**
   * List posts in a forum.  Returns posts with user and time.
   */
  listForumPosts({ forumId }) {
    if (!forumId) return { success: false, message: 'forumId required' };
    const data = this._getData();
    const posts = data.forums[forumId] || [];
    return { success: true, posts };
  }

  /**
   * Create a webinar.  Stores details such as title, description
   * and scheduled time.  Webinars can later be listed by users.
   */
  createWebinar({ title, description = '', scheduledAt }) {
    if (!title || !scheduledAt) {
      return { success: false, message: 'Missing title or scheduledAt' };
    }
    const data = this._getData();
    const webinar = {
      id: `webinar_${Date.now()}`,
      title,
      description,
      scheduledAt,
    };
    data.webinars.push(webinar);
    this._saveData(data);
    this.logDivineAction('Webinar Created', { webinar });
    return { success: true, webinar };
  }

  /**
   * List all upcoming webinars.
   */
  listWebinars() {
    const data = this._getData();
    return { success: true, webinars: data.webinars };
  }

  /**
   * Provide live trading signals.  For demonstration, returns a
   * list of randomly chosen trending symbols and dummy buy/sell
   * indicators.  In a real implementation, this would integrate
   * with market data and analysis.
   */
  liveTradingSignals() {
    const symbols = ['AAPL','ETH','BTC','TSLA','GOOG'];
    const signals = symbols.map((s) => ({ symbol: s, signal: Math.random() > 0.5 ? 'BUY' : 'SELL' }));
    return { success: true, signals };
  }

  /**
   * Copy a trade from one user to another.  Uses the TradingBot
   * to execute a buy on behalf of the target user.  Assumes the
   * trade is a buy.  Uses a new KingdomCore instance to avoid
   * cross‑request interference.
   */
  async copyTrade({ fromUser, toUser, symbol, qty, price }) {
    if (!fromUser || !toUser || !symbol || !qty || !price) {
      return { success: false, message: 'Missing trade parameters' };
    }
    // Simulate copying by executing a trade for the toUser
    const core = new KingdomCore();
    const tradingBot = new TradingBot(core);
    await tradingBot.initialize();
    await tradingBot.integrateWithKingdom();
    const result = await tradingBot.execute({ action: 'buy', user_id: toUser, symbol, quantity: qty, price });
    return result;
  }

  /**
   * Return a curated news feed.  Returns dummy articles grouped
   * by topics.  In a full implementation, this would fetch
   * articles from news APIs.
   */
  newsFeed({ topics = [] }) {
    const defaultArticles = [
      { title: 'Markets rally on positive earnings', category: 'markets' },
      { title: 'Ethereum 2.0 upgrades unveiled', category: 'crypto' },
      { title: 'Federal Reserve hints at rate pause', category: 'economy' },
      { title: 'Top tips for diversifying your portfolio', category: 'education' },
    ];
    if (!topics || topics.length === 0) {
      return { success: true, articles: defaultArticles };
    }
    const filtered = defaultArticles.filter((a) => topics.includes(a.category));
    return { success: true, articles: filtered.length ? filtered : defaultArticles };
  }

  /**
   * Perform sentiment analysis on a topic or symbol.  Uses a
   * simple random score for demonstration.  In production this
   * would call an NLP service.
   */
  sentimentAnalysis({ topic }) {
    if (!topic) return { success: false, message: 'topic required' };
    const score = Number((Math.random() * 2 - 1).toFixed(3));
    return { success: true, topic, sentimentScore: score };
  }

  /**
   * Create a shared portfolio.  The owner can add members and
   * contribute holdings.  Returns the portfolio ID.
   */
  createSharedPortfolio({ ownerId, name }) {
    if (!ownerId || !name) return { success: false, message: 'ownerId and name required' };
    const data = this._getData();
    const id = `sp_${Date.now()}`;
    data.sharedPortfolios[id] = { id, name, owner: ownerId, members: [ownerId], holdings: {} };
    this._saveData(data);
    this.logDivineAction('Shared Portfolio Created', { id, owner: ownerId });
    return { success: true, portfolioId: id };
  }

  /**
   * Add a member to an existing shared portfolio.  Only the
   * owner can add new members.
   */
  addSharedMember({ portfolioId, ownerId, memberId }) {
    const data = this._getData();
    const sp = data.sharedPortfolios[portfolioId];
    if (!sp) return { success: false, message: 'Shared portfolio not found' };
    if (sp.owner !== ownerId) return { success: false, message: 'Only owner can add members' };
    if (!sp.members.includes(memberId)) sp.members.push(memberId);
    this._saveData(data);
    return { success: true, members: sp.members };
  }

  /**
   * Get details of all shared portfolios for a user.
   */
  listSharedPortfolios({ userId }) {
    const data = this._getData();
    const portfolios = Object.values(data.sharedPortfolios).filter((sp) => sp.members.includes(userId));
    return { success: true, portfolios };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'send_message':
        return this.sendMessage(params);
      case 'get_messages':
        return this.getMessages(params);
      case 'ai_advisor':
        return this.aiAdvisor(params);
      case 'post_forum':
        return this.postForum(params);
      case 'list_forum_posts':
        return this.listForumPosts(params);
      case 'create_webinar':
        return this.createWebinar(params);
      case 'list_webinars':
        return this.listWebinars();
      case 'live_trading_signals':
        return this.liveTradingSignals();
      case 'copy_trade':
        return this.copyTrade(params);
      case 'news_feed':
        return this.newsFeed(params);
      case 'sentiment_analysis':
        return this.sentimentAnalysis(params);
      case 'create_shared_portfolio':
        return this.createSharedPortfolio(params);
      case 'add_shared_member':
        return this.addSharedMember(params);
      case 'list_shared_portfolios':
        return this.listSharedPortfolios(params);
      default:
        return { success: false, message: `Unknown action for CommunicationBot: ${action}` };
    }
  }
}

module.exports = CommunicationBot;