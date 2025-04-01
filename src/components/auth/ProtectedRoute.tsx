import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useUserTier } from '@/hooks/use-user-tier';
import type { UserTier } from '@/types/common';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredTier?: UserTier;
}

export function ProtectedRoute({ children, requiredTier = 'free' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasRequiredTier, isLoading: tierLoading } = useUserTier();
  const location = useLocation();

  if (loading || tierLoading) {
    // TODO: Add loading spinner component
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredTier(requiredTier)) {
    // Redirect to subscription page with return URL
    return <Navigate 
      to="/settings?tab=subscription" 
      state={{ 
        from: location,
        upgradeRequired: true,
        requiredTier: requiredTier 
      }} 
      replace 
    />;
  }

  return children || <Outlet />;
} 