// Kingdom Core Module
// Core functionality for the Kingdom system architecture

export interface KingdomEntity {
  id: string;
  name: string;
  type: 'kingdom' | 'realm' | 'domain' | 'service';
  status: 'active' | 'inactive' | 'maintenance';
  parent?: string;
  children: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface KingdomEvent {
  id: string;
  entityId: string;
  type: string;
  payload: any;
  timestamp: Date;
}

export class KingdomCore {
  private entities: Map<string, KingdomEntity> = new Map();
  private events: KingdomEvent[] = [];
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;

    // Initialize root kingdom
    const rootKingdom: KingdomEntity = {
      id: 'kingdom-root',
      name: 'Valifi Kingdom',
      type: 'kingdom',
      status: 'active',
      children: [],
      metadata: {
        version: '3.0.0',
        description: 'Root kingdom entity for Valifi platform',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.entities.set(rootKingdom.id, rootKingdom);

    // Initialize default realms
    this.createDefaultRealms();
    
    this.initialized = true;
  }

  private createDefaultRealms(): void {
    const realms = [
      {
        id: 'realm-trading',
        name: 'Trading Realm',
        metadata: { description: 'Handles all trading operations' },
      },
      {
        id: 'realm-defi',
        name: 'DeFi Realm',
        metadata: { description: 'Manages DeFi protocols and operations' },
      },
      {
        id: 'realm-portfolio',
        name: 'Portfolio Realm',
        metadata: { description: 'Portfolio management and analytics' },
      },
      {
        id: 'realm-compliance',
        name: 'Compliance Realm',
        metadata: { description: 'KYC, AML, and regulatory compliance' },
      },
      {
        id: 'realm-support',
        name: 'Support Realm',
        metadata: { description: 'Customer support and assistance' },
      },
    ];

    realms.forEach(realm => {
      this.createEntity({
        ...realm,
        type: 'realm',
        status: 'active',
        parent: 'kingdom-root',
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  createEntity(entity: KingdomEntity): KingdomEntity {
    // Validate entity
    if (this.entities.has(entity.id)) {
      throw new Error(`Entity ${entity.id} already exists`);
    }

    // Add to parent's children if parent exists
    if (entity.parent) {
      const parent = this.entities.get(entity.parent);
      if (!parent) {
        throw new Error(`Parent entity ${entity.parent} not found`);
      }
      parent.children.push(entity.id);
      parent.updatedAt = new Date();
    }

    // Store entity
    this.entities.set(entity.id, entity);

    // Record event
    this.recordEvent({
      id: `event-${Date.now()}`,
      entityId: entity.id,
      type: 'entity_created',
      payload: entity,
      timestamp: new Date(),
    });

    return entity;
  }

  getEntity(id: string): KingdomEntity | undefined {
    return this.entities.get(id);
  }

  updateEntity(id: string, updates: Partial<KingdomEntity>): KingdomEntity {
    const entity = this.entities.get(id);
    if (!entity) {
      throw new Error(`Entity ${id} not found`);
    }

    const updatedEntity = {
      ...entity,
      ...updates,
      id: entity.id, // Prevent ID change
      updatedAt: new Date(),
    };

    this.entities.set(id, updatedEntity);

    this.recordEvent({
      id: `event-${Date.now()}`,
      entityId: id,
      type: 'entity_updated',
      payload: updates,
      timestamp: new Date(),
    });

    return updatedEntity;
  }

  deleteEntity(id: string): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;

    // Remove from parent's children
    if (entity.parent) {
      const parent = this.entities.get(entity.parent);
      if (parent) {
        parent.children = parent.children.filter(childId => childId !== id);
        parent.updatedAt = new Date();
      }
    }

    // Delete all children recursively
    entity.children.forEach(childId => {
      this.deleteEntity(childId);
    });

    // Delete entity
    this.entities.delete(id);

    this.recordEvent({
      id: `event-${Date.now()}`,
      entityId: id,
      type: 'entity_deleted',
      payload: { id },
      timestamp: new Date(),
    });

    return true;
  }

  getEntitiesByType(type: KingdomEntity['type']): KingdomEntity[] {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  getActiveEntities(): KingdomEntity[] {
    return Array.from(this.entities.values()).filter(e => e.status === 'active');
  }

  getHierarchy(rootId: string = 'kingdom-root'): any {
    const entity = this.entities.get(rootId);
    if (!entity) return null;

    return {
      ...entity,
      children: entity.children.map(childId => this.getHierarchy(childId)).filter(Boolean),
    };
  }

  private recordEvent(event: KingdomEvent): void {
    this.events.push(event);
    
    // Keep only last 10000 events
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }

  getEvents(limit: number = 100, entityId?: string): KingdomEvent[] {
    let events = this.events;
    
    if (entityId) {
      events = events.filter(e => e.entityId === entityId);
    }
    
    return events.slice(-limit);
  }

  getStatistics(): any {
    const entities = Array.from(this.entities.values());
    
    return {
      totalEntities: entities.length,
      byType: {
        kingdom: entities.filter(e => e.type === 'kingdom').length,
        realm: entities.filter(e => e.type === 'realm').length,
        domain: entities.filter(e => e.type === 'domain').length,
        service: entities.filter(e => e.type === 'service').length,
      },
      byStatus: {
        active: entities.filter(e => e.status === 'active').length,
        inactive: entities.filter(e => e.status === 'inactive').length,
        maintenance: entities.filter(e => e.status === 'maintenance').length,
      },
      totalEvents: this.events.length,
      initialized: this.initialized,
    };
  }

  reset(): void {
    this.entities.clear();
    this.events = [];
    this.initialized = false;
    this.initialize();
  }
}

// Export singleton instance
export default new KingdomCore();