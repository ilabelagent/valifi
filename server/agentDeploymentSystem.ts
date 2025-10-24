/**
 * Agent Deployment Automation System
 * Automated deployment, version management, canary releases, and rollback
 *
 * "The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5
 * Careful, automated deployments lead to stable, profitable systems
 */

import { storage } from "./storage";
import { agentFortificationWorkflow } from "./agentFortificationWorkflow";
import { agentLearningPipeline } from "./agentLearningPipeline";
import { EventEmitter } from "events";

export interface AgentVersion {
  id: string;
  agentType: string;
  version: string;
  buildNumber: number;
  status: "draft" | "testing" | "canary" | "deployed" | "deprecated" | "retired";
  code?: string; // Serialized agent code/config
  config?: any;
  dependencies?: string[];
  certificationLevel?: "bronze" | "silver" | "gold" | "platinum";
  deployedAt?: Date;
  retiredAt?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface DeploymentPlan {
  id: string;
  agentType: string;
  sourceVersion: string;
  targetVersion: string;
  strategy: "immediate" | "canary" | "blue-green" | "rolling";
  canaryPercent?: number;
  healthChecks: string[];
  rollbackOnFailure: boolean;
  requiredTests: string[];
  approvers?: string[];
  scheduledTime?: Date;
  status: "pending" | "in-progress" | "completed" | "failed" | "rolled-back";
  createdAt: Date;
}

export interface DeploymentEvent {
  deploymentId: string;
  timestamp: Date;
  type: "started" | "progress" | "health_check" | "rollback" | "completed" | "failed";
  message: string;
  data?: any;
}

export interface RollbackPlan {
  deploymentId: string;
  reason: string;
  targetVersion: string;
  automatic: boolean;
  timestamp: Date;
}

/**
 * Agent Deployment System
 * Manages versioning, deployment strategies, and rollbacks
 */
export class AgentDeploymentSystem extends EventEmitter {
  private versions: Map<string, AgentVersion[]> = new Map(); // agentType -> versions
  private deployments: Map<string, DeploymentPlan> = new Map();
  private activeVersions: Map<string, string> = new Map(); // agentType -> versionId
  private canaryTraffic: Map<string, Map<string, number>> = new Map(); // agentType -> versionId -> percentage

  constructor() {
    super();
  }

  /**
   * Create new agent version
   */
  async createVersion(
    agentType: string,
    code: string,
    config: any,
    createdBy: string
  ): Promise<AgentVersion> {
    const versions = this.versions.get(agentType) || [];
    const buildNumber = versions.length + 1;

    const version: AgentVersion = {
      id: `v${buildNumber}_${Date.now()}`,
      agentType,
      version: `v${buildNumber}`,
      buildNumber,
      status: "draft",
      code,
      config,
      createdAt: new Date(),
      createdBy,
    };

    versions.push(version);
    this.versions.set(agentType, versions);

    console.log(`[Deployment] Created version ${version.version} for ${agentType}`);
    this.emit("version-created", version);

    return version;
  }

  /**
   * Test version before deployment
   */
  async testVersion(versionId: string): Promise<boolean> {
    const version = this.findVersion(versionId);
    if (!version) throw new Error("Version not found");

    console.log(`[Deployment] Testing version ${version.version} for ${version.agentType}`);

    version.status = "testing";

    try {
      // Run fortification tests
      const report = await agentFortificationWorkflow.fortifyAgent(version.agentType);

      if (report.passed) {
        version.certificationLevel = report.certificationLevel;
        version.status = "canary";

        console.log(`[Deployment] Version ${version.version} passed tests with ${report.certificationLevel} certification`);
        this.emit("version-tested", { version, passed: true, report });

        return true;
      } else {
        version.status = "draft";

        console.log(`[Deployment] Version ${version.version} failed tests`);
        this.emit("version-tested", { version, passed: false, report });

        return false;
      }

    } catch (error: any) {
      version.status = "draft";
      console.error(`[Deployment] Testing error:`, error);
      this.emit("version-test-error", { version, error: error.message });

      return false;
    }
  }

