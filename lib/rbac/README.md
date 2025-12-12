# Role-Based Access Control (RBAC) System

## Overview

This RBAC system provides comprehensive permission management for the ORR Solutions Admin Portal. It integrates with the existing JWT authentication system and provides fine-grained access control at the sidebar, route, and component levels.

## Roles

The system supports four roles, each with specific permission sets:

### 1. Super Admin (`super_admin`)
- Has access to **all** features and permissions
- Can manage users, view all clients, edit clients, manage tickets & meetings
- Access to content management, analytics, billing, settings, and AI logs
- Automatically bypasses all permission checks

### 2. Admin (`admin`)
- Full operational access except super admin functions
- Permissions: All except typically reserved for super admin oversight
- Can manage users, clients, tickets, meetings, content, analytics, billing, and settings

### 3. Operator (`operator`)
- Limited operational access focused on day-to-day tasks
- Permissions:
  - `can_view_all_clients` - View client information
  - `can_manage_tickets` - Handle support tickets
  - `can_manage_meetings` - Schedule and manage meetings

### 4. Content Editor (`content_editor`)
- Specialized role for content management only
- Permissions:
  - `can_create_content` - Create blog posts, articles, resources
  - `can_publish_content` - Publish content to live site

## Permissions

The system defines 11 granular permissions:

| Permission | Description |
|------------|-------------|
| `can_manage_users` | Create, edit, delete users and manage roles |
| `can_view_all_clients` | View all client data and profiles |
| `can_edit_clients` | Modify client information |
| `can_manage_tickets` | Create, assign, resolve support tickets |
| `can_manage_meetings` | Schedule, edit, cancel meetings |
| `can_create_content` | Create blog posts, articles, resources |
| `can_publish_content` | Publish content to production |
| `can_view_analytics` | Access analytics and reports |
| `can_view_billing` | View billing and payment information |
| `can_manage_settings` | Modify system settings |
| `can_view_ai_logs` | View AI oversight and automation logs |

## Architecture

### Files Structure

```
lib/rbac/
├── permissions.ts       # Permission definitions and mappings
├── hooks.ts            # React hooks for permission checking
└── index.ts            # Module exports

app/components/admin/
├── ProtectedRoute.tsx  # Route-level protection
└── PermissionGuard.tsx # Component-level protection
```

### Permission Configuration (`permissions.ts`)

**ROLE_PERMISSIONS**: Maps each role to its permission array
```typescript
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  super_admin: [/* all 11 permissions */],
  admin: [/* most permissions */],
  operator: ['can_view_all_clients', 'can_manage_tickets', 'can_manage_meetings'],
  content_editor: ['can_create_content', 'can_publish_content']
};
```

**SIDEBAR_PERMISSIONS**: Maps sidebar sections to required permissions
```typescript
export const SIDEBAR_PERMISSIONS: Record<string, NavPermission> = {
  operational: {
    label: 'Operational Dashboard',
    permissions: ['can_view_all_clients', 'can_manage_tickets'],
    children: { /* nested items */ }
  },
  // ... other sections
};
```

**ROUTE_PERMISSIONS**: Maps URL routes to required permissions
```typescript
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/client-management': ['can_view_all_clients'],
  '/tickets': ['can_manage_tickets'],
  // ... 40+ routes
};
```

## Usage

### 1. Sidebar Navigation (Automatic)

The sidebar automatically filters items based on user permissions. No additional code needed - items configured in `SIDEBAR_PERMISSIONS` are shown/hidden automatically.

### 2. Route Protection

Wrap page content with `ProtectedRoute`:

```tsx
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';

export default function ClientManagementPage() {
  return (
    <ProtectedRoute requiredPermissions={['can_view_all_clients']}>
      <div>
        <h1>Client Management</h1>
        {/* Page content */}
      </div>
    </ProtectedRoute>
  );
}
```

Users without permission will see an "Access Denied" message with a button to return to the dashboard.

### 3. Component-Level Guards

Use `PermissionGuard` to conditionally render UI elements:

```tsx
import PermissionGuard from '@/app/components/admin/PermissionGuard';

function Dashboard() {
  return (
    <div>
      {/* Visible to users with ANY of these permissions */}
      <PermissionGuard permissions={['can_view_analytics', 'can_view_billing']}>
        <AnalyticsWidget />
      </PermissionGuard>

      {/* Visible only if user has ALL permissions */}
      <PermissionGuard 
        permissions={['can_manage_users', 'can_view_billing']} 
        requireAll
      >
        <AdminBillingPanel />
      </PermissionGuard>

      {/* With fallback content */}
      <PermissionGuard 
        permissions={['can_create_content']}
        fallback={<div>You don't have content access</div>}
      >
        <ContentEditor />
      </PermissionGuard>
    </div>
  );
}
```

### 4. Custom Permission Hooks

Use hooks for conditional logic in components:

```tsx
import { 
  usePermission, 
  useHasAnyPermission,
  useHasAllPermissions,
  useIsSuperAdmin,
  useRole
} from '@/lib/rbac';

function MyComponent() {
  // Check single permission
  const canEdit = usePermission('can_edit_clients');
  
  // Check if user has ANY of these permissions
  const canAccessAnalytics = useHasAnyPermission([
    'can_view_analytics', 
    'can_view_billing'
  ]);
  
  // Check if user has ALL permissions
  const canManageEverything = useHasAllPermissions([
    'can_manage_users',
    'can_manage_settings'
  ]);
  
  // Check if super admin
  const isSuperAdmin = useIsSuperAdmin();
  
  // Get user's role
  const role = useRole(); // 'super_admin' | 'admin' | 'operator' | 'content_editor'
  
  return (
    <div>
      {canEdit && <button>Edit Client</button>}
      {isSuperAdmin && <button>Delete User</button>}
      {role === 'content_editor' && <ContentTools />}
    </div>
  );
}
```

