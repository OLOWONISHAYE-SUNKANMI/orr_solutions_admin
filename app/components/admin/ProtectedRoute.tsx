'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/hooks/auth';
import { authAPI } from '../../services/api';
import { AdminUser } from '@/app/services';
import { useHasAnyPermission, useCanAccessRoute } from '../../../lib/rbac/hooks';
import type { Permission } from '../../../lib/rbac/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[]; // User needs ANY of these permissions
}

export default function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token, setUser, logout, login } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  
  // Use RBAC hooks (only after user is loaded)
  const hasRequiredPermission = useHasAnyPermission(requiredPermissions);

  // Wait for Zustand to rehydrate
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    // Don't check until hydration is complete
    if (!hasHydrated) return;

    const checkAuth = async () => {
      setIsChecking(true);

      // Check localStorage directly in case store hasn't rehydrated yet
      const storedToken = localStorage.getItem('auth-token');
      const currentToken = token || storedToken;

      // No token anywhere, redirect to login
      if (!currentToken) {
        router.push('/login');
        return;
      }

      // Token exists but no user data, fetch user
      if (!user) {
        try {
          const userData = await authAPI.getCurrentUser() as AdminUser;
          // If we got the token from localStorage but not from store, sync them
          if (storedToken && !token) {
            login(storedToken, userData);
          } else {
            setUser(userData);
          }
        } catch (error: any) {
          console.error('Failed to fetch user:', error);
          // Token is invalid or expired, log out the user
          logout();
          router.push('/login');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [hasHydrated, token, user, router, setUser, logout, login]);

  // After user is loaded, check permissions
  useEffect(() => {
    if (!isChecking && user && requiredPermissions.length > 0) {
      if (!hasRequiredPermission) {
        console.warn('User lacks required permissions:', requiredPermissions);
        router.push('/'); // Redirect to dashboard if no permission
      }
    }
  }, [isChecking, user, hasRequiredPermission, requiredPermissions, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!token || !user) {
    return null; // Will redirect in useEffect
  }

  // Check permissions after loading
  if (requiredPermissions.length > 0 && !hasRequiredPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
