/**
 * RBAC Permission Configuration
 * Maps routes, sidebar items, and features to required permissions
 */

export type Permission = 
  | 'can_manage_users'
  | 'can_view_all_clients'
  | 'can_edit_clients'
  | 'can_manage_tickets'
  | 'can_manage_meetings'
  | 'can_create_content'
  | 'can_publish_content'
  | 'can_view_analytics'
  | 'can_view_billing'
  | 'can_manage_settings'
  | 'can_view_ai_logs';

export type RoleName = 'super_admin' | 'admin' | 'operator' | 'content_editor';

/**
 * Role-based permission matrix
 * Super Admin has all permissions by default
 */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  super_admin: [
    'can_manage_users',
    'can_view_all_clients',
    'can_edit_clients',
    'can_manage_tickets',
    'can_manage_meetings',
    'can_create_content',
    'can_publish_content',
    'can_view_analytics',
    'can_view_billing',
    'can_manage_settings',
    'can_view_ai_logs',
  ],
  admin: [
    'can_view_all_clients',
    'can_edit_clients',
    'can_manage_tickets',
    'can_manage_meetings',
    'can_view_analytics',
    'can_view_billing',
    'can_manage_settings',
  ],
  operator: [
    'can_view_all_clients',
    'can_manage_tickets',
    'can_manage_meetings',
  ],
  content_editor: [
    'can_create_content',
    'can_publish_content',
  ],
};

/**
 * Sidebar navigation items with permission requirements
 * If permissions array is empty, item is visible to all authenticated users
 */
export interface NavPermission {
  label: string;
  permissions: Permission[]; // User needs ANY of these permissions
  requiresAll?: boolean; // If true, user needs ALL permissions
  children?: Record<string, NavPermission>; // Changed from NavPermission[] to Record
}

export const SIDEBAR_PERMISSIONS: Record<string, NavPermission> = {
  dashboard: {
    label: 'Home / Dashboard',
    permissions: [], // Visible to all
  },
  operational: {
    label: 'Operational Dashboard',
    permissions: ['can_view_all_clients', 'can_manage_tickets', 'can_view_billing'],
    children: {
      quickActions: {
        label: 'Quick Actions',
        permissions: [],
      },
      systemNotifications: {
        label: 'System Notifications',
        permissions: ['can_manage_settings'],
      },
      billingCredit: {
        label: 'Billing & Credit Overview',
        permissions: ['can_view_billing'],
      },
      clientManagement: {
        label: 'Client Management',
        permissions: ['can_view_all_clients'],
        children: {
          allClients: {
            label: 'All Clients',
            permissions: ['can_view_all_clients'],
          },
          clientProfiles: {
            label: 'Client Profiles',
            permissions: ['can_view_all_clients'],
          },
          clientWorkspaces: {
            label: 'Client Workspaces',
            permissions: ['can_view_all_clients'],
          },
          clientMeetings: {
            label: 'Client Meetings',
            permissions: ['can_manage_meetings'],
          },
        },
      },
    },
  },
  consultation: {
    label: 'Consultation Management',
    permissions: ['can_manage_meetings'],
    children: {
      allConsultations: {
        label: 'All Consultations',
        permissions: ['can_manage_meetings'],
      },
      assignedConsultants: {
        label: 'Assigned Consultants',
        permissions: ['can_manage_meetings'],
      },
      reports: {
        label: 'Reports (drafts/approved)',
        permissions: ['can_manage_meetings', 'can_view_analytics'],
      },
    },
  },
  tickets: {
    label: 'Tickets & Communication',
    permissions: ['can_manage_tickets'],
    children: {
      supportTickets: {
        label: 'Support Tickets',
        permissions: ['can_manage_tickets'],
      },
      clientMessages: {
        label: 'Client Messages',
        permissions: ['can_manage_tickets'],
      },
      internalComms: {
        label: 'Internal Comms',
        permissions: [],
      },
      escalations: {
        label: 'Escalations',
        permissions: ['can_manage_tickets'],
      },
    },
  },
  content: {
    label: 'Content Management',
    permissions: ['can_create_content', 'can_publish_content'],
    children: {
      blogArticles: {
        label: 'Blog & Articles',
        permissions: ['can_create_content'],
      },
      resourcesLibrary: {
        label: 'Resources Library',
        permissions: ['can_create_content'],
      },
      templates: {
        label: 'Templates (Reports, Contracts, DS)',
        permissions: ['can_create_content'],
      },
      contentDrafts: {
        label: 'Content Drafts',
        permissions: ['can_create_content'],
      },
    },
  },
  analytics: {
    label: 'Analytics & Insights',
    permissions: ['can_view_analytics', 'can_view_billing'],
    children: {
      behaviourAnalytics: {
        label: 'Behaviour Analytics',
        permissions: ['can_view_analytics'],
      },
      sectorInsights: {
        label: 'Sector Insights',
        permissions: ['can_view_analytics'],
      },
      consultationMetrics: {
        label: 'Consultation Metrics',
        permissions: ['can_view_analytics'],
      },
      workspaceUsage: {
        label: 'Workspace Usage',
        permissions: ['can_view_analytics'],
      },
      funnelReports: {
        label: 'Funnel Reports',
        permissions: ['can_view_analytics'],
      },
      paymentsBilling: {
        label: 'Payments & Billing',
        permissions: ['can_view_billing'],
      },
      walletLogs: {
        label: 'Wallet Logs',
        permissions: ['can_view_billing'],
      },
      proRataApprovals: {
        label: 'Pro-rata Approvals',
        permissions: ['can_view_billing'],
      },
      subscriptions: {
        label: 'Subscriptions',
        permissions: ['can_view_billing'],
      },
      invoicing: {
        label: 'Invoicing',
        permissions: ['can_view_billing'],
      },
      paymentDisputes: {
        label: 'Payment Disputes',
        permissions: ['can_view_billing'],
      },
    },
  },
};

