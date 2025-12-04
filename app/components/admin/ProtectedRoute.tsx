'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/hooks/auth';
import { authAPI } from '../../services/api';
import { AdminUser } from '@/app/services';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token, setUser, logout, login } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);

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

      // Check permissions if required
      if (requiredPermission && user) {
        try {
          await authAPI.checkPermission(requiredPermission);
        } catch (error: any) {
          console.error('Permission check failed:', error);
          // If it's a 401/403, token is invalid/expired
          if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('Unauthorized')) {
            console.log('Token expired or invalid, logging out');
            logout();
            router.push('/login');
            return;
          }
          // Otherwise, just redirect to dashboard (permission denied)
          router.push('/');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [hasHydrated, token, user, requiredPermission, router, setUser, logout, login]);

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

  return <>{children}</>;
}
