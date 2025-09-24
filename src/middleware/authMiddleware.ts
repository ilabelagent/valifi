import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import DatabaseService from '../services/DatabaseService';
import { ApiResponse, User } from '../../types/api';

const JWT_SECRET = process.env.JWT_SECRET || 'valifi-secret-key-change-in-production';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export async function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token required'
        });
      }

      const token = authHeader.substring(7);
      
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (!decoded.userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      // Fetch user from database
      const db = DatabaseService;
      const result = await db.query(
        'SELECT id, email, username, first_name, last_name, role, account_status FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];
      
      if (user.account_status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active'
        });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: true,
        isActive: true,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      // Call the actual handler
      return handler(req, res);
      
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  };
}

export function withRole(requiredRole: string) {
  return function(
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
  ) {
    return withAuth(async (req, res) => {
      if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
      return handler(req, res);
    });
  };
}