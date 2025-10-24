# Conversation Memory Workflow - Integration Guide

## Overview

The Conversation Memory Workflow is a comprehensive system for maintaining persistent context across conversation sessions. This enables Claude Code (or any AI assistant) to remember what you were working on, resume tasks seamlessly, and avoid asking redundant questions.

## System Architecture

### Database Tables

1. **conversation_sessions** - Top-level conversation sessions
   - Tracks unique conversations with session identifiers
   - Auto-updates lastActiveAt timestamp
   - Stores conversation title and summary

2. **conversation_memories** - Structured memory storage
   - Categorized by memory type (task_context, project_state, etc.)
   - Importance and confidence scoring
   - Access tracking and expiration support

3. **conversation_messages** - Full message history
   - Stores user/assistant/system messages
   - Tracks tool calls and results
   - Token counting for cost tracking

4. **conversation_context** - Active context items
   - File paths, git branches, active agents
   - Relevance scoring with decay over time
   - Optional pinning for important context

5. **conversation_tasks** - Task tracking
   - Task status and completion tracking
   - Dependency and blocker management
   - Files modified and agents used

## Memory Types

```typescript
enum MemoryType {
  task_context         // Current task being worked on
  project_state        // Overall project architecture and state
  user_preferences     // User patterns and preferences
  technical_decisions  // Architectural decisions made
  active_problems      // Current bugs/issues being solved
  conversation_history // Recent conversation summaries
  file_context         // Files being worked with
  entity_knowledge     // Facts about entities (users, bots, agents)
}
```

## Usage Examples

### 1. Initialize a Session

```typescript
import { conversationMemoryService } from "./server/conversationMemoryService";

// Get or create session (typically from Claude Code session ID)
const session = await conversationMemoryService.getOrCreateSession(
  "claude-code-session-123",
  userId // optional
);
```

### 2. Store Current Task Context

```typescript
// Store what task we're working on
await conversationMemoryService.storeMemory(
  session.id,
  "task_context",
  "current_task",
  {
    description: "Implement conversation memory workflow",
    files: ["server/conversationMemoryService.ts", "shared/schema.ts"],
    status: "in_progress",
    lastUpdate: new Date().toISOString()
  },
  {
    importance: 100, // 0-100
    confidence: 100, // 0-100
  }
);
```

### 3. Store File Context

```typescript
// Remember which files we're editing
await conversationMemoryService.storeContext(
  session.id,
  "file",
  "server/routes.ts",
  {
    lastEditLine: 500,
    purpose: "Adding memory API endpoints",
    changes: ["Added /api/memory routes"],
  },
  {
    relevanceScore: 100,
    pinnedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Pin for 24 hours
  }
);
```

### 4. Track Tasks

```typescript
// Create a task
const task = await conversationMemoryService.upsertTask(
  session.id,
  userId,
  "Integrate memory service with agent orchestrator",
  {
    status: "pending",
    priority: 80,
    estimatedDuration: 60, // minutes
    dependencies: ["task-id-1"], // Other task IDs
  }
);

// Update task progress
await conversationMemoryService.upsertTask(
  session.id,
  userId,
  "Integrate memory service with agent orchestrator",
  {
    taskId: task.id,
    status: "in_progress",
    completionPercentage: 50,
    filesModified: ["server/agentOrchestrator.ts"],
    agentsUsed: ["orchestrator", "platform"],
  }
);

// Complete task
await conversationMemoryService.upsertTask(
  session.id,
  userId,
  "Integrate memory service with agent orchestrator",
  {
    taskId: task.id,
    status: "completed",
    completionPercentage: 100,
    actualDuration: 45,
  }
);
```

### 5. Store Technical Decisions

```typescript
// Remember architectural decisions
await conversationMemoryService.storeMemory(
  session.id,
  "technical_decisions",
  "memory_storage_pattern",
  {
    decision: "Use PostgreSQL JSONB for flexible memory storage",
    reasoning: "Allows dynamic memory schemas without migrations",
    alternatives: ["Separate tables per memory type", "MongoDB"],
    date: new Date().toISOString(),
  },
  {
    importance: 90,
    tags: ["architecture", "database"],
  }
);
```

### 6. Store User Preferences

```typescript
// Learn user patterns
await conversationMemoryService.storeMemory(
  session.id,
  "user_preferences",
  "code_style",
  {
    preference: "TypeScript strict mode",
    examples: ["Explicit return types", "No implicit any"],
    frequency: 5, // How many times observed
  },
  {
    importance: 70,
    confidence: 85,
  }
);
```

