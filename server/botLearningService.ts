import { storage } from "./storage";
import type { 
  InsertBotTrainingData, 
  InsertTradingSystemMemory, 
  InsertBotSkill, 
  InsertBotLearningSession 
} from "@shared/schema";

/**
 * Bot Learning Service - Persistent Intelligence System
 * Enables bots to learn and improve over time through:
 * - Training data recording
 * - Memory consolidation
 * - Skill progression
 * - Learning sessions with performance tracking
 */

const SKILL_XP_THRESHOLDS: Record<number, number> = {
  0: 100,    // Level 0 -> 1
  1: 250,    // Level 1 -> 2
  2: 500,    // Level 2 -> 3
  3: 1000,   // Level 3 -> 4
  4: 2000,   // Level 4 -> 5
  5: 4000,   // Level 5 -> 6
  6: 8000,   // Level 6 -> 7
  7: 16000,  // Level 7 -> 8
  8: 32000,  // Level 8 -> 9
  9: 64000,  // Level 9 -> 10
};

const CONFIDENCE_ADJUSTMENT = {
  SUCCESS_INCREASE: 5,
  FAILURE_DECREASE: 3,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 100,
};

export class BotLearningService {
  /**
   * Record bot action for training data
   * Stores input/output pairs with success metrics and rewards
   */
  async recordBotAction(
    botId: string,
    action: string,
    input: any,
    output: any,
    success: boolean,
    reward: number = 0
  ): Promise<void> {
    try {
      const trainingData: InsertBotTrainingData = {
        botId,
        dataType: action,
        input,
        expectedOutput: null,
        actualOutput: output,
        reward: reward.toString(),
      };

      await storage.createBotTrainingData(trainingData);

      console.log(`[BotLearning] Recorded action for bot ${botId}: ${action} (success: ${success}, reward: ${reward})`);
    } catch (error) {
      console.error(`[BotLearning] Failed to record bot action:`, error);
    }
  }

  /**
   * Update bot memory bank with consolidation
   * High-success patterns get reinforced, failures reduce confidence
   */
  async updateBotMemory(
    botId: string,
    memoryType: string,
    key: string,
    value: any,
    confidence: number = 50
  ): Promise<void> {
    try {
      const existingMemory = await storage.getTradingSystemMemoryByKey(botId, memoryType, key);

      if (existingMemory) {
        const currentConfidence = parseFloat(existingMemory.confidence || "0");
        const currentSuccessRate = parseFloat(existingMemory.successRate || "0");
        const usageCount = (existingMemory.usageCount || 0) + 1;

        const newConfidence = Math.min(
          CONFIDENCE_ADJUSTMENT.MAX_CONFIDENCE,
          Math.max(
            CONFIDENCE_ADJUSTMENT.MIN_CONFIDENCE,
            currentConfidence + (confidence > 50 ? CONFIDENCE_ADJUSTMENT.SUCCESS_INCREASE : -CONFIDENCE_ADJUSTMENT.FAILURE_DECREASE)
          )
        );

        const newSuccessRate = ((currentSuccessRate * (usageCount - 1)) + (confidence > 50 ? 100 : 0)) / usageCount;

        await storage.updateTradingSystemMemory(existingMemory.id, {
          memoryValue: value,
          confidence: newConfidence.toString(),
          successRate: newSuccessRate.toString(),
          usageCount,
        });

        console.log(`[BotLearning] Updated memory for bot ${botId}: ${memoryType}/${key} (confidence: ${newConfidence.toFixed(2)}%)`);
      } else {
        const memory: InsertTradingSystemMemory = {
          botId,
          memoryType,
          memoryKey: key,
          memoryValue: value,
          confidence: confidence.toString(),
          usageCount: 1,
          successRate: confidence > 50 ? "100" : "0",
        };

        await storage.createTradingSystemMemory(memory);
        console.log(`[BotLearning] Created new memory for bot ${botId}: ${memoryType}/${key}`);
      }
    } catch (error) {
      console.error(`[BotLearning] Failed to update bot memory:`, error);
    }
  }

