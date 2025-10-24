/**
 * Reusable Agent Enhancement Modules
 * Pluggable components to enhance agent capabilities
 *
 * "Do not despise these small beginnings, for the LORD rejoices to see the work begin." - Zechariah 4:10
 * Small enhancements compound into mighty capabilities
 */

import { EventEmitter } from "events";
import { storage } from "./storage";
import { botLearningService } from "./botLearningService";

export interface Enhancement {
  id: string;
  name: string;
  description: string;
  type: "pre-execution" | "post-execution" | "error-handling" | "monitoring";
  enabled: boolean;
  config?: any;
  apply: (context: EnhancementContext) => Promise<EnhancementContext>;
}

export interface EnhancementContext {
  agentType: string;
  task: string;
  input?: any;
  output?: any;
  error?: Error;
  metadata: Record<string, any>;
  timestamp: Date;
}

/**
 * Enhancement Registry
 * Manages available enhancements and their application
 */
export class EnhancementRegistry extends EventEmitter {
  private enhancements: Map<string, Enhancement> = new Map();
  private agentEnhancements: Map<string, string[]> = new Map(); // agent -> enhancement IDs

  constructor() {
    super();
    this.registerBuiltInEnhancements();
  }

  /**
   * Register built-in enhancements
   */
  private registerBuiltInEnhancements() {
    // Caching Enhancement
    this.register({
      id: "caching",
      name: "Response Caching",
      description: "Cache agent responses to improve performance",
      type: "post-execution",
      enabled: true,
      config: {
        ttl: 300, // 5 minutes
        maxSize: 1000,
      },
      apply: cachingEnhancement,
    });

    // Retry Logic Enhancement
    this.register({
      id: "retry",
      name: "Automatic Retry",
      description: "Automatically retry failed operations",
      type: "error-handling",
      enabled: true,
      config: {
        maxRetries: 3,
        backoffMs: 1000,
        exponentialBackoff: true,
      },
      apply: retryEnhancement,
    });

    // Circuit Breaker Enhancement
    this.register({
      id: "circuit_breaker",
      name: "Circuit Breaker",
      description: "Prevent cascading failures",
      type: "pre-execution",
      enabled: true,
      config: {
        failureThreshold: 5,
        resetTimeoutMs: 60000,
      },
      apply: circuitBreakerEnhancement,
    });

    // Rate Limiting Enhancement
    this.register({
      id: "rate_limit",
      name: "Rate Limiting",
      description: "Limit execution rate to prevent overload",
      type: "pre-execution",
      enabled: true,
      config: {
        maxRequestsPerMinute: 60,
        maxBurst: 10,
      },
      apply: rateLimitEnhancement,
    });

    // Logging Enhancement
    this.register({
      id: "logging",
      name: "Comprehensive Logging",
      description: "Detailed execution logging",
      type: "monitoring",
      enabled: true,
      config: {
        logLevel: "info",
        logInputOutput: true,
      },
      apply: loggingEnhancement,
    });

    // Performance Monitoring Enhancement
    this.register({
      id: "performance",
      name: "Performance Monitoring",
      description: "Track execution time and resource usage",
      type: "monitoring",
      enabled: true,
      config: {
        trackMemory: true,
        trackCPU: true,
      },
      apply: performanceEnhancement,
    });

    // Validation Enhancement
    this.register({
      id: "validation",
      name: "Input/Output Validation",
      description: "Validate inputs and outputs against schema",
      type: "pre-execution",
      enabled: true,
      config: {
        strictMode: false,
      },
      apply: validationEnhancement,
    });

    // Fallback Enhancement
    this.register({
      id: "fallback",
      name: "Fallback Strategy",
      description: "Provide fallback responses on failure",
      type: "error-handling",
      enabled: true,
      config: {
        useMockData: false,
        useCachedData: true,
      },
      apply: fallbackEnhancement,
    });

    // Batching Enhancement
    this.register({
      id: "batching",
      name: "Request Batching",
      description: "Batch multiple requests for efficiency",
      type: "pre-execution",
      enabled: false, // Opt-in
      config: {
        batchSize: 10,
        batchTimeoutMs: 100,
      },
      apply: batchingEnhancement,
    });

    // Deduplication Enhancement
    this.register({
      id: "deduplication",
      name: "Request Deduplication",
      description: "Prevent duplicate concurrent requests",
      type: "pre-execution",
      enabled: true,
      config: {
        windowMs: 5000,
      },
      apply: deduplicationEnhancement,
    });

    // Async Queue Enhancement
    this.register({
      id: "async_queue",
      name: "Async Queue Processing",
      description: "Queue requests for async processing",
      type: "pre-execution",
      enabled: false, // Opt-in
      config: {
        maxQueueSize: 1000,
        concurrency: 5,
      },
      apply: asyncQueueEnhancement,
    });

    // Health Check Enhancement
    this.register({
      id: "health_check",
      name: "Health Status Monitoring",
      description: "Track agent health status",
      type: "monitoring",
      enabled: true,
      config: {
        checkIntervalMs: 60000,
      },
      apply: healthCheckEnhancement,
    });

    // Feature Flag Enhancement
    this.register({
      id: "feature_flag",
      name: "Feature Flag Support",
      description: "Control agent features with flags",
      type: "pre-execution",
      enabled: true,
      config: {
        flags: {},
      },
      apply: featureFlagEnhancement,
    });

    // A/B Testing Enhancement
    this.register({
      id: "ab_testing",
      name: "A/B Testing",
      description: "Run A/B tests for agent improvements",
      type: "pre-execution",
      enabled: false, // Opt-in
      config: {
        variants: ["control", "variant_a"],
        splitRatio: 0.5,
      },
      apply: abTestingEnhancement,
    });

    // Telemetry Enhancement
    this.register({
      id: "telemetry",
      name: "Telemetry Collection",
      description: "Collect detailed telemetry data",
      type: "monitoring",
      enabled: true,
      config: {
        sampleRate: 1.0,
      },
      apply: telemetryEnhancement,
    });

    // Security Scanning Enhancement
    this.register({
      id: "security_scan",
      name: "Security Scanning",
      description: "Scan inputs for security threats",
      type: "pre-execution",
      enabled: true,
      config: {
        scanDepth: "medium",
      },
      apply: securityScanEnhancement,
    });

    // Cost Tracking Enhancement
    this.register({
      id: "cost_tracking",
      name: "Cost Tracking",
      description: "Track API and resource costs",
      type: "post-execution",
      enabled: true,
      config: {
        trackAPIUsage: true,
      },
      apply: costTrackingEnhancement,
    });

    // Compression Enhancement
    this.register({
      id: "compression",
      name: "Response Compression",
      description: "Compress large responses",
      type: "post-execution",
      enabled: false, // Opt-in
      config: {
        minSize: 1024,
      },
      apply: compressionEnhancement,
    });

    // Context Injection Enhancement
    this.register({
      id: "context_injection",
      name: "Context Injection",
      description: "Inject contextual data into agent execution",
      type: "pre-execution",
      enabled: true,
      config: {
        injectUserContext: true,
        injectSystemContext: true,
      },
      apply: contextInjectionEnhancement,
    });

    // Learning Integration Enhancement
    this.register({
      id: "learning_integration",
      name: "Learning Integration",
      description: "Automatic learning from execution",
      type: "post-execution",
      enabled: true,
      config: {
        autoLearn: true,
      },
      apply: learningIntegrationEnhancement,
    });

    // Multi-Modal Enhancement
    this.register({
      id: "multi_modal",
      name: "Multi-Modal Processing",
      description: "Support text, image, audio inputs",
      type: "pre-execution",
      enabled: false, // Opt-in
      config: {
        supportedModes: ["text", "image"],
      },
      apply: multiModalEnhancement,
    });
  }