### 5. Route Access Checking

Check if user can access a specific route:

```tsx
import { useCanAccessRoute } from '@/lib/rbac';

function Navigation() {
  const canAccessBilling = useCanAccessRoute('/analytics/payments-billing');
  
  return (
    <nav>
      {canAccessBilling && (
        <Link href="/analytics/payments-billing">Billing</Link>
      )}
    </nav>
  );
}
```

## Permission Resolution

The system uses a hierarchical permission resolution strategy:

1. **Super Admin Check**: If user's role is `super_admin`, all checks return `true`
2. **User Permissions**: Check the `permissions` object in the user data
3. **Role-Based Fallback**: If user.permissions is undefined, use `ROLE_PERMISSIONS` mapping
4. **ANY Logic**: For arrays of permissions, user needs just ONE match (OR logic)
5. **ALL Logic**: When `requireAll` is true, user needs EVERY permission (AND logic)

```typescript
// Example: User needs ANY of these permissions
permissions: ['can_view_analytics', 'can_view_billing']
// ✅ Pass if user has either permission

// Example: User needs ALL of these permissions
permissions: ['can_manage_users', 'can_view_billing']
requireAll: true
// ✅ Pass only if user has both permissions
```

## Data Flow

1. **Login**: Backend returns user object with `role_name` and `permissions` array
2. **Storage**: Zustand store persists user data in localStorage
3. **Permission Checks**: Hooks read from Zustand store
4. **Sidebar Filtering**: Sidebar component filters items on render
5. **Route Protection**: ProtectedRoute checks on navigation
6. **Component Guards**: PermissionGuard checks on render

## Best Practices

### ✅ Do:
- Use `ProtectedRoute` for all pages requiring authentication
- Use `PermissionGuard` for conditional UI elements
- Specify permissions arrays in route/component guards
- Use hooks for complex permission logic
- Keep permission checks client-side for better UX
- Provide meaningful fallback content for denied access

### ❌ Don't:
- Don't rely solely on client-side checks for security (backend must also validate)
- Don't create custom permission logic - use provided hooks
- Don't forget to add new routes to `ROUTE_PERMISSIONS`
- Don't use string literals for permissions - use types
- Don't nest ProtectedRoute components unnecessarily

## Adding New Permissions

### 1. Define the Permission

```typescript
// lib/rbac/permissions.ts
export type Permission = 
  | 'can_manage_users'
  | 'can_view_all_clients'
  // ... existing permissions
  | 'can_export_reports'; // New permission
```

### 2. Assign to Roles

```typescript
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  super_admin: [/* all permissions including new one */],
  admin: [/* include new permission if admins should have it */],
  // ...
};
```

### 3. Map Routes (if applicable)

```typescript
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/reports/export': ['can_export_reports'],
  // ...
};
```

### 4. Update Sidebar (if applicable)

```typescript
export const SIDEBAR_PERMISSIONS: Record<string, NavPermission> = {
  reports: {
    label: 'Reports',
    permissions: ['can_export_reports'],
    // ...
  },
};
```

### 5. Use in Components

```tsx
import { usePermission } from '@/lib/rbac';

function ReportsPage() {
  const canExport = usePermission('can_export_reports');
  
  return (
    <div>
      {canExport && <button>Export All</button>}
    </div>
  );
}
```

## Testing Permissions

To test with different roles:

1. Login as a user with specific role
2. Check which sidebar items are visible
3. Try accessing routes directly
4. Verify "Access Denied" appears for unauthorized routes
5. Check conditional UI elements render correctly

Example test scenarios:

- **Operator**: Should only see Client Management, Tickets, Meetings
- **Content Editor**: Should only see Content Management section
- **Admin**: Should see most sections except super admin features
- **Super Admin**: Should see everything

## Backend Integration

The system expects the login API to return:

```typescript
interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role_name: 'super_admin' | 'admin' | 'operator' | 'content_editor';
  permissions?: Permission[]; // Optional, falls back to ROLE_PERMISSIONS
  // ... other fields
}
```

**Important**: Backend must also enforce permissions. Client-side checks are for UX only and can be bypassed. Always validate permissions on the server before performing sensitive operations.

## Troubleshooting

### Sidebar items not showing
- Check user's `role_name` matches defined roles
- Verify permissions array in user object
- Check `SIDEBAR_PERMISSIONS` configuration
- Ensure user has at least ONE required permission

### "Access Denied" on valid routes
- Verify route is in `ROUTE_PERMISSIONS` mapping
- Check user's permissions include required ones
- Confirm `ProtectedRoute` props match route permissions

### Permission hooks return false unexpectedly
- Check Zustand store has user data (`useAuthStore()`)
- Verify user object has `permissions` array or valid `role_name`
- Ensure permission string exactly matches defined types
- Check for typos in permission names

## Summary

This RBAC system provides:
- ✅ 4 roles with distinct permission sets
- ✅ 11 granular permissions
- ✅ Automatic sidebar filtering
- ✅ Route-level protection
- ✅ Component-level guards
- ✅ 8 custom React hooks
- ✅ Type-safe permission definitions
- ✅ Fallback to role-based permissions
- ✅ Super admin bypass for all checks

The system integrates seamlessly with existing authentication and requires minimal changes to implement permission checks throughout the application.
