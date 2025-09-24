import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/config';

// User schema
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// In-memory user store (replace with database in production)
const users = new Map();
const sessions = new Map();

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateToken(userId: string): string {
    return jwt.sign(
      { userId, iat: Date.now() },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }

  static async createUser(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ user: Omit<User, 'password'>; token: string }> {
    // Check if user already exists
    const existingUser = Array.from(users.values()).find(
      (u: User) => u.email === data.email
    );
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(data.password);
    const userId = crypto.randomUUID();
    
    const user: User = {
      id: userId,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.set(userId, user);
    const token = this.generateToken(userId);
    
    // Store session
    sessions.set(token, { userId, createdAt: Date.now() });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = Array.from(users.values()).find(
      (u: User) => u.email === data.email
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await this.verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id);
    sessions.set(token, { userId: user.id, createdAt: Date.now() });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async getCurrentUser(token: string): Promise<Omit<User, 'password'> | null> {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    const user = users.get(decoded.userId);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async logout(token: string): Promise<void> {
    sessions.delete(token);
  }

  static async getAllUsers(): Promise<Array<Omit<User, 'password'>>> {
    return Array.from(users.values()).map(({ password, ...user }) => user);
  }
}