/**
 * Route-level permission requirements
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/': [], // Dashboard - visible to all
  
  // Operational Dashboard
  '/operational/quick-actions': [],
  '/operational/system-notifications': ['can_manage_settings'],
  '/operational/billing-credit': ['can_view_billing'],
  
  // Client Management
  '/client-management': ['can_view_all_clients'],
  '/client-management/profiles': ['can_view_all_clients'],
  '/client-management/workspaces': ['can_view_all_clients'],
  '/client-management/meetings': ['can_manage_meetings'],
  '/client-management/meetings/past': ['can_manage_meetings'],
  '/client-management/meetings/upcoming': ['can_manage_meetings'],
  '/client-management/meetings/pending': ['can_manage_meetings'],
  
  // Consultation Management
  '/consultations': ['can_manage_meetings'],
  '/consultations/past': ['can_manage_meetings'],
  '/consultations/scheduled': ['can_manage_meetings'],
  '/consultations/consultants': ['can_manage_meetings'],
  '/consultations/reports': ['can_manage_meetings'],
  
  // Tickets & Communication
  '/tickets': ['can_manage_tickets'],
  '/tickets/client-messages': ['can_manage_tickets'],
  '/tickets/internal-comms': [],
  '/tickets/escalations': ['can_manage_tickets'],
  
  // Content Management
  '/content-management': ['can_create_content'],
  '/content-management/resources': ['can_create_content'],
  '/content-management/templates': ['can_create_content'],
  '/content-management/drafts': ['can_create_content'],
  '/content-management/new': ['can_create_content'],
  '/content-management/media': ['can_create_content'],
  
  // Analytics & Insights
  '/analytics/behaviour': ['can_view_analytics'],
  '/analytics/sector': ['can_view_analytics'],
  '/analytics/consultation-metrics': ['can_view_analytics'],
  '/analytics/workspace-usage': ['can_view_analytics'],
  '/analytics/funnel-reports': ['can_view_analytics'],
  '/analytics/payments-billing': ['can_view_billing'],
  '/analytics/wallet-logs': ['can_view_billing'],
  '/analytics/pro-rata-approvals': ['can_view_billing'],
  '/analytics/subscriptions': ['can_view_billing'],
  '/analytics/invoicing': ['can_view_billing'],
  '/analytics/payment-disputes': ['can_view_billing'],
  
  // Other routes
  '/settings': ['can_manage_settings'],
  '/notifications': [],
  '/payment-management': ['can_view_billing'],
  '/analytics-reporting': ['can_view_analytics'],
  '/seo-and-analytics': ['can_view_analytics'],
  '/schedule-meetings': ['can_manage_meetings'],
};