  /**
   * Progress bot skill with XP
   * Automatically levels up when XP threshold is reached
   */
  async progressBotSkill(
    botId: string,
    skillName: string,
    xpGained: number,
    category: string = "general"
  ): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
    try {
      const skills = await storage.getBotSkills(botId);
      const existingSkill = skills.find(s => s.skillName === skillName);

      if (existingSkill) {
        const currentXP = existingSkill.experiencePoints || 0;
        const currentLevel = existingSkill.skillLevel || 0;
        const newXP = currentXP + xpGained;

        const threshold = SKILL_XP_THRESHOLDS[currentLevel] || 100000;
        const leveledUp = newXP >= threshold;
        const newLevel = leveledUp ? currentLevel + 1 : currentLevel;
        const finalXP = leveledUp ? newXP - threshold : newXP;

        await storage.updateBotSkill(existingSkill.id, {
          experiencePoints: finalXP,
          skillLevel: newLevel,
          lastUsedAt: new Date(),
        });

        if (leveledUp) {
          console.log(`[BotLearning] 🎉 Bot ${botId} skill "${skillName}" leveled up to ${newLevel}!`);
        }

        return { leveledUp, newLevel, newXP: finalXP };
      } else {
        const skill: InsertBotSkill = {
          botId,
          skillName,
          skillLevel: 0,
          category,
          experiencePoints: xpGained,
          lastUsedAt: new Date(),
        };

        await storage.createBotSkill(skill);
        console.log(`[BotLearning] Created new skill for bot ${botId}: ${skillName} (+${xpGained} XP)`);

        return { leveledUp: false, newLevel: 0, newXP: xpGained };
      }
    } catch (error) {
      console.error(`[BotLearning] Failed to progress bot skill:`, error);
      return { leveledUp: false, newLevel: 0, newXP: 0 };
    }
  }

  /**
   * Start a learning session
   * Captures initial performance for comparison
   */
  async startLearningSession(
    botId: string,
    sessionType: "supervised" | "reinforcement" | "transfer",
    trainingDataset?: string
  ): Promise<string | null> {
    try {
      const bot = await storage.getBot(botId);
      if (!bot) {
        console.error(`[BotLearning] Bot ${botId} not found`);
        return null;
      }

      const performanceBefore = {
        winRate: parseFloat(bot.winRate || "0"),
        totalProfit: parseFloat(bot.totalProfit || "0"),
        totalLoss: parseFloat(bot.totalLoss || "0"),
        totalTrades: bot.totalTrades || 0,
        timestamp: new Date().toISOString(),
      };

      const session: InsertBotLearningSession = {
        botId,
        sessionType,
        trainingDataset,
        status: "training",
        performanceBefore,
        performanceAfter: null,
        improvementRate: null,
        completedAt: null,
      };

      const createdSession = await storage.createBotLearningSession(session);
      console.log(`[BotLearning] Started ${sessionType} learning session for bot ${botId}: ${createdSession.id}`);

      return createdSession.id;
    } catch (error) {
      console.error(`[BotLearning] Failed to start learning session:`, error);
      return null;
    }
  }

  /**
   * Complete learning session
   * Calculates improvement rate and updates session
   */
  async completeLearningSession(
    sessionId: string,
    performanceAfter: any
  ): Promise<{ improved: boolean; improvementRate: number }> {
    try {
      const sessions = await storage.getBotLearningSessions("");
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        console.error(`[BotLearning] Session ${sessionId} not found`);
        return { improved: false, improvementRate: 0 };
      }

      const performanceBefore = session.performanceBefore as any;
      const winRateBefore = performanceBefore?.winRate || 0;
      const winRateAfter = performanceAfter?.winRate || 0;
      const profitBefore = performanceBefore?.totalProfit || 0;
      const profitAfter = performanceAfter?.totalProfit || 0;

      const winRateImprovement = winRateAfter - winRateBefore;
      const profitImprovement = profitAfter - profitBefore;

      const improvementRate = (winRateImprovement * 0.6) + (profitImprovement > 0 ? 0.4 : -0.4);
      const improved = improvementRate > 0;

      await storage.updateBotLearningSession(sessionId, {
        status: "completed",
        performanceAfter,
        improvementRate: improvementRate.toFixed(2),
        completedAt: new Date(),
      });

      console.log(
        `[BotLearning] Completed learning session ${sessionId}: ${improved ? '✅' : '❌'} (improvement: ${(improvementRate * 100).toFixed(2)}%)`
      );

      return { improved, improvementRate };
    } catch (error) {
      console.error(`[BotLearning] Failed to complete learning session:`, error);
      return { improved: false, improvementRate: 0 };
    }
  }

  /**
   * Automatic learning trigger after bot execution
   * Records action, updates memory, and progresses skills
   */
  async learnFromExecution(
    botId: string,
    action: string,
    input: any,
    output: any,
    success: boolean,
    profitLoss: number = 0
  ): Promise<void> {
    try {
      const reward = success ? Math.max(1, profitLoss * 10) : Math.min(-1, profitLoss * 10);

      await this.recordBotAction(botId, action, input, output, success, reward);

      const memoryKey = `${action}_pattern`;
      const memoryValue = { input, output, success, timestamp: new Date().toISOString() };
      const confidence = success ? 70 : 30;
      await this.updateBotMemory(botId, "pattern", memoryKey, memoryValue, confidence);

      const xpGained = success ? 10 + Math.floor(Math.abs(profitLoss) / 10) : 2;
      await this.progressBotSkill(botId, action, xpGained, "execution");

      console.log(`[BotLearning] Bot ${botId} learned from execution: ${action} (${success ? 'success' : 'failure'})`);
    } catch (error) {
      console.error(`[BotLearning] Failed to learn from execution:`, error);
    }
  }

  /**
   * Get bot learning statistics
   */
  async getBotLearningStats(botId: string): Promise<any> {
    try {
      const [skills, trainingData, sessions, memory] = await Promise.all([
        storage.getBotSkills(botId),
        storage.getBotTrainingData(botId),
        storage.getBotLearningSessions(botId),
        storage.getTradingSystemMemory(botId),
      ]);

      const totalXP = skills.reduce((sum, skill) => sum + (skill.experiencePoints || 0), 0);
      const avgSkillLevel = skills.length > 0 
        ? skills.reduce((sum, skill) => sum + (skill.skillLevel || 0), 0) / skills.length 
        : 0;
      const avgConfidence = memory.length > 0
        ? memory.reduce((sum, mem) => sum + parseFloat(mem.confidence || "0"), 0) / memory.length
        : 0;
      const completedSessions = sessions.filter(s => s.status === "completed").length;
      const avgImprovement = sessions.length > 0
        ? sessions
            .filter(s => s.improvementRate)
            .reduce((sum, s) => sum + parseFloat(s.improvementRate || "0"), 0) / sessions.filter(s => s.improvementRate).length
        : 0;

      return {
        totalSkills: skills.length,
        totalXP,
        avgSkillLevel: avgSkillLevel.toFixed(2),
        totalTrainingData: trainingData.length,
        totalMemoryPatterns: memory.length,
        avgMemoryConfidence: avgConfidence.toFixed(2),
        totalLearningSessions: sessions.length,
        completedSessions,
        avgImprovementRate: avgImprovement.toFixed(2),
      };
    } catch (error) {
      console.error(`[BotLearning] Failed to get learning stats:`, error);
      return null;
    }
  }
}

export const botLearningService = new BotLearningService();
