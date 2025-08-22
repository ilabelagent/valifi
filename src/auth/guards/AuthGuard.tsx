import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  requirePermissions?: string[];
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRole,
  requirePermissions = [],
  redirectTo = '/signin'
}) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, hasRole, hasPermission } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (requireAuth && !isAuthenticated) {
        // Save current path for redirect after login
        const currentPath = router.asPath;
        router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Check role requirements
      if (requireRole && !hasRole(requireRole)) {
        router.push('/unauthorized');
        return;
      }

      // Check permission requirements
      const hasAllPermissions = requirePermissions.every(permission => 
        hasPermission(permission)
      );

      if (requirePermissions.length > 0 && !hasAllPermissions) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    requireAuth,
    requireRole,
    requirePermissions,
    router,
    redirectTo,
    hasRole,
    hasPermission
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render children if auth requirements not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireRole && !hasRole(requireRole)) {
    return null;
  }

  const hasAllPermissions = requirePermissions.every(permission => 
    hasPermission(permission)
  );

  if (requirePermissions.length > 0 && !hasAllPermissions) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default AuthGuard;