### 7. Resume a Conversation

```typescript
// Get comprehensive session summary
const summary = await conversationMemoryService.generateSessionSummary(session.id);

console.log("Active Task:", summary.activeTask?.taskDescription);
console.log("Pending Tasks:", summary.pendingTasks.length);
console.log("Recent Context:", summary.activeContext.slice(0, 5));
console.log("Key Memories:", summary.recentMemories);

// Use this to reconstruct context for the assistant
const contextPrompt = `
Resuming previous session:

Current Task: ${summary.activeTask?.taskDescription || "None"}

Recent Files Worked On:
${summary.activeContext
  .filter(c => c.contextType === "file")
  .map(c => `- ${c.contextKey}`)
  .join("\n")}

Technical Decisions Made:
${summary.recentMemories.technical_decisions
  ?.map(m => `- ${m.memoryKey}: ${JSON.stringify(m.memoryValue)}`)
  .join("\n")}
`;
```

### 8. Store Messages

```typescript
// Track conversation messages
await conversationMemoryService.storeMessage(
  session.id,
  "user",
  "Add memory workflow to the project",
  { tokens: 50 }
);

await conversationMemoryService.storeMessage(
  session.id,
  "assistant",
  "I'll implement a comprehensive conversation memory workflow...",
  {
    toolCalls: [
      { tool: "Edit", file: "server/conversationMemoryService.ts" },
      { tool: "Write", file: "shared/schema.ts" }
    ],
    tokens: 300
  }
);

// Retrieve recent messages
const recentMessages = await conversationMemoryService.getRecentMessages(session.id, 10);
```

### 9. Context Decay & Cleanup

```typescript
// Decay context relevance over time (call periodically)
await conversationMemoryService.decayContextRelevance(session.id, 0.9);

// Cleanup expired memories and low-relevance context
await conversationMemoryService.cleanupSession(session.id);
```

## Integration Points

### A. Agent Orchestrator Integration

In `server/agentOrchestrator.ts`, inject memory context before agent execution:

```typescript
async execute(userMessage: string, agentType: string) {
  // Load relevant memories
  const session = await conversationMemoryService.getOrCreateSession(sessionId);
  const summary = await conversationMemoryService.generateSessionSummary(session.id);

  // Inject context into agent prompt
  const enrichedPrompt = `
    ${userMessage}

    [Context from previous conversation]
    Current task: ${summary.activeTask?.taskDescription}
    Recent files: ${summary.activeContext.filter(c => c.contextType === "file").map(c => c.contextKey).join(", ")}
  `;

  // Execute agent with enriched context
  const result = await this.runAgent(agentType, enrichedPrompt);

  // Store execution results
  await conversationMemoryService.storeMessage(session.id, "assistant", result.output, {
    toolCalls: result.toolCalls,
    tokens: result.tokens
  });

  return result;
}
```

### B. API Route Integration

Add memory endpoints in `server/routes.ts`:

```typescript
// Get session summary
app.get("/api/memory/session/:sessionId/summary", async (req, res) => {
  const { sessionId } = req.params;
  const summary = await conversationMemoryService.generateSessionSummary(sessionId);
  res.json(summary);
});

// Store memory
app.post("/api/memory/session/:sessionId/memory", async (req, res) => {
  const { sessionId } = req.params;
  const { memoryType, memoryKey, memoryValue, importance } = req.body;

  const memory = await conversationMemoryService.storeMemory(
    sessionId,
    memoryType,
    memoryKey,
    memoryValue,
    { importance }
  );

  res.json(memory);
});

// Get memories by type
app.get("/api/memory/session/:sessionId/memories/:type", async (req, res) => {
  const { sessionId, type } = req.params;
  const memories = await conversationMemoryService.getMemoriesByType(sessionId, type);
  res.json(memories);
});

// Update task
app.put("/api/memory/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  const task = await conversationMemoryService.upsertTask(
    updates.sessionId,
    updates.userId,
    updates.taskDescription,
    { taskId, ...updates }
  );

  res.json(task);
});
```

### C. Startup Hook

On application startup, resume previous session:

```typescript
// server/index.ts
async function resumeSession(sessionId: string) {
  const summary = await conversationMemoryService.generateSessionSummary(sessionId);

  console.log("\n=== RESUMING PREVIOUS SESSION ===");
  console.log(`Session: ${summary.session.title || summary.session.sessionIdentifier}`);
  console.log(`Messages: ${summary.session.messageCount}`);
  console.log(`Active Task: ${summary.activeTask?.taskDescription || "None"}`);
  console.log(`Pending Tasks: ${summary.pendingTasks.length}`);
  console.log("===============================\n");

  return summary;
}
```

## Best Practices

### 1. Memory Importance Scoring

- **100**: Critical context (current task, active files)
- **80-99**: High importance (recent decisions, key preferences)
- **50-79**: Medium importance (general context, older decisions)
- **20-49**: Low importance (background info, rarely accessed)
- **0-19**: Minimal importance (automatically cleaned up)

### 2. Context Relevance Decay

- Run `decayContextRelevance()` every hour with factor 0.95
- Pin important context with `pinnedUntil` to prevent decay
- Contexts below relevance score 10 are auto-deleted

### 3. Memory Expiration

- Set `expiresAt` for temporary context (e.g., API tokens, session data)
- Expired memories are automatically cleaned up
- Permanent memories should have `expiresAt: null`

### 4. Task Tracking

- Always update `filesModified` when editing files
- Track `agentsUsed` for debugging and analytics
- Use `dependencies` to enforce task ordering
- Record `blockers` when stuck for visibility

### 5. Session Management

- Create one session per conversation thread
- Update `lastActiveAt` on every interaction
- Set session `title` after first few messages
- Generate session `summary` periodically

## Performance Considerations

### Database Queries

- Memories are indexed by `(sessionId, memoryType, memoryKey)`
- Contexts are indexed by `(sessionId, contextType, contextKey)`
- Messages ordered by `createdAt` for efficient retrieval
- Tasks sorted by `priority` and `createdAt`

### Memory Limits

- Store up to 1000 memories per session before cleanup
- Keep last 500 messages per session
- Limit active context to 50 items
- Archive completed tasks after 30 days

### Cleanup Schedule

```typescript
// Run daily
setInterval(async () => {
  const sessions = await storage.getAllConversationSessions();
  for (const session of sessions) {
    await conversationMemoryService.cleanupSession(session.id);
    await conversationMemoryService.decayContextRelevance(session.id, 0.95);
  }
}, 24 * 60 * 60 * 1000);
```

## Troubleshooting

### Session Not Found

```typescript
try {
  const session = await conversationMemoryService.getOrCreateSession(sessionId);
} catch (error) {
  console.error("Failed to get session:", error);
  // Fallback: create new session
}
```

### Memory Conflicts

```typescript
// Memories are upserted by (sessionId, memoryType, memoryKey)
// Duplicate keys will update existing memory
await conversationMemoryService.storeMemory(
  sessionId,
  "task_context",
  "current_task", // Same key = update
  newValue
);
```

### Context Overload

```typescript
// Limit context retrieval
const topContext = await conversationMemoryService.getActiveContext(
  sessionId,
  {
    minRelevance: 50,
    limit: 10 // Top 10 most relevant
  }
);
```

## Migration from Existing Systems

If you have existing conversation data:

```typescript
// Migrate messages
for (const msg of existingMessages) {
  await conversationMemoryService.storeMessage(
    sessionId,
    msg.role,
    msg.content,
    { tokens: msg.tokens }
  );
}

// Migrate context
for (const file of currentFiles) {
  await conversationMemoryService.storeContext(
    sessionId,
    "file",
    file.path,
    { purpose: file.purpose }
  );
}

// Migrate tasks
for (const task of currentTasks) {
  await conversationMemoryService.upsertTask(
    sessionId,
    userId,
    task.description,
    {
      status: task.status,
      priority: task.priority
    }
  );
}
```

## Future Enhancements

1. **Vector Embeddings**: Add semantic search using embeddings for messages
2. **Cross-Session Memory**: Share learnings across sessions for the same user
3. **Memory Consolidation**: Automatically merge and summarize old memories
4. **Analytics Dashboard**: Visualize memory usage and context patterns
5. **Export/Import**: Backup and restore conversation memory

## Conclusion

The Conversation Memory Workflow provides a robust foundation for maintaining context across conversations. By systematically storing tasks, decisions, context, and messages, AI assistants can provide a seamless, continuous experience without repetitive questions.

For questions or issues, refer to the implementation in:
- `server/conversationMemoryService.ts` - Memory service logic
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Database schema definitions
