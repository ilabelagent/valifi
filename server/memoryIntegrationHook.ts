/**
 * Memory Integration Hook - Automatic Context Restoration
 *
 * This module provides automatic memory context restoration on application startup
 * and conversation resume. It integrates the conversation memory system seamlessly
 * into the application lifecycle.
 */

import { conversationMemoryService } from "./conversationMemoryService";

/**
 * Session identifier - In production, this would come from:
 * - Claude Code session ID
 * - User session cookie
 * - WebSocket connection ID
 * - Request header
 */
let currentSessionId: string | null = null;

/**
 * Initialize memory system on application startup
 * This function should be called when the server starts
 */
export async function initializeMemorySystem(sessionId?: string): Promise<void> {
  try {
    console.log("\n=== INITIALIZING CONVERSATION MEMORY SYSTEM ===");

    // Use provided session ID or generate a default one
    currentSessionId = sessionId || `valifi-session-${Date.now()}`;

    console.log(`Session Identifier: ${currentSessionId}`);

    // Try to get or create session
    const session = await conversationMemoryService.getOrCreateSession(currentSessionId);

    console.log(`Session ID: ${session.id}`);
    console.log(`Session Created: ${session.startedAt}`);
    console.log(`Last Active: ${session.lastActiveAt}`);
    console.log(`Total Messages: ${session.messageCount || 0}`);

    // If this is an existing session, restore context
    if (session.messageCount && session.messageCount > 0) {
      console.log("\n🔄 RESUMING PREVIOUS SESSION...\n");
      await resumeSession(session.id);
    } else {
      console.log("\n✨ NEW SESSION STARTED\n");

      // Store initial context
      await conversationMemoryService.storeMemory(
        session.id,
        "project_state",
        "platform",
        {
          name: "Valifi Kingdom",
          type: "Fintech Platform",
          features: ["Multi-Agent AI", "Blockchain", "Financial Services"],
          initialized: new Date().toISOString(),
        },
        { importance: 100 }
      );
    }

    console.log("==============================================\n");
  } catch (error) {
    console.error("Failed to initialize memory system:", error);
    // Don't throw - allow app to continue even if memory system fails
  }
}

/**
 * Resume a previous session and restore context
 */
export async function resumeSession(sessionId: string): Promise<void> {
  try {
    const summary = await conversationMemoryService.generateSessionSummary(sessionId);

    console.log("📋 SESSION SUMMARY:");
    console.log("─────────────────────────────────────────────");

    // Display active task
    if (summary.activeTask) {
      console.log(`\n🎯 Active Task: ${summary.activeTask.taskDescription}`);
      console.log(`   Status: ${summary.activeTask.taskStatus}`);
      console.log(`   Progress: ${summary.activeTask.completionPercentage || 0}%`);
      if (summary.activeTask.filesModified && summary.activeTask.filesModified.length > 0) {
        console.log(`   Files Modified: ${JSON.stringify(summary.activeTask.filesModified)}`);
      }
    } else {
      console.log("\n🎯 Active Task: None");
    }

    // Display pending tasks
    if (summary.pendingTasks && summary.pendingTasks.length > 0) {
      console.log(`\n📝 Pending Tasks (${summary.pendingTasks.length}):`);
      summary.pendingTasks.slice(0, 5).forEach((task, i) => {
        console.log(`   ${i + 1}. [${task.taskStatus}] ${task.taskDescription}`);
      });
    }

    // Display recent context
    if (summary.activeContext && summary.activeContext.length > 0) {
      console.log(`\n📂 Active Context (${summary.activeContext.length} items):`);

      const fileContexts = summary.activeContext.filter(c => c.contextType === "file");
      if (fileContexts.length > 0) {
        console.log("   Files:");
        fileContexts.slice(0, 5).forEach(c => {
          console.log(`   - ${c.contextKey} (relevance: ${c.relevanceScore || 100})`);
        });
      }

      const gitContexts = summary.activeContext.filter(c => c.contextType === "git");
      if (gitContexts.length > 0) {
        console.log("   Git:");
        gitContexts.forEach(c => {
          console.log(`   - ${c.contextKey}: ${JSON.stringify(c.contextValue)}`);
        });
      }
    }

    // Display key memories
    console.log("\n💾 Key Memories:");

    if (summary.recentMemories.task_context && summary.recentMemories.task_context.length > 0) {
      console.log("   Task Context:");
      summary.recentMemories.task_context.slice(0, 3).forEach(m => {
        console.log(`   - ${m.memoryKey}`);
      });
    }

    if (summary.recentMemories.technical_decisions && summary.recentMemories.technical_decisions.length > 0) {
      console.log("   Technical Decisions:");
      summary.recentMemories.technical_decisions.slice(0, 3).forEach(m => {
        console.log(`   - ${m.memoryKey}`);
      });
    }

    console.log("\n─────────────────────────────────────────────");
  } catch (error) {
    console.error("Failed to resume session:", error);
  }
}

