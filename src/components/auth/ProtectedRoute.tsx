import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import type { UserTier } from '@/types/common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: UserTier;
}

export function ProtectedRoute({ children, requiredTier = 'free' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // TODO: Add loading spinner component
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // TODO: Implement tier checking logic
  // const userTier = getUserTier(user);
  // if (!hasRequiredTier(userTier, requiredTier)) {
  //   return <Navigate to="/upgrade" state={{ from: location }} replace />;
  // }

  return <>{children}</>;
} 