  /**
   * Create deployment plan
   */
  async createDeploymentPlan(
    agentType: string,
    targetVersion: string,
    strategy: DeploymentPlan["strategy"],
    options?: Partial<DeploymentPlan>
  ): Promise<string> {
    const version = this.findVersionByName(agentType, targetVersion);
    if (!version) throw new Error("Target version not found");

    if (version.status !== "canary" && version.status !== "deployed") {
      throw new Error("Version must pass tests before deployment");
    }

    const currentVersion = this.activeVersions.get(agentType);

    const plan: DeploymentPlan = {
      id: `deploy_${Date.now()}`,
      agentType,
      sourceVersion: currentVersion || "none",
      targetVersion: version.id,
      strategy,
      canaryPercent: strategy === "canary" ? 10 : undefined,
      healthChecks: options?.healthChecks || ["response_time", "error_rate", "success_rate"],
      rollbackOnFailure: options?.rollbackOnFailure !== undefined ? options.rollbackOnFailure : true,
      requiredTests: options?.requiredTests || [],
      approvers: options?.approvers,
      scheduledTime: options?.scheduledTime,
      status: "pending",
      createdAt: new Date(),
    };

    this.deployments.set(plan.id, plan);

    console.log(`[Deployment] Created ${strategy} deployment plan for ${agentType}: ${plan.id}`);
    this.emit("deployment-plan-created", plan);

    return plan.id;
  }

  /**
   * Execute deployment
   */
  async deploy(deploymentId: string): Promise<boolean> {
    const plan = this.deployments.get(deploymentId);
    if (!plan) throw new Error("Deployment plan not found");

    plan.status = "in-progress";
    this.emitDeploymentEvent(deploymentId, "started", "Deployment started");

    try {
      switch (plan.strategy) {
        case "immediate":
          await this.executeImmediateDeployment(plan);
          break;
        case "canary":
          await this.executeCanaryDeployment(plan);
          break;
        case "blue-green":
          await this.executeBlueGreenDeployment(plan);
          break;
        case "rolling":
          await this.executeRollingDeployment(plan);
          break;
      }

      plan.status = "completed";
      this.emitDeploymentEvent(deploymentId, "completed", "Deployment completed successfully");

      // Update active version
      this.activeVersions.set(plan.agentType, plan.targetVersion);

      // Mark version as deployed
      const version = this.findVersion(plan.targetVersion);
      if (version) {
        version.status = "deployed";
        version.deployedAt = new Date();
      }

      console.log(`[Deployment] Deployment ${deploymentId} completed successfully`);
      return true;

    } catch (error: any) {
      console.error(`[Deployment] Deployment ${deploymentId} failed:`, error);

      plan.status = "failed";
      this.emitDeploymentEvent(deploymentId, "failed", error.message);

      // Rollback if enabled
      if (plan.rollbackOnFailure && plan.sourceVersion !== "none") {
        await this.rollback(deploymentId, "Deployment failed", true);
      }

      return false;
    }
  }

  /**
   * Execute immediate deployment
   */
  private async executeImmediateDeployment(plan: DeploymentPlan): Promise<void> {
    this.emitDeploymentEvent(plan.id, "progress", "Executing immediate deployment");

    // Simulate deployment
    await this.simulateDeployment(1000);

    this.emitDeploymentEvent(plan.id, "progress", "Deployment activated");
  }

  /**
   * Execute canary deployment
   */
  private async executeCanaryDeployment(plan: DeploymentPlan): Promise<void> {
    this.emitDeploymentEvent(plan.id, "progress", `Starting canary deployment (${plan.canaryPercent}% traffic)`);

    // Phase 1: Deploy to canary group
    const canaryPercent = plan.canaryPercent || 10;
    this.setCanaryTraffic(plan.agentType, plan.targetVersion, canaryPercent);

    await this.simulateDeployment(2000);
    this.emitDeploymentEvent(plan.id, "progress", `Canary deployed with ${canaryPercent}% traffic`);

    // Phase 2: Monitor health checks
    this.emitDeploymentEvent(plan.id, "health_check", "Running health checks on canary");

    const healthChecksPassed = await this.runHealthChecks(plan);

    if (!healthChecksPassed) {
      throw new Error("Canary health checks failed");
    }

    this.emitDeploymentEvent(plan.id, "health_check", "Canary health checks passed");

    // Phase 3: Gradual rollout
    const increments = [25, 50, 75, 100];

    for (const percent of increments) {
      this.setCanaryTraffic(plan.agentType, plan.targetVersion, percent);
      this.emitDeploymentEvent(plan.id, "progress", `Increased traffic to ${percent}%`);

      await this.simulateDeployment(2000);

      const healthOk = await this.runHealthChecks(plan);
      if (!healthOk) {
        throw new Error(`Health checks failed at ${percent}% traffic`);
      }
    }

    // Complete: Remove canary, full traffic to new version
    this.clearCanaryTraffic(plan.agentType);
  }

