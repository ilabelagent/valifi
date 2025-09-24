import { describe, expect, test, beforeAll } from 'bun:test';
import app from '../src/index';

describe('Valiifi API Tests', () => {
  describe('Health Endpoints', () => {
    test('GET /health should return 200', async () => {
      const response = await app.handle(
        new Request('http://localhost/health')
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('OK');
      expect(data).toHaveProperty('uptime');
      expect(data).toHaveProperty('timestamp');
    });

    test('GET /ready should return 200', async () => {
      const response = await app.handle(
        new Request('http://localhost/ready')
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.server).toBe('ready');
    });
  });

  describe('Items API', () => {
    let createdItemId: string;

    test('POST /api/v1/items should create a new item', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Item',
            description: 'Test Description',
            metadata: { key: 'value' }
          })
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.name).toBe('Test Item');
      createdItemId = data.data.id;
    });

    test('GET /api/v1/items should return all items', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/items')
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    test('GET /api/v1/items/:id should return specific item', async () => {
      const response = await app.handle(
        new Request(`http://localhost/api/v1/items/${createdItemId}`)
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdItemId);
    });

    test('PATCH /api/v1/items/:id should update item', async () => {
      const response = await app.handle(
        new Request(`http://localhost/api/v1/items/${createdItemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Updated Item'
          })
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Item');
    });

    test('DELETE /api/v1/items/:id should delete item', async () => {
      const response = await app.handle(
        new Request(`http://localhost/api/v1/items/${createdItemId}`, {
          method: 'DELETE'
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/v1/items/nonexistent should return 500', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/items/nonexistent')
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('POST /api/v1/items with invalid data should return 422', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Missing required 'name' field
            description: 'Test'
          })
        })
      );

      expect(response.status).toBe(422);
    });
  });
});