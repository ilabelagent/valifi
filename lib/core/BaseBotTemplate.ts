import { KingdomBot } from './KingdomCore';

export interface BotAction {
  execute(params: any): Promise<any>;
}

export interface BotResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export abstract class BaseBotTemplate extends KingdomBot {
  protected abstract actions: Record<string, BotAction>;
  protected abstract botName: string;
  protected abstract botDescription: string;
  
  constructor() {
    super();
  }

  /**
   * Common authentication validation for all bots
   */
  protected async validateAuth(userId: string): Promise<boolean> {
    if (!userId) {
      throw new Error('Authentication required');
    }
    // Add additional auth checks here
    return true;
  }

  /**
   * Standardized error handling across all bots
   */
  protected async handleError(error: any): Promise<BotResponse> {
    console.error(`[${this.botName}] Error:`, error);
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error.stack || error.toString()
    };
  }

  /**
   * Main execution method with routing to specific actions
   */  public async execute(params: any): Promise<BotResponse> {
    try {
      // Validate authentication if userId is provided
      if (params.userId) {
        await this.validateAuth(params.userId);
      }

      // Route to specific action
      const action = params.action;
      if (!action) {
        throw new Error('Action parameter is required');
      }

      const handler = this.actions[action];
      if (!handler) {
        throw new Error(`Unknown action: ${action}`);
      }

      // Execute the action
      const result = await handler.execute(params);
      
      return {
        success: true,
        message: `${action} completed successfully`,
        data: result
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get bot information
   */
  public getBotInfo(): { name: string; description: string; actions: string[] } {
    return {
      name: this.botName,
      description: this.botDescription,
      actions: Object.keys(this.actions)
    };
  }

  /**
   * Shared utility for formatting currency
   */
  protected formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Shared utility for generating unique IDs
   */
  protected generateId(prefix: string = ''): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }
}

export default BaseBotTemplate;