/**
 * Store memory during runtime
 * This is a convenience wrapper for the service
 */
export async function storeMemory(
  memoryType: string,
  memoryKey: string,
  memoryValue: any,
  options?: {
    importance?: number;
    confidence?: number;
    tags?: string[];
  }
): Promise<void> {
  if (!currentSessionId) {
    console.warn("No active session - memory not stored");
    return;
  }

  try {
    const session = await conversationMemoryService.getOrCreateSession(currentSessionId);
    await conversationMemoryService.storeMemory(
      session.id,
      memoryType,
      memoryKey,
      memoryValue,
      options
    );
  } catch (error) {
    console.error("Failed to store memory:", error);
  }
}

/**
 * Store context during runtime
 */
export async function storeContext(
  contextType: string,
  contextKey: string,
  contextValue: any,
  options?: {
    relevanceScore?: number;
    pinnedUntil?: Date;
  }
): Promise<void> {
  if (!currentSessionId) {
    console.warn("No active session - context not stored");
    return;
  }

  try {
    const session = await conversationMemoryService.getOrCreateSession(currentSessionId);
    await conversationMemoryService.storeContext(
      session.id,
      contextType,
      contextKey,
      contextValue,
      options
    );
  } catch (error) {
    console.error("Failed to store context:", error);
  }
}

/**
 * Track a task during runtime
 */
export async function trackTask(
  taskDescription: string,
  options?: {
    status?: string;
    priority?: number;
    filesModified?: string[];
    agentsUsed?: string[];
  }
): Promise<void> {
  if (!currentSessionId) {
    console.warn("No active session - task not tracked");
    return;
  }

  try {
    const session = await conversationMemoryService.getOrCreateSession(currentSessionId);
    await conversationMemoryService.upsertTask(
      session.id,
      "system", // Default user ID for system tasks
      taskDescription,
      options
    );
  } catch (error) {
    console.error("Failed to track task:", error);
  }
}

/**
 * Get current session summary
 */
export async function getSessionSummary(): Promise<any> {
  if (!currentSessionId) {
    return null;
  }

  try {
    const session = await conversationMemoryService.getOrCreateSession(currentSessionId);
    return await conversationMemoryService.generateSessionSummary(session.id);
  } catch (error) {
    console.error("Failed to get session summary:", error);
    return null;
  }
}

/**
 * Cleanup old memories (should be called periodically)
 */
export async function cleanupMemories(): Promise<void> {
  if (!currentSessionId) {
    return;
  }

  try {
    const session = await conversationMemoryService.getOrCreateSession(currentSessionId);
    await conversationMemoryService.cleanupSession(session.id);
    console.log("[Memory] Cleanup completed");
  } catch (error) {
    console.error("Failed to cleanup memories:", error);
  }
}

/**
 * Decay context relevance (should be called periodically)
 */
export async function decayContext(decayFactor: number = 0.95): Promise<void> {
  if (!currentSessionId) {
    return;
  }

  try {
    const session = await conversationMemoryService.getOrCreateSession(currentSessionId);
    await conversationMemoryService.decayContextRelevance(session.id, decayFactor);
    console.log("[Memory] Context decay applied");
  } catch (error) {
    console.error("Failed to decay context:", error);
  }
}

/**
 * Get current session ID
 */
export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

/**
 * Set session ID (useful for testing or manual override)
 */
export function setSessionId(sessionId: string): void {
  currentSessionId = sessionId;
}