  /**
   * Execute blue-green deployment
   */
  private async executeBlueGreenDeployment(plan: DeploymentPlan): Promise<void> {
    this.emitDeploymentEvent(plan.id, "progress", "Deploying to green environment");

    // Deploy to green environment
    await this.simulateDeployment(2000);

    // Run health checks on green
    this.emitDeploymentEvent(plan.id, "health_check", "Testing green environment");

    const healthChecksPassed = await this.runHealthChecks(plan);

    if (!healthChecksPassed) {
      throw new Error("Green environment health checks failed");
    }

    // Switch traffic from blue to green
    this.emitDeploymentEvent(plan.id, "progress", "Switching traffic to green environment");

    await this.simulateDeployment(1000);

    this.emitDeploymentEvent(plan.id, "progress", "Traffic switched successfully");
  }

  /**
   * Execute rolling deployment
   */
  private async executeRollingDeployment(plan: DeploymentPlan): Promise<void> {
    const batches = 5; // 5 batches = 20% per batch

    for (let i = 1; i <= batches; i++) {
      const percentComplete = (i / batches) * 100;

      this.emitDeploymentEvent(plan.id, "progress", `Rolling out batch ${i}/${batches} (${percentComplete}%)`);

      await this.simulateDeployment(2000);

      // Health check after each batch
      const healthOk = await this.runHealthChecks(plan);

      if (!healthOk) {
        throw new Error(`Health checks failed at batch ${i}`);
      }
    }
  }

