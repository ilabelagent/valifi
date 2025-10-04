// ============================================
// 📰 NEWS BOT - Yahoo-Style Business & Finance News
// Wired to GodBrain AI Orchestration System
// ============================================

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

class NewsBot extends EventEmitter {
    constructor() {
        super();
        this.name = "NewsBot";
        this.version = "1.0.0";
        
        // News pipeline components
        this.sources = new Map();
        this.articles = new Map();
        this.enrichmentQueue = [];
        this.deduplicationCache = new Map();
        
        // Configuration
        this.config = {
            pollInterval: 30000, // 30 seconds
            languages: ['en', 'de', 'es'],
            maxArticles: 1000,
            enrichmentEnabled: true,
            tickers: new Set(),
            topics: ['earnings', 'big_tech', 'markets', 'crypto', 'energy', 'africa']
        };
        
        // Scoring weights
        this.rankingWeights = {
            recency: 0.3,
            authority: 0.25,
            novelty: 0.2,
            marketImpact: 0.15,
            userInterest: 0.1
        };
        
        this.initialize();
    }

    async initialize() {
        console.log(`📰 ${this.name}: Initializing Yahoo-style news system`);
        
        // Initialize news sources
        await this.initializeSources();
        
        // Start polling cycle
        this.startPollingCycle();
        
        // Start enrichment processor
        this.startEnrichmentProcessor();
        
        console.log(`✅ ${this.name}: News system ready`);
    }

    // Initialize news sources
    async initializeSources() {
        // Primary sources
        this.sources.set('reuters', {
            url: 'https://feeds.reuters.com/reuters/businessNews',
            type: 'rss',
            authority: 0.95,
            pollInterval: 30000
        });
        
        this.sources.set('bloomberg', {
            url: 'https://feeds.bloomberg.com/markets/news.rss',
            type: 'rss',
            authority: 0.93,
            pollInterval: 30000
        });
        
        this.sources.set('yahoo_finance', {
            url: 'https://finance.yahoo.com/rss/',
            type: 'rss',
            authority: 0.90,
            pollInterval: 30000
        });
        
        // Add more sources as needed
        console.log(`📰 ${this.name}: Initialized ${this.sources.size} news sources`);
    }

    // Start polling cycle for news
    startPollingCycle() {
        setInterval(async () => {
            for (const [sourceId, source] of this.sources) {
                await this.fetchFromSource(sourceId, source);
            }
        }, this.config.pollInterval);
        
        // Initial fetch
        this.fetchAllSources();
    }

    // Fetch from all sources
    async fetchAllSources() {
        console.log(`📰 ${this.name}: Fetching from all sources...`);
        
        const fetchPromises = [];
        for (const [sourceId, source] of this.sources) {
            fetchPromises.push(this.fetchFromSource(sourceId, source));
        }
        
        await Promise.allSettled(fetchPromises);
    }

    // Fetch from a single source
    async fetchFromSource(sourceId, source) {
        try {
            const response = await axios.get(source.url, {
                headers: {
                    'User-Agent': 'GodBrainAI-NewsBot/1.0',
                    'If-Modified-Since': source.lastModified || ''
                },
                timeout: 10000
            });
            
            const articles = await this.parseSourceContent(response.data, source.type);
            
            for (const article of articles) {
                await this.processArticle(article, sourceId, source.authority);
            }
            
            source.lastModified = new Date().toUTCString();
            
        } catch (error) {
            console.error(`❌ ${this.name}: Failed to fetch from ${sourceId}:`, error.message);
        }
    }

    // Parse source content based on type
    async parseSourceContent(content, type) {
        const articles = [];
        
        if (type === 'rss') {
            // Simple RSS parsing (would use proper RSS parser in production)
            const items = content.match(/<item>(.*?)<\/item>/gs) || [];
            
            for (const item of items) {
                const title = this.extractTag(item, 'title');
                const description = this.extractTag(item, 'description');
                const link = this.extractTag(item, 'link');
                const pubDate = this.extractTag(item, 'pubDate');
                
                if (title && link) {
                    articles.push({
                        title,
                        description,
                        url: link,
                        publishedAt: new Date(pubDate || Date.now())
                    });
                }
            }
        }
        
        return articles;
    }