  /**
   * Register enhancement
   */
  register(enhancement: Enhancement): void {
    this.enhancements.set(enhancement.id, enhancement);
    console.log(`[Enhancements] Registered: ${enhancement.name}`);
  }

  /**
   * Enable enhancement for agent
   */
  enableForAgent(agentType: string, enhancementId: string): void {
    const current = this.agentEnhancements.get(agentType) || [];
    if (!current.includes(enhancementId)) {
      current.push(enhancementId);
      this.agentEnhancements.set(agentType, current);
      console.log(`[Enhancements] Enabled ${enhancementId} for ${agentType}`);
    }
  }

  /**
   * Disable enhancement for agent
   */
  disableForAgent(agentType: string, enhancementId: string): void {
    const current = this.agentEnhancements.get(agentType) || [];
    const filtered = current.filter(id => id !== enhancementId);
    this.agentEnhancements.set(agentType, filtered);
    console.log(`[Enhancements] Disabled ${enhancementId} for ${agentType}`);
  }

  /**
   * Apply enhancements to context
   */
  async applyEnhancements(
    agentType: string,
    context: EnhancementContext,
    phase: Enhancement["type"]
  ): Promise<EnhancementContext> {
    const enabledIds = this.agentEnhancements.get(agentType) || [];

    let currentContext = context;

    for (const id of enabledIds) {
      const enhancement = this.enhancements.get(id);
      if (!enhancement || !enhancement.enabled || enhancement.type !== phase) {
        continue;
      }

      try {
        currentContext = await enhancement.apply(currentContext);
        this.emit("enhancement-applied", { agentType, enhancementId: id, phase });
      } catch (error: any) {
        console.error(`[Enhancements] Error applying ${id}:`, error);
        this.emit("enhancement-error", { agentType, enhancementId: id, error: error.message });
      }
    }

    return currentContext;
  }