  /**
   * Run health checks
   */
  private async runHealthChecks(plan: DeploymentPlan): Promise<boolean> {
    for (const check of plan.healthChecks) {
      this.emitDeploymentEvent(plan.id, "health_check", `Running ${check}`);

      // Simulate health check
      await this.simulateDeployment(500);

      // In production, run actual health checks
      const passed = Math.random() > 0.1; // 90% pass rate

      if (!passed) {
        this.emitDeploymentEvent(plan.id, "health_check", `Health check failed: ${check}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Rollback deployment
   */
  async rollback(
    deploymentId: string,
    reason: string,
    automatic: boolean = false
  ): Promise<void> {
    const plan = this.deployments.get(deploymentId);
    if (!plan) throw new Error("Deployment plan not found");

    if (plan.sourceVersion === "none") {
      throw new Error("No previous version to rollback to");
    }

    console.log(`[Deployment] Rolling back deployment ${deploymentId}: ${reason}`);

    this.emitDeploymentEvent(deploymentId, "rollback", `Rolling back: ${reason}`);

    // Create rollback plan
    const rollbackPlan: RollbackPlan = {
      deploymentId,
      reason,
      targetVersion: plan.sourceVersion,
      automatic,
      timestamp: new Date(),
    };

    // Execute immediate rollback
    this.activeVersions.set(plan.agentType, plan.sourceVersion);

    // Clear canary traffic
    this.clearCanaryTraffic(plan.agentType);

    plan.status = "rolled-back";

    this.emitDeploymentEvent(deploymentId, "rollback", "Rollback completed");
    this.emit("deployment-rolled-back", rollbackPlan);
  }

  /**
   * Set canary traffic percentage
   */
  private setCanaryTraffic(agentType: string, versionId: string, percent: number): void {
    const traffic = this.canaryTraffic.get(agentType) || new Map();
    traffic.set(versionId, percent);
    this.canaryTraffic.set(agentType, traffic);
  }

  /**
   * Clear canary traffic
   */
  private clearCanaryTraffic(agentType: string): void {
    this.canaryTraffic.delete(agentType);
  }

  /**
   * Get version to use based on canary routing
   */
  getVersionForExecution(agentType: string): string {
    const canary = this.canaryTraffic.get(agentType);

    if (canary && canary.size > 0) {
      // Route based on canary percentage
      const random = Math.random() * 100;

      for (const [versionId, percent] of canary.entries()) {
        if (random < percent) {
          return versionId;
        }
      }
    }

    // Return active version
    return this.activeVersions.get(agentType) || "default";
  }

  /**
   * Emit deployment event
   */
  private emitDeploymentEvent(
    deploymentId: string,
    type: DeploymentEvent["type"],
    message: string,
    data?: any
  ): void {
    const event: DeploymentEvent = {
      deploymentId,
      timestamp: new Date(),
      type,
      message,
      data,
    };

    this.emit("deployment-event", event);
    this.emit(`deployment:${deploymentId}`, event);

    console.log(`[Deployment:${deploymentId}] ${type}: ${message}`);
  }

  /**
   * Simulate deployment delay
   */
  private async simulateDeployment(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Find version by ID
   */
  private findVersion(versionId: string): AgentVersion | undefined {
    for (const versions of this.versions.values()) {
      const version = versions.find(v => v.id === versionId);
      if (version) return version;
    }
    return undefined;
  }

  /**
   * Find version by name
   */
  private findVersionByName(agentType: string, versionName: string): AgentVersion | undefined {
    const versions = this.versions.get(agentType) || [];
    return versions.find(v => v.version === versionName);
  }

  /**
   * Get agent versions
   */
  getVersions(agentType: string): AgentVersion[] {
    return this.versions.get(agentType) || [];
  }

  /**
   * Get active version
   */
  getActiveVersion(agentType: string): AgentVersion | undefined {
    const versionId = this.activeVersions.get(agentType);
    return versionId ? this.findVersion(versionId) : undefined;
  }

  /**
   * Get deployment plan
   */
  getDeploymentPlan(deploymentId: string): DeploymentPlan | undefined {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get all deployment plans
   */
  getAllDeploymentPlans(): DeploymentPlan[] {
    return Array.from(this.deployments.values());
  }

  /**
   * Get deployment history for agent
   */
  getDeploymentHistory(agentType: string): DeploymentPlan[] {
    return Array.from(this.deployments.values())
      .filter(d => d.agentType === agentType)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Retire old version
   */
  async retireVersion(versionId: string): Promise<void> {
    const version = this.findVersion(versionId);
    if (!version) throw new Error("Version not found");

    version.status = "retired";
    version.retiredAt = new Date();

    console.log(`[Deployment] Retired version ${version.version} for ${version.agentType}`);
    this.emit("version-retired", version);
  }

  /**
   * Compare versions
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<any> {
    const v1 = this.findVersion(versionId1);
    const v2 = this.findVersion(versionId2);

    if (!v1 || !v2) throw new Error("Version not found");

    // Get metrics for both versions
    const metrics1 = await agentLearningPipeline.getLearningMetrics(v1.agentType);
    const metrics2 = await agentLearningPipeline.getLearningMetrics(v2.agentType);

    return {
      version1: {
        id: v1.id,
        version: v1.version,
        certificationLevel: v1.certificationLevel,
        metrics: metrics1,
      },
      version2: {
        id: v2.id,
        version: v2.version,
        certificationLevel: v2.certificationLevel,
        metrics: metrics2,
      },
      comparison: {
        successRateDiff: metrics2.successRate - metrics1.successRate,
        improvementRateDiff: metrics2.improvementRate - metrics1.improvementRate,
        certificationUpgrade: this.compareCertificationLevels(
          v1.certificationLevel,
          v2.certificationLevel
        ),
      },
    };
  }

  /**
   * Compare certification levels
   */
  private compareCertificationLevels(
    level1?: AgentVersion["certificationLevel"],
    level2?: AgentVersion["certificationLevel"]
  ): string {
    const levels = ["bronze", "silver", "gold", "platinum"];
    const index1 = level1 ? levels.indexOf(level1) : -1;
    const index2 = level2 ? levels.indexOf(level2) : -1;

    if (index2 > index1) return "upgrade";
    if (index2 < index1) return "downgrade";
    return "same";
  }

  /**
   * Subscribe to deployment events
   */
  subscribeToDeployment(deploymentId: string, callback: (event: DeploymentEvent) => void): void {
    this.on(`deployment:${deploymentId}`, callback);
  }

  /**
   * Unsubscribe from deployment events
   */
  unsubscribeFromDeployment(deploymentId: string, callback: (event: DeploymentEvent) => void): void {
    this.off(`deployment:${deploymentId}`, callback);
  }
}

export const agentDeploymentSystem = new AgentDeploymentSystem();
