import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import authService, { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  signOut: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const currentUser = authService.getUser();
      const token = authService.getToken();

      if (currentUser && token) {
        // Verify token is still valid
        const isValid = await authService.refreshAccessToken();
        
        if (isValid) {
          setUser(currentUser);
        } else {
          setUser(null);
          authService.signOut();
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out user
  const signOut = () => {
    authService.signOut();
    setUser(null);
    router.push('/signin');
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    signOut,
    checkAuth,
    hasPermission,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};