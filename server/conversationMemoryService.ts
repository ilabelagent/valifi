import { storage } from "./storage";
import type {
  InsertConversationSession,
  InsertConversationMemory,
  InsertConversationMessage,
  InsertConversationContext,
  InsertConversationTask,
  ConversationSession,
  ConversationMemory,
  ConversationMessage,
  ConversationContext,
  ConversationTask
} from "@shared/schema";

/**
 * Conversation Memory Service - Persistent Context & Learning System
 *
 * This service provides continuous conversation memory across sessions, enabling:
 * - Session persistence and retrieval
 * - Contextual memory storage (tasks, files, decisions, preferences)
 * - Message history tracking
 * - Active context management
 * - Task continuity tracking
 *
 * Memory Types:
 * - task_context: Current task being worked on
 * - project_state: Overall project state and architecture
 * - user_preferences: User patterns and preferences
 * - technical_decisions: Architectural decisions made
 * - active_problems: Current bugs/issues being solved
 * - conversation_history: Recent conversation summaries
 * - file_context: Files being worked with
 * - entity_knowledge: Facts about entities (users, bots, agents, etc.)
 */

export class ConversationMemoryService {
  /**
   * Get or create a conversation session
   * Sessions are identified by an external ID (e.g., Claude Code session ID)
   */
  async getOrCreateSession(
    sessionIdentifier: string,
    userId?: string
  ): Promise<ConversationSession> {
    try {
      const existingSession = await storage.getConversationSessionByIdentifier(sessionIdentifier);

      if (existingSession) {
        // Update last active timestamp
        await storage.updateConversationSession(existingSession.id, {
          lastActiveAt: new Date(),
        });
        return existingSession;
      }

      // Create new session
      const newSession: InsertConversationSession = {
        userId,
        sessionIdentifier,
        title: null,
        summary: null,
        metadata: {},
      };

      const createdSession = await storage.createConversationSession(newSession);
      console.log(`[ConversationMemory] Created new session: ${sessionIdentifier}`);

      return createdSession;
    } catch (error) {
      console.error(`[ConversationMemory] Failed to get/create session:`, error);
      throw error;
    }
  }