    // Extract tag content from XML
    extractTag(xml, tag) {
        const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\/${tag}>|<${tag}>(.*?)<\/${tag}>`, 's'));
        return match ? (match[1] || match[2] || '').trim() : '';
    }

    // Process a single article
    async processArticle(article, sourceId, authority) {
        // Generate unique ID
        const uid = this.generateArticleId(article.url);
        
        // Check for duplicates
        if (await this.isDuplicate(article)) {
            return;
        }
        
        // Normalize to canonical schema
        const normalized = await this.normalizeArticle(article, sourceId, authority);
        
        // Extract entities and tickers
        normalized.tickers = await this.extractTickers(normalized.title + ' ' + normalized.body);
        normalized.entities = await this.extractEntities(normalized.title + ' ' + normalized.body);
        
        // Calculate scores
        normalized.scores = await this.calculateScores(normalized);
        
        // Store article
        this.articles.set(uid, normalized);
        
        // Add to enrichment queue
        this.enrichmentQueue.push(normalized);
        
        // Emit event for GodBrain integration
        this.emit('article.new', normalized);
        
        console.log(`📰 New article: ${normalized.title.substring(0, 50)}...`);
    }

    // Generate unique article ID
    generateArticleId(url) {
        return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
    }

    // Check for duplicate articles
    async isDuplicate(article) {
        // Simple URL-based deduplication
        const hash = this.generateArticleId(article.url);
        
        if (this.deduplicationCache.has(hash)) {
            return true;
        }
        
        // SimHash for content similarity (simplified)
        const contentHash = crypto.createHash('sha256')
            .update(article.title + article.description)
            .digest('hex');
        
        for (const [existingHash, existingContent] of this.deduplicationCache) {
            if (this.calculateSimilarity(contentHash, existingContent) > 0.8) {
                return true;
            }
        }
        
        this.deduplicationCache.set(hash, contentHash);
        return false;
    }

    // Calculate content similarity
    calculateSimilarity(hash1, hash2) {
        // Simplified similarity calculation
        let matches = 0;
        for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
            if (hash1[i] === hash2[i]) matches++;
        }
        return matches / Math.max(hash1.length, hash2.length);
    }

    // Normalize article to canonical schema
    async normalizeArticle(article, sourceId, authority) {
        return {
            uid: this.generateArticleId(article.url),
            source: sourceId,
            url: article.url,
            publishedAt: article.publishedAt.toISOString(),
            detectedLang: 'en', // Would use language detection
            title: article.title,
            body: article.description,
            tickers: [],
            entities: [],
            topics: this.extractTopics(article.title + ' ' + article.description),
            region: ['US', 'Global'], // Would extract from content
            riskFlags: [],
            images: [],
            attribution: {
                byline: sourceId,
                license: 'fair_use'
            },
            scores: {
                authority: authority,
                novelty: 1.0,
                marketImpact: 0.5
            },
            translations: {},
            enriched: false
        };
    }

    // Extract stock tickers from text
    async extractTickers(text) {
        const tickers = [];
        // Simple pattern matching for tickers
        const tickerPattern = /\b([A-Z]{1,5})\b/g;
        const matches = text.match(tickerPattern) || [];
        
        for (const match of matches) {
            // Validate against known tickers
            if (this.isValidTicker(match)) {
                tickers.push(match);
            }
        }
        
        return [...new Set(tickers)];
    }

    // Validate ticker symbol
    isValidTicker(symbol) {
        // Common stock tickers (simplified list)
        const commonTickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'BAC', 'WMT'];
        return commonTickers.includes(symbol);
    }

    // Extract entities from text
    async extractEntities(text) {
        const entities = [];
        
        // Company names (simplified)
        const companies = {
            'Apple': 'AAPL',
            'Google': 'GOOGL',
            'Microsoft': 'MSFT',
            'Amazon': 'AMZN',
            'Meta': 'META',
            'Tesla': 'TSLA'
        };
        
        for (const [company, ticker] of Object.entries(companies)) {
            if (text.includes(company)) {
                entities.push({
                    type: 'company',
                    name: company,
                    symbol: ticker
                });
            }
        }
        
        return entities;
    }

    // Extract topics from text
    extractTopics(text) {
        const topics = [];
        const textLower = text.toLowerCase();
        
        // Topic keywords
        const topicKeywords = {
            'earnings': ['earnings', 'revenue', 'profit', 'quarterly'],
            'big_tech': ['apple', 'google', 'microsoft', 'amazon', 'meta'],
            'markets': ['stock', 'market', 'dow', 'nasdaq', 's&p'],
            'crypto': ['bitcoin', 'crypto', 'blockchain', 'ethereum'],
            'energy': ['oil', 'gas', 'renewable', 'energy', 'solar'],
            'africa': ['africa', 'nigeria', 'kenya', 'south africa']
        };
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        }
        
        return topics;
    }

    // Calculate article scores
    async calculateScores(article) {
        const now = Date.now();
        const publishTime = new Date(article.publishedAt).getTime();
        const ageHours = (now - publishTime) / (1000 * 60 * 60);
        
        return {
            authority: article.scores.authority,
            novelty: Math.max(0, 1 - (ageHours / 24)), // Decays over 24 hours
            marketImpact: this.calculateMarketImpact(article),
            recency: Math.exp(-ageHours / 6), // Exponential decay
            relevance: this.calculateRelevance(article)
        };
    }

    // Calculate market impact score
    calculateMarketImpact(article) {
        let impact = 0.5;
        
        // Keywords that indicate market impact
        const impactKeywords = ['surge', 'plunge', 'crash', 'rally', 'breakout', 'earnings beat', 'acquisition'];
        const textLower = (article.title + ' ' + article.body).toLowerCase();
        
        for (const keyword of impactKeywords) {
            if (textLower.includes(keyword)) {
                impact += 0.1;
            }
        }
        
        return Math.min(1.0, impact);
    }

    // Calculate relevance score
    calculateRelevance(article) {
        // Based on user preferences (simplified)
        return 0.7;
    }

    // Start enrichment processor
    startEnrichmentProcessor() {
        setInterval(async () => {
            if (this.enrichmentQueue.length > 0) {
                const article = this.enrichmentQueue.shift();
                await this.enrichArticle(article);
            }
        }, 1000);
    }

    // Enrich article with AI
    async enrichArticle(article) {
        if (!this.config.enrichmentEnabled) return;
        
        console.log(`🤖 ${this.name}: Enriching article "${article.title.substring(0, 30)}..."`);
        
        try {
            // Generate enrichments
            article.enrichments = {
                headline: this.generateHeadline(article),
                lede: this.generateLede(article),
                keyPoints: this.extractKeyPoints(article),
                whatItMeans: this.generateExplainer(article),
                riskNotes: this.assessRisks(article),
                tldr: this.generateTLDR(article),
                faq: this.generateFAQ(article)
            };
            
            // Generate translations
            article.translations = await this.translateArticle(article);
            
            article.enriched = true;
            
            // Emit enriched event for GodBrain
            this.emit('article.enriched', article);
            
            // Trigger GodBrain integration
            await this.notifyGodBrain(article);
            
        } catch (error) {
            console.error(`❌ ${this.name}: Enrichment failed:`, error.message);
        }
    }

    // Generate concise headline
    generateHeadline(article) {
        // Simplified - would use AI
        return article.title.substring(0, 80);
    }

    // Generate lede
    generateLede(article) {
        // Simplified - would use AI
        return article.body.substring(0, 160) + '...';
    }

    // Extract key points
    extractKeyPoints(article) {
        // Simplified - would use AI
        return [
            'Key market movement detected',
            'Impact on related sectors expected',
            'Analyst recommendations updated'
        ];
    }

    // Generate explainer
    generateExplainer(article) {
        return `This news affects investors by indicating potential market shifts. ` +
               `Monitor related stocks for opportunities.`;
    }

    // Assess risks
    assessRisks(article) {
        const risks = [];
        
        if (article.body.includes('rumor') || article.body.includes('unconfirmed')) {
            risks.push('unverified');
        }
        
        if (article.marketImpact > 0.7) {
            risks.push('price_sensitive');
        }
        
        return risks;
    }

    // Generate TL;DR
    generateTLDR(article) {
        return `${article.title}. Market impact: ${Math.round(article.scores.marketImpact * 100)}%. ` +
               `Key tickers: ${article.tickers.join(', ') || 'None identified'}.`;
    }

    // Generate FAQ
    generateFAQ(article) {
        return [
            {
                question: 'What does this mean for investors?',
                answer: this.generateExplainer(article)
            },
            {
                question: 'Which stocks are affected?',
                answer: `Primarily: ${article.tickers.join(', ') || 'Market-wide impact'}`
            },
            {
                question: 'Should I take action?',
                answer: 'Consult with a financial advisor for personalized advice.'
            }
        ];
    }

    // Translate article
    async translateArticle(article) {
        const translations = {};
        
        for (const lang of this.config.languages) {
            if (lang !== article.detectedLang) {
                translations[lang] = {
                    title: `[${lang}] ${article.title}`, // Would use actual translation
                    summary: `[${lang}] ${article.enrichments.lede}`
                };
            }
        }
        
        return translations;
    }

    // Notify GodBrain system
    async notifyGodBrain(article) {
        const event = {
            event: 'news.item.enriched.v1',
            payload: article,
            routes: [
                'BizBot.analyzeImpact',
                'WordBot.translate',
                'DevBot.publishStatic'
            ]
        };
        
        // Emit for GodBrain orchestrator
        this.emit('godbrain.event', event);
        
        console.log(`🔔 ${this.name}: Notified GodBrain about enriched article`);
    }

    // Get trending articles
    getTrendingArticles(limit = 10) {
        const articles = Array.from(this.articles.values());
        
        // Sort by composite score
        articles.sort((a, b) => {
            const scoreA = this.calculateCompositeScore(a);
            const scoreB = this.calculateCompositeScore(b);
            return scoreB - scoreA;
        });
        
        return articles.slice(0, limit);
    }

    // Calculate composite score for ranking
    calculateCompositeScore(article) {
        const scores = article.scores;
        
        return (
            scores.recency * this.rankingWeights.recency +
            scores.authority * this.rankingWeights.authority +
            scores.novelty * this.rankingWeights.novelty +
            scores.marketImpact * this.rankingWeights.marketImpact +
            scores.relevance * this.rankingWeights.userInterest
        );
    }

    // Get articles by ticker
    getArticlesByTicker(ticker) {
        const results = [];
        
        for (const article of this.articles.values()) {
            if (article.tickers.includes(ticker)) {
                results.push(article);
            }
        }
        
        return results;
    }

    // Get articles by topic
    getArticlesByTopic(topic) {
        const results = [];
        
        for (const article of this.articles.values()) {
            if (article.topics.includes(topic)) {
                results.push(article);
            }
        }
        
        return results;
    }

    // Generate market brief
    generateMarketBrief() {
        const trending = this.getTrendingArticles(5);
        
        return {
            timestamp: new Date().toISOString(),
            headlines: trending.map(a => ({
                title: a.title,
                impact: Math.round(a.scores.marketImpact * 100),
                tickers: a.tickers
            })),
            topTickers: this.getTopTickers(),
            marketSentiment: this.calculateMarketSentiment()
        };
    }

    // Get top mentioned tickers
    getTopTickers() {
        const tickerCount = new Map();
        
        for (const article of this.articles.values()) {
            for (const ticker of article.tickers) {
                tickerCount.set(ticker, (tickerCount.get(ticker) || 0) + 1);
            }
        }
        
        return Array.from(tickerCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([ticker, count]) => ({ ticker, mentions: count }));
    }

    // Calculate overall market sentiment
    calculateMarketSentiment() {
        let positive = 0;
        let negative = 0;
        let neutral = 0;
        
        for (const article of this.articles.values()) {
            const text = (article.title + ' ' + article.body).toLowerCase();
            
            if (text.includes('surge') || text.includes('rally') || text.includes('gain')) {
                positive++;
            } else if (text.includes('fall') || text.includes('drop') || text.includes('loss')) {
                negative++;
            } else {
                neutral++;
            }
        }
        
        const total = positive + negative + neutral;
        
        return {
            positive: Math.round((positive / total) * 100),
            negative: Math.round((negative / total) * 100),
            neutral: Math.round((neutral / total) * 100)
        };
    }

    // Get status
    getStatus() {
        return {
            name: this.name,
            version: this.version,
            statistics: {
                sources: this.sources.size,
                articles: this.articles.size,
                enrichmentQueue: this.enrichmentQueue.length,
                languages: this.config.languages,
                topics: this.config.topics
            },
            capabilities: [
                'rss_ingestion',
                'article_normalization',
                'deduplication',
                'entity_extraction',
                'ticker_linking',
                'ai_enrichment',
                'multilingual_translation',
                'market_analysis',
                'godbrain_integration'
            ]
        };
    }
}

module.exports = NewsBot;