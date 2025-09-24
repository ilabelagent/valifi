import { Elysia, t } from 'elysia';
import { AuthService, userSchema, loginSchema } from '../services/auth.service';
import { logger } from '../utils/logger';

export const authRouter = new Elysia({ prefix: '/auth' })
  .post(
    '/signup',
    async ({ body, set }) => {
      try {
        const validated = userSchema.parse(body);
        const result = await AuthService.createUser(validated);
        
        logger.info(`New user registered: ${result.user.email}`);
        
        set.status = 201;
        return {
          success: true,
          message: 'User created successfully',
          data: {
            user: result.user,
            token: result.token,
          },
        };
      } catch (error: any) {
        logger.error(`Signup failed: ${error.message}`);
        
        if (error.message.includes('already exists')) {
          set.status = 409;
          return {
            success: false,
            error: 'User with this email already exists',
          };
        }
        
        if (error.name === 'ZodError') {
          set.status = 400;
          return {
            success: false,
            error: 'Validation failed',
            details: error.errors,
          };
        }
        
        set.status = 500;
        return {
          success: false,
          error: 'Failed to create user',
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
        name: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Sign up a new user',
        description: 'Create a new user account with email and password',
        tags: ['Authentication'],
      },
    }
  )
  .post(
    '/signin',
    async ({ body, set }) => {
      try {
        const validated = loginSchema.parse(body);
        const result = await AuthService.login(validated);
        
        logger.info(`User logged in: ${result.user.email}`);
        
        return {
          success: true,
          message: 'Login successful',
          data: {
            user: result.user,
            token: result.token,
          },
        };
      } catch (error: any) {
        logger.error(`Login failed: ${error.message}`);
        
        set.status = 401;
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
      detail: {
        summary: 'Sign in user',
        description: 'Authenticate user with email and password',
        tags: ['Authentication'],
      },
    }
  )
  .get(
    '/me',
    async ({ headers, set }) => {
      try {
        const token = headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          set.status = 401;
          return {
            success: false,
            error: 'No token provided',
          };
        }
        
        const user = await AuthService.getCurrentUser(token);
        
        if (!user) {
          set.status = 401;
          return {
            success: false,
            error: 'Invalid or expired token',
          };
        }
        
        return {
          success: true,
          data: { user },
        };
      } catch (error: any) {
        logger.error(`Get current user failed: ${error.message}`);
        
        set.status = 500;
        return {
          success: false,
          error: 'Failed to get user information',
        };
      }
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get current user',
        description: 'Get the currently authenticated user',
        tags: ['Authentication'],
      },
    }
  )
  .post(
    '/logout',
    async ({ headers, set }) => {
      try {
        const token = headers.authorization?.replace('Bearer ', '');
        
        if (token) {
          await AuthService.logout(token);
        }
        
        return {
          success: true,
          message: 'Logged out successfully',
        };
      } catch (error: any) {
        logger.error(`Logout failed: ${error.message}`);
        
        set.status = 500;
        return {
          success: false,
          error: 'Failed to logout',
        };
      }
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Logout user',
        description: 'Logout the current user and invalidate token',
        tags: ['Authentication'],
      },
    }
  )
  .get(
    '/users',
    async ({ headers, set }) => {
      try {
        const token = headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          set.status = 401;
          return {
            success: false,
            error: 'No token provided',
          };
        }
        
        const currentUser = await AuthService.getCurrentUser(token);
        
        if (!currentUser) {
          set.status = 401;
          return {
            success: false,
            error: 'Invalid or expired token',
          };
        }
        
        const users = await AuthService.getAllUsers();
        
        return {
          success: true,
          data: { users },
        };
      } catch (error: any) {
        logger.error(`Get users failed: ${error.message}`);
        
        set.status = 500;
        return {
          success: false,
          error: 'Failed to get users',
        };
      }
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'List all users',
        description: 'Get a list of all registered users (requires authentication)',
        tags: ['Authentication'],
      },
    }
  );