  /**
   * Store a memory in the conversation context
   * Memories are deduplicated by memoryType + memoryKey
   */
  async storeMemory(
    sessionId: string,
    memoryType: string,
    memoryKey: string,
    memoryValue: any,
    options?: {
      userId?: string;
      importance?: number;
      confidence?: number;
      expiresAt?: Date;
      tags?: string[];
    }
  ): Promise<ConversationMemory> {
    try {
      const existingMemory = await storage.getConversationMemoryByKey(
        sessionId,
        memoryType,
        memoryKey
      );

      if (existingMemory) {
        // Update existing memory
        const updatedMemory = await storage.updateConversationMemory(existingMemory.id, {
          memoryValue,
          importance: options?.importance ?? existingMemory.importance,
          confidence: options?.confidence?.toString() ?? existingMemory.confidence,
          accessCount: (existingMemory.accessCount || 0) + 1,
          lastAccessedAt: new Date(),
          expiresAt: options?.expiresAt ?? existingMemory.expiresAt,
          tags: options?.tags ?? existingMemory.tags,
          updatedAt: new Date(),
        });

        console.log(`[ConversationMemory] Updated memory: ${memoryType}/${memoryKey}`);
        return updatedMemory;
      } else {
        // Create new memory
        const memory: InsertConversationMemory = {
          sessionId,
          userId: options?.userId,
          memoryType: memoryType as any,
          memoryKey,
          memoryValue,
          importance: options?.importance ?? 50,
          confidence: options?.confidence?.toString() ?? "100",
          accessCount: 0,
          lastAccessedAt: null,
          expiresAt: options?.expiresAt ?? null,
          tags: options?.tags ?? [],
        };

        const createdMemory = await storage.createConversationMemory(memory);
        console.log(`[ConversationMemory] Created memory: ${memoryType}/${memoryKey}`);
        return createdMemory;
      }
    } catch (error) {
      console.error(`[ConversationMemory] Failed to store memory:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a specific memory by type and key
   */
  async getMemory(
    sessionId: string,
    memoryType: string,
    memoryKey: string
  ): Promise<ConversationMemory | null> {
    try {
      const memory = await storage.getConversationMemoryByKey(sessionId, memoryType, memoryKey);

      if (memory) {
        // Update access tracking
        await storage.updateConversationMemory(memory.id, {
          accessCount: (memory.accessCount || 0) + 1,
          lastAccessedAt: new Date(),
        });
      }

      return memory;
    } catch (error) {
      console.error(`[ConversationMemory] Failed to get memory:`, error);
      return null;
    }
  }

  /**
   * Retrieve all memories of a specific type for a session
   */
  async getMemoriesByType(
    sessionId: string,
    memoryType: string,
    options?: {
      minImportance?: number;
      limit?: number;
    }
  ): Promise<ConversationMemory[]> {
    try {
      const memories = await storage.getConversationMemoriesByType(sessionId, memoryType);

      let filtered = memories;

      // Filter by importance if specified
      if (options?.minImportance !== undefined) {
        filtered = filtered.filter(m => (m.importance || 0) >= options.minImportance!);
      }

      // Sort by importance and recency
      filtered.sort((a, b) => {
        const importanceDiff = (b.importance || 0) - (a.importance || 0);
        if (importanceDiff !== 0) return importanceDiff;

        const timeA = a.updatedAt?.getTime() || 0;
        const timeB = b.updatedAt?.getTime() || 0;
        return timeB - timeA;
      });

      // Limit results if specified
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    } catch (error) {
      console.error(`[ConversationMemory] Failed to get memories by type:`, error);
      return [];
    }
  }

  /**
   * Store a message in the conversation
   */
  async storeMessage(
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
    options?: {
      toolCalls?: any[];
      toolResults?: any[];
      tokens?: number;
    }
  ): Promise<ConversationMessage> {
    try {
      const message: InsertConversationMessage = {
        sessionId,
        role,
        content,
        toolCalls: options?.toolCalls ?? null,
        toolResults: options?.toolResults ?? null,
        embedding: null,
        tokens: options?.tokens ?? null,
      };

      const createdMessage = await storage.createConversationMessage(message);

      // Update session message count
      const session = await storage.getConversationSession(sessionId);
      if (session) {
        await storage.updateConversationSession(sessionId, {
          messageCount: (session.messageCount || 0) + 1,
          lastActiveAt: new Date(),
        });
      }

      return createdMessage;
    } catch (error) {
      console.error(`[ConversationMemory] Failed to store message:`, error);
      throw error;
    }
  }

  /**
   * Get recent messages from a session
   */
  async getRecentMessages(
    sessionId: string,
    limit: number = 50
  ): Promise<ConversationMessage[]> {
    try {
      const messages = await storage.getConversationMessages(sessionId);
      return messages.slice(-limit);
    } catch (error) {
      console.error(`[ConversationMemory] Failed to get messages:`, error);
      return [];
    }
  }

  /**
   * Store context (e.g., file being edited, git branch, active agent)
   */
  async storeContext(
    sessionId: string,
    contextType: string,
    contextKey: string,
    contextValue: any,
    options?: {
      userId?: string;
      relevanceScore?: number;
      pinnedUntil?: Date;
    }
  ): Promise<ConversationContext> {
    try {
      const existingContext = await storage.getConversationContextByKey(
        sessionId,
        contextType,
        contextKey
      );

      if (existingContext) {
        const updatedContext = await storage.updateConversationContext(existingContext.id, {
          contextValue,
          relevanceScore: options?.relevanceScore ?? existingContext.relevanceScore,
          pinnedUntil: options?.pinnedUntil ?? existingContext.pinnedUntil,
          updatedAt: new Date(),
        });

        console.log(`[ConversationMemory] Updated context: ${contextType}/${contextKey}`);
        return updatedContext;
      } else {
        const context: InsertConversationContext = {
          sessionId,
          userId: options?.userId,
          contextType,
          contextKey,
          contextValue,
          relevanceScore: options?.relevanceScore ?? 100,
          pinnedUntil: options?.pinnedUntil ?? null,
        };

        const createdContext = await storage.createConversationContext(context);
        console.log(`[ConversationMemory] Created context: ${contextType}/${contextKey}`);
        return createdContext;
      }
    } catch (error) {
      console.error(`[ConversationMemory] Failed to store context:`, error);
      throw error;
    }
  }

  /**
   * Get active context for a session
   * Returns context sorted by relevance and recency
   */
  async getActiveContext(
    sessionId: string,
    options?: {
      contextType?: string;
      minRelevance?: number;
      limit?: number;
    }
  ): Promise<ConversationContext[]> {
    try {
      let contexts = options?.contextType
        ? await storage.getConversationContextsByType(sessionId, options.contextType)
        : await storage.getConversationContexts(sessionId);

      // Filter by relevance
      if (options?.minRelevance !== undefined) {
        contexts = contexts.filter(c => (c.relevanceScore || 0) >= options.minRelevance!);
      }

      // Filter out expired contexts
      const now = new Date();
      contexts = contexts.filter(c => !c.pinnedUntil || c.pinnedUntil > now);

      // Sort by relevance and recency
      contexts.sort((a, b) => {
        const relevanceDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0);
        if (relevanceDiff !== 0) return relevanceDiff;

        const timeA = a.updatedAt?.getTime() || 0;
        const timeB = b.updatedAt?.getTime() || 0;
        return timeB - timeA;
      });

      // Limit results
      if (options?.limit) {
        contexts = contexts.slice(0, options.limit);
      }

      return contexts;
    } catch (error) {
      console.error(`[ConversationMemory] Failed to get active context:`, error);
      return [];
    }
  }

  /**
   * Create or update a task in the conversation
   */
  async upsertTask(
    sessionId: string,
    userId: string,
    taskDescription: string,
    options?: {
      taskId?: string;
      status?: string;
      priority?: number;
      completionPercentage?: number;
      dependencies?: string[];
      blockers?: any[];
      subtasks?: any[];
      filesModified?: string[];
      agentsUsed?: string[];
      estimatedDuration?: number;
      actualDuration?: number;
    }
  ): Promise<ConversationTask> {
    try {
      if (options?.taskId) {
        // Update existing task
        const updatedTask = await storage.updateConversationTask(options.taskId, {
          taskDescription,
          taskStatus: options?.status ?? undefined,
          priority: options?.priority ?? undefined,
          completionPercentage: options?.completionPercentage ?? undefined,
          dependencies: options?.dependencies ?? undefined,
          blockers: options?.blockers ?? undefined,
          subtasks: options?.subtasks ?? undefined,
          filesModified: options?.filesModified ?? undefined,
          agentsUsed: options?.agentsUsed ?? undefined,
          estimatedDuration: options?.estimatedDuration ?? undefined,
          actualDuration: options?.actualDuration ?? undefined,
          startedAt: options?.status === "in_progress" ? new Date() : undefined,
          completedAt: options?.status === "completed" ? new Date() : undefined,
          updatedAt: new Date(),
        });

        console.log(`[ConversationMemory] Updated task: ${options.taskId}`);
        return updatedTask;
      } else {
        // Create new task
        const task: InsertConversationTask = {
          sessionId,
          userId,
          taskDescription,
          taskStatus: options?.status ?? "pending",
          priority: options?.priority ?? 50,
          completionPercentage: options?.completionPercentage ?? 0,
          dependencies: options?.dependencies ?? [],
          blockers: options?.blockers ?? [],
          subtasks: options?.subtasks ?? [],
          filesModified: options?.filesModified ?? [],
          agentsUsed: options?.agentsUsed ?? [],
          startedAt: options?.status === "in_progress" ? new Date() : null,
          completedAt: null,
          estimatedDuration: options?.estimatedDuration ?? null,
          actualDuration: options?.actualDuration ?? null,
        };

        const createdTask = await storage.createConversationTask(task);
        console.log(`[ConversationMemory] Created task: ${createdTask.id}`);
        return createdTask;
      }
    } catch (error) {
      console.error(`[ConversationMemory] Failed to upsert task:`, error);
      throw error;
    }
  }

  /**
   * Get all tasks for a session
   */
  async getTasks(
    sessionId: string,
    options?: {
      status?: string;
      minPriority?: number;
    }
  ): Promise<ConversationTask[]> {
    try {
      let tasks = await storage.getConversationTasks(sessionId);

      // Filter by status
      if (options?.status) {
        tasks = tasks.filter(t => t.taskStatus === options.status);
      }

      // Filter by priority
      if (options?.minPriority !== undefined) {
        tasks = tasks.filter(t => (t.priority || 0) >= options.minPriority!);
      }

      // Sort by priority and creation time
      tasks.sort((a, b) => {
        const priorityDiff = (b.priority || 0) - (a.priority || 0);
        if (priorityDiff !== 0) return priorityDiff;

        const timeA = a.createdAt?.getTime() || 0;
        const timeB = b.createdAt?.getTime() || 0;
        return timeA - timeB;
      });

      return tasks;
    } catch (error) {
      console.error(`[ConversationMemory] Failed to get tasks:`, error);
      return [];
    }
  }

  /**
   * Generate a comprehensive session summary
   * Useful for restoring context when resuming a conversation
   */
  async generateSessionSummary(sessionId: string): Promise<{
    session: ConversationSession;
    activeTask: ConversationTask | null;
    recentMemories: Record<string, ConversationMemory[]>;
    activeContext: ConversationContext[];
    pendingTasks: ConversationTask[];
    recentMessages: ConversationMessage[];
  }> {
    try {
      const [session, tasks, messages] = await Promise.all([
        storage.getConversationSession(sessionId),
        this.getTasks(sessionId),
        this.getRecentMessages(sessionId, 10),
      ]);

      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const activeTask = tasks.find(t => t.taskStatus === "in_progress") || null;
      const pendingTasks = tasks.filter(t => t.taskStatus === "pending" || t.taskStatus === "in_progress");

      // Get recent memories by type
      const memoryTypes = [
        "task_context",
        "project_state",
        "active_problems",
        "file_context",
        "technical_decisions",
      ];

      const recentMemories: Record<string, ConversationMemory[]> = {};
      for (const type of memoryTypes) {
        recentMemories[type] = await this.getMemoriesByType(sessionId, type, { limit: 5 });
      }

      const activeContext = await this.getActiveContext(sessionId, { limit: 10 });

      return {
        session,
        activeTask,
        recentMemories,
        activeContext,
        pendingTasks,
        recentMessages: messages,
      };
    } catch (error) {
      console.error(`[ConversationMemory] Failed to generate session summary:`, error);
      throw error;
    }
  }

  /**
   * Decay relevance scores over time
   * Should be called periodically to reduce relevance of old context
   */
  async decayContextRelevance(sessionId: string, decayFactor: number = 0.9): Promise<void> {
    try {
      const contexts = await storage.getConversationContexts(sessionId);

      for (const context of contexts) {
        // Skip pinned contexts
        if (context.pinnedUntil && context.pinnedUntil > new Date()) {
          continue;
        }

        const newRelevance = Math.floor((context.relevanceScore || 100) * decayFactor);

        if (newRelevance > 0) {
          await storage.updateConversationContext(context.id, {
            relevanceScore: newRelevance,
          });
        }
      }

      console.log(`[ConversationMemory] Decayed context relevance for session ${sessionId}`);
    } catch (error) {
      console.error(`[ConversationMemory] Failed to decay context relevance:`, error);
    }
  }

  /**
   * Clean up expired memories and low-relevance context
   */
  async cleanupSession(sessionId: string): Promise<void> {
    try {
      const now = new Date();

      // Get all memories and contexts
      const [memories, contexts] = await Promise.all([
        storage.getConversationMemories(sessionId),
        storage.getConversationContexts(sessionId),
      ]);

      // Delete expired memories
      for (const memory of memories) {
        if (memory.expiresAt && memory.expiresAt < now) {
          await storage.deleteConversationMemory(memory.id);
          console.log(`[ConversationMemory] Deleted expired memory: ${memory.memoryKey}`);
        }
      }

      // Delete low-relevance contexts
      for (const context of contexts) {
        if ((context.relevanceScore || 0) < 10) {
          await storage.deleteConversationContext(context.id);
          console.log(`[ConversationMemory] Deleted low-relevance context: ${context.contextKey}`);
        }
      }
    } catch (error) {
      console.error(`[ConversationMemory] Failed to cleanup session:`, error);
    }
  }
}

export const conversationMemoryService = new ConversationMemoryService();
