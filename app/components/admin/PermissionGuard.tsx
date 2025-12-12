'use client';

import { ReactNode } from 'react';
import { useHasAnyPermission, useHasAllPermissions } from '../../../lib/rbac/hooks';
import type { Permission } from '../../../lib/rbac/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions. If false (default), requires ANY
  fallback?: ReactNode; // Optional fallback content when permission is denied
}

/**
 * Component that conditionally renders children based on user permissions.
 * 
 * @example
 * // User needs ANY of these permissions
 * <PermissionGuard permissions={['can_manage_users', 'can_view_all_clients']}>
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * @example
 * // User needs ALL of these permissions
 * <PermissionGuard permissions={['can_manage_users', 'can_view_billing']} requireAll>
 *   <BillingManagement />
 * </PermissionGuard>
 * 
 * @example
 * // With fallback content
 * <PermissionGuard 
 *   permissions={['can_view_analytics']} 
 *   fallback={<div>You don't have access to analytics</div>}
 * >
 *   <AnalyticsDashboard />
 * </PermissionGuard>
 */
export default function PermissionGuard({ 
  children, 
  permissions, 
  requireAll = false,
  fallback = null 
}: PermissionGuardProps) {
  const hasAnyPermission = useHasAnyPermission(permissions);
  const hasAllPermissions = useHasAllPermissions(permissions);
  
  const hasPermission = requireAll ? hasAllPermissions : hasAnyPermission;
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
