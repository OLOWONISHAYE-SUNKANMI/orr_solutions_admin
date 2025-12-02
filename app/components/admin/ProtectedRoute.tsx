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
  const { user, token, setUser, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      // No token, redirect to login
      if (!token) {
        router.push('/login');
        return;
      }

      // Token exists but no user data, fetch user
      if (!user) {
        try {
          const userData = await authAPI.getCurrentUser() as AdminUser;
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
          router.push('/login');
          return;
        }
      }

      // Check permissions if required
      if (requiredPermission && user) {
        try {
          await authAPI.checkPermission(requiredPermission);
        } catch (error) {
          console.error('Permission denied:', error);
          router.push('/dashboard');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [token, requiredPermission, router]);

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