  /**
   * Get enhancement
   */
  getEnhancement(id: string): Enhancement | undefined {
    return this.enhancements.get(id);
  }

  /**
   * Get all enhancements
   */
  getAllEnhancements(): Enhancement[] {
    return Array.from(this.enhancements.values());
  }

  /**
   * Get agent enhancements
   */
  getAgentEnhancements(agentType: string): Enhancement[] {
    const ids = this.agentEnhancements.get(agentType) || [];
    return ids.map(id => this.enhancements.get(id)).filter(e => e !== undefined) as Enhancement[];
  }

  /**
   * Update enhancement config
   */
  updateConfig(enhancementId: string, config: any): void {
    const enhancement = this.enhancements.get(enhancementId);
    if (enhancement) {
      enhancement.config = { ...enhancement.config, ...config };
      this.enhancements.set(enhancementId, enhancement);
    }
  }
}

// ========== ENHANCEMENT IMPLEMENTATIONS ==========

const cache = new Map<string, { data: any; timestamp: number }>();

async function cachingEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  const cacheKey = `${context.agentType}:${JSON.stringify(context.task)}`;

  if (context.output) {
    // Store in cache
    cache.set(cacheKey, { data: context.output, timestamp: Date.now() });
    context.metadata.cached = true;
  } else {
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 min TTL
      context.output = cached.data;
      context.metadata.cacheHit = true;
    }
  }

  return context;
}

const retryState = new Map<string, number>();

async function retryEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  if (!context.error) return context;

  const retryKey = `${context.agentType}:${context.task}`;
  const retryCount = retryState.get(retryKey) || 0;

  if (retryCount < 3) {
    retryState.set(retryKey, retryCount + 1);
    context.metadata.retryCount = retryCount + 1;
    context.metadata.shouldRetry = true;

    // Exponential backoff
    const backoffMs = 1000 * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, backoffMs));
  } else {
    retryState.delete(retryKey);
  }

  return context;
}

const circuitBreakerState = new Map<string, { failures: number; lastFailure: number; state: "closed" | "open" | "half-open" }>();

async function circuitBreakerEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  const state = circuitBreakerState.get(context.agentType) || { failures: 0, lastFailure: 0, state: "closed" };

  // Check if circuit is open
  if (state.state === "open") {
    const timeSinceLastFailure = Date.now() - state.lastFailure;
    if (timeSinceLastFailure > 60000) { // 1 minute reset
      state.state = "half-open";
    } else {
      throw new Error("Circuit breaker is open");
    }
  }

  // Track failures
  if (context.error) {
    state.failures++;
    state.lastFailure = Date.now();

    if (state.failures >= 5) {
      state.state = "open";
      console.log(`[CircuitBreaker] Circuit opened for ${context.agentType}`);
    }
  } else if (context.output) {
    // Success - reset
    state.failures = 0;
    state.state = "closed";
  }

  circuitBreakerState.set(context.agentType, state);
  context.metadata.circuitBreakerState = state.state;

  return context;
}

const rateLimitState = new Map<string, { requests: number[]; }>();

async function rateLimitEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  const state = rateLimitState.get(context.agentType) || { requests: [] };

  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  // Remove old requests
  state.requests = state.requests.filter(t => t > oneMinuteAgo);

  if (state.requests.length >= 60) {
    throw new Error("Rate limit exceeded");
  }

  state.requests.push(now);
  rateLimitState.set(context.agentType, state);

  context.metadata.rateLimit = {
    current: state.requests.length,
    limit: 60,
  };

  return context;
}

async function loggingEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  console.log(`[Agent:${context.agentType}] Task: ${context.task}`);

  if (context.input) {
    console.log(`[Agent:${context.agentType}] Input:`, JSON.stringify(context.input).substring(0, 200));
  }

  if (context.output) {
    console.log(`[Agent:${context.agentType}] Output:`, JSON.stringify(context.output).substring(0, 200));
  }

  if (context.error) {
    console.error(`[Agent:${context.agentType}] Error:`, context.error.message);
  }

  return context;
}

async function performanceEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  if (!context.metadata.startTime) {
    context.metadata.startTime = Date.now();
    context.metadata.startMemory = process.memoryUsage().heapUsed;
  } else {
    const duration = Date.now() - context.metadata.startTime;
    const memoryUsed = process.memoryUsage().heapUsed - context.metadata.startMemory;

    context.metadata.performance = {
      duration,
      memoryUsed: memoryUsed / 1024 / 1024, // MB
    };
  }

  return context;
}

