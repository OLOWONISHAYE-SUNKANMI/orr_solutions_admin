/**
 * ORR Admin Portal API Service
 * Centralized API functions for all backend requests
 * Base URL: /admin-portal/v1/
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://orr-backend-web-latest.onrender.com";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };
  console.log(headers)
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `API Error: ${response.status} ${response.statusText}`;
      
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.warn('Unauthorized access - token may be expired or invalid');
        // Clear auth data and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed: ${endpoint}`, error);
    throw error;
  }
}

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

export const dashboardAPI = {
  getOverview: () =>
    apiCall("/admin-portal/v1/dashboard/overview/"),

  getQuickStats: () =>
    apiCall("/admin-portal/v1/dashboard/quick-stats/"),

  getRecentActivity: () =>
    apiCall("/admin-portal/v1/dashboard/recent-activity/"),
};

// ============================================================================
// AI & CHAT OVERSIGHT ENDPOINTS
// ============================================================================

export const aiOversightAPI = {
  listConversations: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/admin-portal/v1/ai-oversight/conversations/?${params}`);
  },

  getConversation: (id: number) =>
    apiCall(`/admin-portal/v1/ai-oversight/conversations/${id}/`),

  performAction: (id: number, action: string, data?: Record<string, any>) =>
    apiCall(`/admin-portal/v1/ai-oversight/conversations/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  getStats: () =>
    apiCall("/admin-portal/v1/ai-oversight/stats/"),
};

// ============================================================================
// ANALYTICS & REPORTING ENDPOINTS
// ============================================================================

export const analyticsAPI = {
  getClientAnalytics: () =>
    apiCall("/admin-portal/v1/analytics/clients/"),

  getContentAnalytics: () =>
    apiCall("/admin-portal/v1/analytics/content/"),

  getOverview: () =>
    apiCall("/admin-portal/v1/analytics/overview/"),

  exportData: (format: "csv" | "pdf", dateRange?: { start: string; end: string }) =>
    apiCall("/admin-portal/v1/analytics/export/", {
      method: "POST",
      body: JSON.stringify({ format, date_range: dateRange }),
    }),
};

// ============================================================================
// AUTHENTICATION & AUTHORIZATION ENDPOINTS
// ============================================================================

export const authAPI = {
  login: (identifier: string, password: string) =>
    apiCall("/login/", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  getCurrentUser: () =>
    apiCall("/admin-portal/v1/auth/me/"),

  checkPermission: (permission: string) =>
    apiCall("/admin-portal/v1/auth/check-permission/", {
      method: "POST",
      body: JSON.stringify({ permission }),
    }),

  getAvailableRoles: () =>
    apiCall("/admin-portal/v1/admin-roles/"),
};

// ============================================================================
// CLIENT MANAGEMENT ENDPOINTS
// ============================================================================

export const clientAPI = {
  listClients: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/admin-portal/v1/clients/?${params}`);
  },

  getClient: (id: number) =>
    apiCall(`/admin-portal/v1/clients/${id}/`),

  updateClient: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/clients/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateClient: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/clients/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performAction: (id: number, action: string, data?: Record<string, any>) =>
    apiCall(`/admin-portal/v1/clients/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  getEngagementHistory: (id: number) =>
    apiCall(`/admin-portal/v1/clients/${id}/engagement-history/`),

  getStats: () =>
    apiCall("/admin-portal/v1/clients/stats/"),

  // Documents
  listDocuments: (clientId: number) =>
    apiCall(`/admin-portal/v1/clients/${clientId}/documents/`),

  uploadDocument: (clientId: number, formData: FormData) =>
    fetch(`${BASE_URL}/admin-portal/v1/clients/${clientId}/documents/`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json()),

  getDocument: (clientId: number, docId: number) =>
    apiCall(`/admin-portal/v1/clients/${clientId}/documents/${docId}/`),

  updateDocument: (clientId: number, docId: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/clients/${clientId}/documents/${docId}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteDocument: (clientId: number, docId: number) =>
    apiCall(`/admin-portal/v1/clients/${clientId}/documents/${docId}/`, {
      method: "DELETE",
    }),
};

// ============================================================================
// CONTENT MANAGEMENT ENDPOINTS
// ============================================================================

export const contentAPI = {
  listContent: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/admin-portal/v1/content/?${params}`);
  },

  createContent: (data: Record<string, any>) =>
    apiCall("/admin-portal/v1/content/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getContent: (id: number) =>
    apiCall(`/admin-portal/v1/content/${id}/`),

  updateContent: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/content/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateContent: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/content/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteContent: (id: number) =>
    apiCall(`/admin-portal/v1/content/${id}/`, {
      method: "DELETE",
    }),

  previewContent: (id: number) =>
    apiCall(`/admin-portal/v1/content/${id}/preview/`),

  publishContent: (id: number, action: "publish" | "unpublish" | "archive") =>
    apiCall(`/admin-portal/v1/content/${id}/publish/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  createVersion: (id: number) =>
    apiCall(`/admin-portal/v1/content/${id}/versions/`, {
      method: "POST",
    }),

  bulkActions: (action: string, contentIds: number[]) =>
    apiCall("/admin-portal/v1/content/bulk-actions/", {
      method: "POST",
      body: JSON.stringify({ action, content_ids: contentIds }),
    }),

  getStats: () =>
    apiCall("/admin-portal/v1/content/stats/"),
};

// ============================================================================
// COMPLIANCE & DATA MANAGEMENT ENDPOINTS
// ============================================================================

export const complianceAPI = {
  getComplianceReport: () =>
    apiCall("/admin-portal/v1/compliance/compliance-report/"),

  exportClientData: (clientId: number) =>
    apiCall("/admin-portal/v1/compliance/export-client-data/", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    }),

  deleteClientData: (clientId: number) =>
    apiCall("/admin-portal/v1/compliance/delete-client-data/", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    }),
};

// ============================================================================
// MEETING MANAGEMENT ENDPOINTS
// ============================================================================

export const meetingAPI = {
  listMeetings: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/admin-portal/v1/meetings/?${params}`);
  },

  getMeeting: (id: number) =>
    apiCall(`/admin-portal/v1/meetings/${id}/`),

  updateMeeting: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/meetings/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateMeeting: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/meetings/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performAction: (id: number, action: "confirm" | "reschedule" | "decline" | "complete" | "cancel", data?: Record<string, any>) =>
    apiCall(`/admin-portal/v1/meetings/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  assignHost: (id: number, hostId: number) =>
    apiCall(`/admin-portal/v1/meetings/${id}/assign/`, {
      method: "POST",
      body: JSON.stringify({ host_id: hostId }),
    }),

  getMyMeetings: () =>
    apiCall("/admin-portal/v1/meetings/my-meetings/"),

  getUpcomingMeetings: () =>
    apiCall("/admin-portal/v1/meetings/upcoming/"),

  getStats: () =>
    apiCall("/admin-portal/v1/meetings/stats/"),
};

// ============================================================================
// NOTIFICATIONS ENDPOINTS
// ============================================================================

export const notificationAPI = {
  listNotifications: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/admin-portal/v1/notifications/?${params}`);
  },

  getNotification: (id: number) =>
    apiCall(`/admin-portal/v1/notifications/${id}/`),

  performAction: (id: number, action: "mark_read" | "mark_unread") =>
    apiCall(`/admin-portal/v1/notifications/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  bulkActions: (action: "mark_all_read" | "delete_read" | "delete_all") =>
    apiCall("/admin-portal/v1/notifications/bulk-actions/", {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  getStats: () =>
    apiCall("/admin-portal/v1/notifications/stats/"),
};

// ============================================================================
// SEARCH & NAVIGATION ENDPOINTS
// ============================================================================

export const searchAPI = {
  globalSearch: (query: string, type?: "all" | "clients" | "tickets" | "meetings" | "content", limit?: number) => {
    const params = new URLSearchParams({
      q: query,
      ...(type && { type }),
      ...(limit && { limit: limit.toString() }),
    });
    return apiCall(`/admin-portal/v1/search/global/?${params}`);
  },

  quickSearch: (query: string) => {
    const params = new URLSearchParams({ q: query });
    return apiCall(`/admin-portal/v1/search/quick/?${params}`);
  },
};

// ============================================================================
// SETTINGS & SYSTEM CONFIG ENDPOINTS
// ============================================================================

export const settingsAPI = {
  // Audit Logs
  getAuditLogs: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/admin-portal/v1/settings/audit-logs/?${params}`);
  },

  // Roles
  listRoles: () =>
    apiCall("/admin-portal/v1/settings/roles/"),

  createRole: (data: Record<string, any>) =>
    apiCall("/admin-portal/v1/settings/roles/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRole: (id: number) =>
    apiCall(`/admin-portal/v1/settings/roles/${id}/`),

  updateRole: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/settings/roles/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateRole: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/settings/roles/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteRole: (id: number) =>
    apiCall(`/admin-portal/v1/settings/roles/${id}/`, {
      method: "DELETE",
    }),

  // System Settings
  getSystemSettings: () =>
    apiCall("/admin-portal/v1/settings/system/"),

  updateSystemSettings: (data: Record<string, any>) =>
    apiCall("/admin-portal/v1/settings/system/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Users
  listUsers: () =>
    apiCall("/admin-portal/v1/settings/users/"),

  getUser: (id: number) =>
    apiCall(`/admin-portal/v1/settings/users/${id}/`),

  updateUser: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/settings/users/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateUser: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/settings/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performUserAction: (id: number, action: "activate" | "deactivate" | "reset_password") =>
    apiCall(`/admin-portal/v1/settings/users/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  createUser: (data: Record<string, any>) =>
    apiCall("/admin-portal/v1/settings/users/create/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// TICKET MANAGEMENT ENDPOINTS
// ============================================================================

export const ticketAPI = {
  listTickets: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/admin-portal/v1/tickets/?${params}`);
  },

  createTicket: (data: Record<string, any>) =>
    apiCall("/admin-portal/v1/tickets/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTicket: (id: number) =>
    apiCall(`/admin-portal/v1/tickets/${id}/`),

  updateTicket: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/tickets/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateTicket: (id: number, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/tickets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performAction: (id: number, action: string, data?: Record<string, any>) =>
    apiCall(`/admin-portal/v1/tickets/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  // Messages
  listMessages: (ticketId: number) =>
    apiCall(`/admin-portal/v1/tickets/${ticketId}/messages/`),

  addMessage: (ticketId: number, message: string, isInternal: boolean = false) =>
    apiCall(`/admin-portal/v1/tickets/${ticketId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ message, is_internal: isInternal }),
    }),

  getMyTickets: () =>
    apiCall("/admin-portal/v1/tickets/my-tickets/"),

  getStats: () =>
    apiCall("/admin-portal/v1/tickets/stats/"),
};

// ============================================================================
// BILLING & PAYMENT ENDPOINTS
// ============================================================================

export const billingAPI = {
  getHistory: (filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(
      `/admin-portal/v1/billing-history/${queryString ? `?${queryString}` : ""}`
    );
  },

  getStats: () =>
    apiCall("/admin-portal/v1/billing-history/stats/"),

  getPricingPlans: () =>
    apiCall("/admin-portal/v1/pricing-plans/"),

  createCheckoutSession: (planId: number, clientId: number) =>
    apiCall("/admin-portal/v1/payments/create-checkout/", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, client_id: clientId }),
    }),

  changePlan: (subscriptionId: string, newPlanId: number) =>
    apiCall("/admin-portal/v1/subscriptions/change-plan/", {
      method: "POST",
      body: JSON.stringify({ subscription_id: subscriptionId, new_plan_id: newPlanId }),
    }),

  pauseSubscription: (subscriptionId: string) =>
    apiCall("/admin-portal/v1/subscriptions/pause/", {
      method: "POST",
      body: JSON.stringify({ subscription_id: subscriptionId }),
    }),

  getPortalSession: (clientId: number) =>
    apiCall("/admin-portal/v1/subscriptions/portal/", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    }),
};

// ============================================================================
// CMS API ENDPOINTS
// ============================================================================

export const cmsAPI = {
  getUserRole: async () => {
    const userData = await apiCall("/admin-portal/v1/auth/me/");
    console.log('Current User Role:', userData?.role || userData?.user?.role);
    console.log('Current User Permissions:', userData?.permissions || userData?.user?.permissions);
    console.log('Full User Data:', userData);
    return userData;
  },

  getContent: (contentType: string) =>
    apiCall(`/admin-portal/v1/cms/${contentType}/`),

  updateContent: (contentType: string, data: Record<string, any>) =>
    apiCall(`/admin-portal/v1/cms/${contentType}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadImage: (formData: FormData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    return fetch(`${BASE_URL}/admin-portal/v1/cms/upload-image/`, {
      method: "POST",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json());
  },
};
