import { Elysia, t } from 'elysia';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Validation schemas
const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// In-memory store for demo (replace with database in production)
const items = new Map();

export const apiRouter = new Elysia({ prefix: '/api/v1' })
  .get('/items', () => {
    const allItems = Array.from(items.values());
    logger.info(`Retrieved ${allItems.length} items`);
    return {
      success: true,
      data: allItems,
      count: allItems.length
    };
  }, {
    detail: {
      summary: 'Get all items',
      description: 'Retrieve all items from the database',
      tags: ['Items']
    }
  })
  .get('/items/:id', ({ params: { id } }) => {
    const item = items.get(id);
    if (!item) {
      throw new Error('Item not found');
    }
    logger.info(`Retrieved item ${id}`);
    return {
      success: true,
      data: item
    };
  }, {
    params: t.Object({
      id: t.String()
    }),
    detail: {
      summary: 'Get item by ID',
      description: 'Retrieve a specific item by its ID',
      tags: ['Items']
    }
  })
  .post('/items', ({ body }) => {
    const validated = createItemSchema.parse(body);
    const id = uuidv4();
    const item = {
      id,
      ...validated,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.set(id, item);
    logger.info(`Created new item ${id}`, item);
    return {
      success: true,
      data: item
    };
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      metadata: t.Optional(t.Record(t.String(), t.Any()))
    }),
    detail: {
      summary: 'Create new item',
      description: 'Create a new item in the database',
      tags: ['Items']
    }
  })
  .patch('/items/:id', ({ params: { id }, body }) => {
    const item = items.get(id);
    if (!item) {
      throw new Error('Item not found');
    }
    const validated = updateItemSchema.parse(body);
    const updated = {
      ...item,
      ...validated,
      updatedAt: new Date().toISOString()
    };
    items.set(id, updated);
    logger.info(`Updated item ${id}`, updated);
    return {
      success: true,
      data: updated
    };
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      metadata: t.Optional(t.Record(t.String(), t.Any()))
    }),
    detail: {
      summary: 'Update item',
      description: 'Update an existing item',
      tags: ['Items']
    }
  })
  .delete('/items/:id', ({ params: { id } }) => {
    if (!items.has(id)) {
      throw new Error('Item not found');
    }
    items.delete(id);
    logger.info(`Deleted item ${id}`);
    return {
      success: true,
      message: `Item ${id} deleted successfully`
    };
  }, {
    params: t.Object({
      id: t.String()
    }),
    detail: {
      summary: 'Delete item',
      description: 'Delete an item from the database',
      tags: ['Items']
    }
  });