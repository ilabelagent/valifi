/**
 * PRODUCTION CONFIGURATION FOR VALIFI
 * This file enforces production-only settings
 */

// Environment validation
export const validateEnvironment = () => {
  const errors = [];

  // Check NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    console.warn('WARNING: Not running in production mode');
  }

  // Check demo mode is disabled
  if (process.env.DISABLE_DEMO_MODE !== 'true') {
    errors.push('DISABLE_DEMO_MODE must be set to true');
  }

  // Check database configuration
  if (!process.env.TURSO_DATABASE_URL) {
    errors.push('TURSO_DATABASE_URL is required');
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    errors.push('TURSO_AUTH_TOKEN is required');
  }

  // Check security tokens
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  }

  if (errors.length > 0) {
    console.error('Production configuration errors:', errors);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production configuration incomplete');
    }
  }

  return errors.length === 0;
};

// Production-only API configuration
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  requireAuth: true,
  validateResponses: true,
  
  // No mock endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      logout: '/auth/logout',
      verify: '/auth/verify',
      refresh: '/auth/refresh'
    },
    user: {
      profile: '/user/profile',
      update: '/user/update',
      delete: '/user/delete'
    },
    bot: '/bot',
    health: '/health'
  },

  // Request interceptor to ensure no demo data
  requestInterceptor: (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Prevent demo/mock requests
    if (config.url?.includes('demo') || config.url?.includes('mock')) {
      throw new Error('Demo/mock requests not allowed');
    }

    // Add production headers
    config.headers['X-Production-Mode'] = 'true';
    config.headers['X-Require-Auth'] = 'true';

    return config;
  },

  // Response interceptor to validate real data
  responseInterceptor: (response) => {
    // Check for demo data in response
    const responseStr = JSON.stringify(response.data).toLowerCase();
    if (responseStr.includes('demo@') || responseStr.includes('test@') || responseStr.includes('mock')) {
      console.error('Demo/test/mock data detected in response');
      throw new Error('Invalid production data');
    }

    return response;
  }
};

// Production-only authentication
export const authConfig = {
  requireVerification: true,
  requireStrongPassword: true,
  minPasswordLength: 12,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  sessionTimeout: 3600000, // 1 hour
  refreshTokenExpiry: 604800000, // 7 days
  
  // Password validation
  validatePassword: (password) => {
    const errors = [];
    
    if (password.length < authConfig.minPasswordLength) {
      errors.push(`Password must be at least ${authConfig.minPasswordLength} characters`);
    }
    
    if (authConfig.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain special characters');
    }
    
    if (authConfig.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain numbers');
    }
    
    if (authConfig.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }
    
    // Check for common/weak passwords
    const weakPasswords = ['password', 'demo', 'test', '12345', 'admin'];
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
      errors.push('Password is too weak');
    }
    
    return errors;
  },
  
  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check format
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    
    // Prevent demo/test emails
    const blockedDomains = ['demo', 'test', 'example', 'localhost'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (blockedDomains.some(blocked => domain?.includes(blocked))) {
      return 'Email domain not allowed';
    }
    
    return null;
  }
};

// Production-only data validation
export const dataValidation = {
  // Validate user data
  validateUser: (user) => {
    if (!user || !user.id || !user.email) {
      return false;
    }
    
    // Check for demo indicators
    if (user.email.includes('demo') || user.email.includes('test')) {
      return false;
    }
    
    return true;
  },
  
  // Validate transaction data
  validateTransaction: (transaction) => {
    if (!transaction || !transaction.id || !transaction.userId) {
      return false;
    }
    
    // Must have real amount
    if (transaction.amount <= 0) {
      return false;
    }
    
    // Must have timestamp
    if (!transaction.createdAt) {
      return false;
    }
    
    return true;
  },
  
  // Validate portfolio data
  validatePortfolio: (portfolio) => {
    if (!portfolio || !portfolio.userId) {
      return false;
    }
    
    // No negative balances
    if (portfolio.balance < 0) {
      return false;
    }
    
    return true;
  }
};

// Production error handling
export const errorHandler = {
  handle: (error, context = '') => {
    // Log error details
    console.error(`Production Error [${context}]:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Don't expose internal errors to users
    const userMessage = getErrorMessage(error);
    
    // Report to monitoring service (if configured)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry.captureException(error);
    }
    
    return {
      success: false,
      message: userMessage,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
};

function getErrorMessage(error) {
  // Map internal errors to user-friendly messages
  const errorMap = {
    'UNAUTHORIZED': 'Please sign in to continue',
    'FORBIDDEN': 'You do not have permission for this action',
    'NOT_FOUND': 'The requested resource was not found',
    'VALIDATION_ERROR': 'Please check your input and try again',
    'DATABASE_ERROR': 'A system error occurred. Please try again later',
    'NETWORK_ERROR': 'Connection error. Please check your internet'
  };
  
  return errorMap[error.code] || 'An unexpected error occurred';
}

// Export production configuration
export const productionConfig = {
  validateEnvironment,
  apiConfig,
  authConfig,
  dataValidation,
  errorHandler,
  
  // Feature flags
  features: {
    enableDemo: false,
    enableMockData: false,
    enableTestMode: false,
    requireEmailVerification: true,
    requireKYC: true,
    enableProduction: true
  },
  
  // Security settings
  security: {
    enableCSRF: true,
    enableRateLimiting: true,
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
    enableEncryption: true,
    enableAuditLog: true
  },
  
  // Database settings
  database: {
    requireConnection: true,
    validateQueries: true,
    enableTransactions: true,
    maxConnections: 20,
    connectionTimeout: 10000
  }
};

// Initialize production mode
export const initializeProduction = () => {
  // Validate environment
  const isValid = validateEnvironment();
  
  if (!isValid && process.env.NODE_ENV === 'production') {
    throw new Error('Production initialization failed');
  }
  
  // Disable console in production
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
  }
  
  // Set up global error handler
  window.addEventListener('unhandledrejection', event => {
    errorHandler.handle(event.reason, 'Unhandled Promise Rejection');
  });
  
  window.addEventListener('error', event => {
    errorHandler.handle(event.error, 'Global Error');
  });
  
  console.warn('Production mode initialized - All demo features disabled');
};

export default productionConfig;