/**
 * Custom hooks for RBAC permission checks
 */

import { useAuthStore } from '../hooks/auth';
import { Permission, RoleName, ROLE_PERMISSIONS } from './permissions';

/**
 * Check if user has a specific permission
 * Super admin always returns true
 */
export function usePermission(permission: Permission): boolean {
  const { user } = useAuthStore();
  
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role_name === 'super_admin') return true;
  
  // Check if user has the permission in their permissions object
  if (user.permissions && user.permissions[permission]) {
    return true;
  }
  
  // Fallback: Check role-based permissions
  const roleName = user.role_name as RoleName;
  const rolePermissions = ROLE_PERMISSIONS[roleName] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if user has ANY of the provided permissions
 * Returns true if user has at least one permission
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { user } = useAuthStore();
  
  if (!user) return false;
  
  // Empty permissions array means accessible to all authenticated users
  if (permissions.length === 0) return true;
  
  // Super admin has all permissions
  if (user.role_name === 'super_admin') return true;
  
  // Check if user has any of the permissions
  return permissions.some(permission => {
    if (user.permissions && user.permissions[permission]) {
      return true;
    }
    
    // Fallback: Check role-based permissions
    const roleName = user.role_name as RoleName;
    const rolePermissions = ROLE_PERMISSIONS[roleName] || [];
    return rolePermissions.includes(permission);
  });
}

/**
 * Check if user has ALL of the provided permissions
 * Returns true only if user has every permission
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { user } = useAuthStore();
  
  if (!user) return false;
  
  // Empty permissions array means accessible to all authenticated users
  if (permissions.length === 0) return true;
  
  // Super admin has all permissions
  if (user.role_name === 'super_admin') return true;
  
  // Check if user has all permissions
  return permissions.every(permission => {
    if (user.permissions && user.permissions[permission]) {
      return true;
    }
    
    // Fallback: Check role-based permissions
    const roleName = user.role_name as RoleName;
    const rolePermissions = ROLE_PERMISSIONS[roleName] || [];
    return rolePermissions.includes(permission);
  });
}

/**
 * Get current user's role
 */
export function useRole(): RoleName | null {
  const { user } = useAuthStore();
  
  if (!user) return null;
  
  return user.role_name as RoleName;
}

/**
 * Check if user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const { user } = useAuthStore();
  
  if (!user) return false;
  
  return user.role_name === 'super_admin';
}

/**
 * Get all permissions for current user
 */
export function useUserPermissions(): Permission[] {
  const { user } = useAuthStore();
  
  if (!user) return [];
  
  // Super admin has all permissions
  if (user.role_name === 'super_admin') {
    return ROLE_PERMISSIONS.super_admin;
  }
  
  // Get permissions from user object
  if (user.permissions) {
    return Object.entries(user.permissions)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permission]) => permission as Permission);
  }
  
  // Fallback to role-based permissions
  const roleName = user.role_name as RoleName;
  return ROLE_PERMISSIONS[roleName] || [];
}

/**
 * Check if user can access a specific route
 */
export function useCanAccessRoute(route: string, requiredPermissions: Permission[]): boolean {
  return useHasAnyPermission(requiredPermissions);
}