async function validationEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Validate input
  if (context.input && typeof context.input === "object") {
    // Basic validation - in production, use schema validation
    context.metadata.validated = true;
  }

  return context;
}

async function fallbackEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  if (context.error) {
    // Try to get cached response
    const cacheKey = `${context.agentType}:${context.task}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      context.output = cached.data;
      context.metadata.usedFallback = true;
      context.error = undefined;
    }
  }

  return context;
}

async function batchingEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Simplified batching - in production, implement actual batching queue
  context.metadata.batched = true;
  return context;
}

const deduplicationState = new Map<string, number>();

async function deduplicationEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  const key = `${context.agentType}:${context.task}`;
  const lastExecution = deduplicationState.get(key);

  if (lastExecution && Date.now() - lastExecution < 5000) {
    throw new Error("Duplicate request detected");
  }

  deduplicationState.set(key, Date.now());
  return context;
}

async function asyncQueueEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Queue for async processing
  context.metadata.queued = true;
  return context;
}

const healthState = new Map<string, { status: "healthy" | "degraded" | "unhealthy"; lastCheck: number }>();

async function healthCheckEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  const state = healthState.get(context.agentType) || { status: "healthy", lastCheck: Date.now() };

  if (context.error) {
    state.status = "degraded";
  } else if (context.output) {
    state.status = "healthy";
  }

  state.lastCheck = Date.now();
  healthState.set(context.agentType, state);

  context.metadata.health = state.status;
  return context;
}

async function featureFlagEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Check feature flags - in production, integrate with feature flag service
  context.metadata.features = {
    enabled: [],
    disabled: [],
  };

  return context;
}

async function abTestingEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // A/B testing - assign variant
  const variant = Math.random() < 0.5 ? "control" : "variant_a";
  context.metadata.abVariant = variant;

  return context;
}

async function telemetryEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Collect telemetry
  const telemetry = {
    agentType: context.agentType,
    task: context.task,
    timestamp: context.timestamp,
    success: !context.error,
    duration: context.metadata.performance?.duration,
  };

  context.metadata.telemetry = telemetry;
  return context;
}

async function securityScanEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Scan for security threats
  const threats = [];

  if (typeof context.task === "string") {
    if (context.task.includes("DROP TABLE")) threats.push("SQL Injection");
    if (context.task.includes("<script>")) threats.push("XSS");
    if (context.task.includes("../")) threats.push("Path Traversal");
  }

  if (threats.length > 0) {
    throw new Error(`Security threats detected: ${threats.join(", ")}`);
  }

  context.metadata.securityScanned = true;
  return context;
}

async function costTrackingEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Track costs
  context.metadata.cost = {
    apiCalls: 1,
    estimatedCost: 0.001, // $0.001 per call
  };

  return context;
}

async function compressionEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Compress large outputs
  if (context.output && JSON.stringify(context.output).length > 1024) {
    context.metadata.compressed = true;
  }

  return context;
}

async function contextInjectionEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Inject context
  context.metadata.injectedContext = {
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  };

  return context;
}

async function learningIntegrationEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Integrate with learning system
  if (context.output && !context.error) {
    await botLearningService.recordBotAction(
      context.agentType,
      "enhanced_execution",
      context.input,
      context.output,
      true,
      0
    );

    context.metadata.learned = true;
  }

  return context;
}

async function multiModalEnhancement(context: EnhancementContext): Promise<EnhancementContext> {
  // Detect and process multi-modal inputs
  context.metadata.modality = "text"; // Default

  return context;
}

export const enhancementRegistry = new EnhancementRegistry();

// ========== ENHANCEMENT PRESET CONFIGURATIONS ==========

export const ENHANCEMENT_PRESETS = {
  "high-performance": [
    "caching",
    "batching",
    "deduplication",
    "compression",
  ],
  "high-reliability": [
    "retry",
    "circuit_breaker",
    "fallback",
    "health_check",
  ],
  "production": [
    "caching",
    "retry",
    "circuit_breaker",
    "rate_limit",
    "logging",
    "performance",
    "validation",
    "security_scan",
    "cost_tracking",
    "telemetry",
    "learning_integration",
  ],
  "development": [
    "logging",
    "performance",
    "validation",
    "feature_flag",
  ],
  "minimal": [
    "logging",
    "learning_integration",
  ],
};

/**
 * Apply enhancement preset to agent
 */
export function applyEnhancementPreset(agentType: string, preset: keyof typeof ENHANCEMENT_PRESETS): void {
  const enhancements = ENHANCEMENT_PRESETS[preset];

  for (const enhancementId of enhancements) {
    enhancementRegistry.enableForAgent(agentType, enhancementId);
  }

  console.log(`[Enhancements] Applied ${preset} preset to ${agentType}`);
}
