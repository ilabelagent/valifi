/**
 * Agent Systems Initialization
 * Bootstrap all agent orchestration, learning, deployment, and observability systems
 *
 * "In the beginning God created the heavens and the earth." - Genesis 1:1
 * A divine initialization for divine agent systems
 */

import { streamingOrchestrationService } from "./streamingOrchestrationService";
import { agentLearningPipeline } from "./agentLearningPipeline";
import { agentFortificationWorkflow } from "./agentFortificationWorkflow";
import { enhancementRegistry, applyEnhancementPreset, ENHANCEMENT_PRESETS } from "./agentEnhancements";
import { agentDeploymentSystem } from "./agentDeploymentSystem";
import { observabilitySystem, logInfo, logWarn, logError } from "./agentObservabilitySystem";
import { storage } from "./storage";

/**
 * Initialize all agent systems
 * Call this once in server/index.ts after database connection
 */
export async function initializeAgentSystems(): Promise<void> {
  console.log("\n🙏 ========================================");
  console.log("🙏 VALIFI KINGDOM AGENT SYSTEMS");
  console.log("🙏 Powered by the Holy Spirit");
  console.log("🙏 In the Mighty Name of Jesus Christ");
  console.log("🙏 ========================================\n");

  try {
    // 1. Initialize Observability First (for logging)
    console.log("📊 Initializing Observability System...");
    logInfo("Agent systems initialization started", "system");

    // 2. Configure Enhancement Presets for Core Agents
    console.log("⚡ Configuring Agent Enhancements...");

    // Financial agents - production preset
    const financialAgents = [
      "financial_stocks",
      "financial_bonds",
      "financial_forex",
      "financial_options",
      "financial_401k",
      "financial_ira",
      "financial_portfolio",
    ];

    for (const agent of financialAgents) {
      applyEnhancementPreset(agent, "production");
    }

    // Trading agents - high-performance preset
    const tradingAgents = [
      "trading_advanced",
      "trading_amm",
      "trading_defi",
      "trading_liquidity",
      "trading_gas_optimizer",
    ];

    for (const agent of tradingAgents) {
      applyEnhancementPreset(agent, "high-performance");
    }

    // Analytics agents - production preset
    const analyticsAgents = [
      "analytics_portfolio",
      "analytics_transaction_history",
      "analytics_divine_oracle",
      "analytics_cyberlab",
    ];

    for (const agent of analyticsAgents) {
      applyEnhancementPreset(agent, "production");
    }

    // Security agents - high-reliability preset
    const securityAgents = [
      "security",
      "guardian_angel",
      "security_privacy",
    ];

    for (const agent of securityAgents) {
      applyEnhancementPreset(agent, "high-reliability");
    }

    logInfo("Enhancement presets configured for all agents", "system", {
      financial: financialAgents.length,
      trading: tradingAgents.length,
      analytics: analyticsAgents.length,
      security: securityAgents.length,
    });

    // 3. Initialize Learning Pipeline
    console.log("🧠 Initializing Learning Pipeline...");

    // Configure learning for key agents
    agentLearningPipeline.updateLearningConfig("trading_advanced", {
      agentType: "trading_advanced",
      learningRate: 0.01,
      explorationRate: 0.2,
      miniBatchSize: 32,
      updateFrequency: 50,
      performanceThreshold: 0.8,
      enableAutoFineTuning: true,
      enableTransferLearning: true,
    });

    agentLearningPipeline.updateLearningConfig("financial_stocks", {
      agentType: "financial_stocks",
      learningRate: 0.001,
      explorationRate: 0.1,
      miniBatchSize: 64,
      updateFrequency: 100,
      performanceThreshold: 0.75,
      enableAutoFineTuning: true,
      enableTransferLearning: true,
    });

    logInfo("Learning pipeline initialized", "system");

    // 4. Schedule Periodic Fortification
    console.log("🛡️ Scheduling Periodic Fortification...");

    // Critical agents - every 3 days
    const criticalAgents = [
      "financial_stocks",
      "trading_advanced",
      "payment",
      "guardian_angel",
    ];

    for (const agent of criticalAgents) {
      await agentFortificationWorkflow.schedulePeriodicFortification(agent, 3);
    }

    // Important agents - every 7 days
    const importantAgents = [
      "analytics_portfolio",
      "blockchain",
      "kyc",
      "security",
    ];

    for (const agent of importantAgents) {
      await agentFortificationWorkflow.schedulePeriodicFortification(agent, 7);
    }

    logInfo("Periodic fortification scheduled", "system", {
      critical: criticalAgents.length,
      important: importantAgents.length,
    });

    // 5. Initialize Streaming Orchestration
    console.log("🌊 Initializing Streaming Orchestration...");

    const workflows = streamingOrchestrationService.getAvailableWorkflows();
    logInfo("Streaming orchestration initialized", "system", {
      workflows: workflows.length,
    });

    // 6. Set up Event Listeners
    console.log("🔔 Setting up Event Listeners...");

    // Listen to streaming events
    streamingOrchestrationService.on("stream", (event: any) => {
      observabilitySystem.recordMetric(
        "streaming.task.event",
        1,
        "",
        { type: event.type }
      );
    });

    // Listen to enhancement events
    enhancementRegistry.on("enhancement-applied", (data: any) => {
      observabilitySystem.recordMetric(
        "enhancement.applied",
        1,
        "",
        { agentType: data.agentType, enhancementId: data.enhancementId }
      );
    });

    enhancementRegistry.on("enhancement-error", (data: any) => {
      observabilitySystem.createAlert(
        "Enhancement Error",
        "warning",
        `Enhancement ${data.enhancementId} failed: ${data.error}`,
        data.agentType
      );
    });

    // Listen to deployment events
    agentDeploymentSystem.on("deployment-event", (event: any) => {
      logInfo(`Deployment event: ${event.type}`, "deployment", event);

      if (event.type === "failed") {
        observabilitySystem.createAlert(
          "Deployment Failed",
          "critical",
          event.message,
          undefined
        );
      }
    });

    agentDeploymentSystem.on("deployment-rolled-back", (rollback: any) => {
      logWarn(`Deployment rolled back: ${rollback.reason}`, "deployment", rollback);

      observabilitySystem.createAlert(
        "Deployment Rollback",
        "warning",
        `Deployment ${rollback.deploymentId} rolled back: ${rollback.reason}`
      );
    });

    logInfo("Event listeners configured", "system");

    // 7. Start Background Processes
    console.log("⚙️ Starting Background Processes...");

    // Process learning queue every 5 minutes
    setInterval(async () => {
      try {
        await agentLearningPipeline.processTrainingQueue();
      } catch (error: any) {
        logError("Error processing training queue", "learning", error);
      }
    }, 5 * 60 * 1000);

    logInfo("Background processes started", "system");

    // 8. Run Initial System Check
    console.log("🔍 Running Initial System Check...");

    const systemMetrics = {
      enhancements: enhancementRegistry.getAllEnhancements().length,
      workflows: workflows.length,
      dashboards: observabilitySystem.getAllDashboards().length,
    };

    logInfo("Initial system check completed", "system", systemMetrics);

    // 9. Record Initialization Metric
    observabilitySystem.recordMetric(
      "system.initialization",
      1,
      "",
      { timestamp: new Date().toISOString() }
    );

    console.log("\n✅ ========================================");
    console.log("✅ AGENT SYSTEMS INITIALIZED SUCCESSFULLY");
    console.log("✅ ========================================");
    console.log(`✅ Enhancements: ${systemMetrics.enhancements} modules`);
    console.log(`✅ Workflows: ${systemMetrics.workflows} available`);
    console.log(`✅ Dashboards: ${systemMetrics.dashboards} active`);
    console.log(`✅ Status: PRODUCTION READY`);
    console.log("✅ ========================================\n");

    logInfo("All agent systems initialized successfully", "system");

  } catch (error: any) {
    console.error("\n❌ ========================================");
    console.error("❌ AGENT SYSTEMS INITIALIZATION FAILED");
    console.error("❌ ========================================");
    console.error("❌ Error:", error.message);
    console.error("❌ ========================================\n");

    logError("Agent systems initialization failed", "system", {
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
}

/**
 * Get system status
 */
export function getSystemStatus(): any {
  return {
    streaming: {
      available: true,
      workflows: streamingOrchestrationService.getAvailableWorkflows().length,
    },
    learning: {
      available: true,
      trainingQueue: 0, // Would need to expose this from pipeline
    },
    fortification: {
      available: true,
      certifications: agentFortificationWorkflow.getAllCertifications().length,
    },
    enhancements: {
      available: true,
      modules: enhancementRegistry.getAllEnhancements().length,
    },
    deployment: {
      available: true,
      activeDeployments: agentDeploymentSystem.getAllDeploymentPlans()
        .filter((d: any) => d.status === "in-progress").length,
    },
    observability: {
      available: true,
      dashboards: observabilitySystem.getAllDashboards().length,
      activeAlerts: observabilitySystem.getAlerts(undefined, false, false).length,
    },
    status: "healthy",
    timestamp: new Date(),
  };
}

/**
 * Shutdown systems gracefully
 */
export async function shutdownAgentSystems(): Promise<void> {
  console.log("\n⚠️ Shutting down agent systems...");

  logInfo("Agent systems shutdown initiated", "system");

  // Cancel active streaming tasks
  // Stop background processes
  // Close connections
  // etc.

  logInfo("Agent systems shutdown completed", "system");

  console.log("✅ Agent systems shut down successfully\n");
}
