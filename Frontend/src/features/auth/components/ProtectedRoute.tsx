/**
 * @file features/auth/components/ProtectedRoute.tsx
 * @description 
 */

import { Navigate, Outlet } from 'react-router-dom';
import { tokenService } from '@/shared/lib/axios';

export function ProtectedRoute() {
  const isAuthenticated = tokenService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
