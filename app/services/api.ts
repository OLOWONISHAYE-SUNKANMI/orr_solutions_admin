/**
 * ORR Admin Portal API Service
 * Centralized API functions for all backend requests
 * Base URL: /admin-portal/v1/
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://orr-backend-web-latest.onrender.com/admin-portal/v1";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
    apiCall("/dashboard/overview/"),

  getQuickStats: () =>
    apiCall("/dashboard/quick-stats/"),

  getRecentActivity: () =>
    apiCall("/dashboard/recent-activity/"),
};

// ============================================================================
// AI & CHAT OVERSIGHT ENDPOINTS
// ============================================================================

export const aiOversightAPI = {
  listConversations: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/ai-oversight/conversations/?${params}`);
  },

  getConversation: (id: number) =>
    apiCall(`/ai-oversight/conversations/${id}/`),

  performAction: (id: number, action: string, data?: Record<string, any>) =>
    apiCall(`/ai-oversight/conversations/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  getStats: () =>
    apiCall("/ai-oversight/stats/"),
};

// ============================================================================
// ANALYTICS & REPORTING ENDPOINTS
// ============================================================================

export const analyticsAPI = {
  getClientAnalytics: () =>
    apiCall("/analytics/clients/"),

  getContentAnalytics: () =>
    apiCall("/analytics/content/"),

  getOverview: () =>
    apiCall("/analytics/overview/"),

  exportData: (format: "csv" | "pdf", dateRange?: { start: string; end: string }) =>
    apiCall("/analytics/export/", {
      method: "POST",
      body: JSON.stringify({ format, date_range: dateRange }),
    }),
};

// ============================================================================
// AUTHENTICATION & AUTHORIZATION ENDPOINTS
// ============================================================================

export const authAPI = {
  getCurrentUser: () =>
    apiCall("/auth/me/"),

  checkPermission: (permission: string) =>
    apiCall("/auth/check-permission/", {
      method: "POST",
      body: JSON.stringify({ permission }),
    }),

  getAvailableRoles: () =>
    apiCall("/admin-roles/"),
};

// ============================================================================
// CLIENT MANAGEMENT ENDPOINTS
// ============================================================================

export const clientAPI = {
  listClients: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/clients/?${params}`);
  },

  getClient: (id: number) =>
    apiCall(`/clients/${id}/`),

  updateClient: (id: number, data: Record<string, any>) =>
    apiCall(`/clients/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateClient: (id: number, data: Record<string, any>) =>
    apiCall(`/clients/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performAction: (id: number, action: string, data?: Record<string, any>) =>
    apiCall(`/clients/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  getEngagementHistory: (id: number) =>
    apiCall(`/clients/${id}/engagement-history/`),

  getStats: () =>
    apiCall("/clients/stats/"),

  // Documents
  listDocuments: (clientId: number) =>
    apiCall(`/clients/${clientId}/documents/`),

  uploadDocument: (clientId: number, formData: FormData) =>
    fetch(`${BASE_URL}/clients/${clientId}/documents/`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json()),

  getDocument: (clientId: number, docId: number) =>
    apiCall(`/clients/${clientId}/documents/${docId}/`),

  updateDocument: (clientId: number, docId: number, data: Record<string, any>) =>
    apiCall(`/clients/${clientId}/documents/${docId}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteDocument: (clientId: number, docId: number) =>
    apiCall(`/clients/${clientId}/documents/${docId}/`, {
      method: "DELETE",
    }),
};

// ============================================================================
// CONTENT MANAGEMENT ENDPOINTS
// ============================================================================

export const contentAPI = {
  listContent: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/content/?${params}`);
  },

  createContent: (data: Record<string, any>) =>
    apiCall("/content/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getContent: (id: number) =>
    apiCall(`/content/${id}/`),

  updateContent: (id: number, data: Record<string, any>) =>
    apiCall(`/content/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateContent: (id: number, data: Record<string, any>) =>
    apiCall(`/content/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteContent: (id: number) =>
    apiCall(`/content/${id}/`, {
      method: "DELETE",
    }),

  previewContent: (id: number) =>
    apiCall(`/content/${id}/preview/`),

  publishContent: (id: number, action: "publish" | "unpublish" | "archive") =>
    apiCall(`/content/${id}/publish/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  createVersion: (id: number) =>
    apiCall(`/content/${id}/versions/`, {
      method: "POST",
    }),

  bulkActions: (action: string, contentIds: number[]) =>
    apiCall("/content/bulk-actions/", {
      method: "POST",
      body: JSON.stringify({ action, content_ids: contentIds }),
    }),

  getStats: () =>
    apiCall("/content/stats/"),
};

// ============================================================================
// COMPLIANCE & DATA MANAGEMENT ENDPOINTS
// ============================================================================

export const complianceAPI = {
  getComplianceReport: () =>
    apiCall("/compliance/compliance-report/"),

  exportClientData: (clientId: number) =>
    apiCall("/compliance/export-client-data/", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    }),

  deleteClientData: (clientId: number) =>
    apiCall("/compliance/delete-client-data/", {
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
    return apiCall(`/meetings/?${params}`);
  },

  getMeeting: (id: number) =>
    apiCall(`/meetings/${id}/`),

  updateMeeting: (id: number, data: Record<string, any>) =>
    apiCall(`/meetings/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateMeeting: (id: number, data: Record<string, any>) =>
    apiCall(`/meetings/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performAction: (id: number, action: "confirm" | "reschedule" | "decline" | "complete" | "cancel", data?: Record<string, any>) =>
    apiCall(`/meetings/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  assignHost: (id: number, hostId: number) =>
    apiCall(`/meetings/${id}/assign/`, {
      method: "POST",
      body: JSON.stringify({ host_id: hostId }),
    }),

  getMyMeetings: () =>
    apiCall("/meetings/my-meetings/"),

  getUpcomingMeetings: () =>
    apiCall("/meetings/upcoming/"),

  getStats: () =>
    apiCall("/meetings/stats/"),
};

// ============================================================================
// NOTIFICATIONS ENDPOINTS
// ============================================================================

export const notificationAPI = {
  listNotifications: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/notifications/?${params}`);
  },

  getNotification: (id: number) =>
    apiCall(`/notifications/${id}/`),

  performAction: (id: number, action: "mark_read" | "mark_unread") =>
    apiCall(`/notifications/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  bulkActions: (action: "mark_all_read" | "delete_read" | "delete_all") =>
    apiCall("/notifications/bulk-actions/", {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  getStats: () =>
    apiCall("/notifications/stats/"),
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
    return apiCall(`/search/global/?${params}`);
  },

  quickSearch: (query: string) => {
    const params = new URLSearchParams({ q: query });
    return apiCall(`/search/quick/?${params}`);
  },
};

// ============================================================================
// SETTINGS & SYSTEM CONFIG ENDPOINTS
// ============================================================================

export const settingsAPI = {
  // Audit Logs
  getAuditLogs: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters || {});
    return apiCall(`/settings/audit-logs/?${params}`);
  },

  // Roles
  listRoles: () =>
    apiCall("/settings/roles/"),

  createRole: (data: Record<string, any>) =>
    apiCall("/settings/roles/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRole: (id: number) =>
    apiCall(`/settings/roles/${id}/`),

  updateRole: (id: number, data: Record<string, any>) =>
    apiCall(`/settings/roles/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateRole: (id: number, data: Record<string, any>) =>
    apiCall(`/settings/roles/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteRole: (id: number) =>
    apiCall(`/settings/roles/${id}/`, {
      method: "DELETE",
    }),

  // System Settings
  getSystemSettings: () =>
    apiCall("/settings/system/"),

  updateSystemSettings: (data: Record<string, any>) =>
    apiCall("/settings/system/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Users
  listUsers: () =>
    apiCall("/settings/users/"),

  getUser: (id: number) =>
    apiCall(`/settings/users/${id}/`),

  updateUser: (id: number, data: Record<string, any>) =>
    apiCall(`/settings/users/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateUser: (id: number, data: Record<string, any>) =>
    apiCall(`/settings/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performUserAction: (id: number, action: "activate" | "deactivate" | "reset_password") =>
    apiCall(`/settings/users/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  createUser: (data: Record<string, any>) =>
    apiCall("/settings/users/create/", {
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
    return apiCall(`/tickets/?${params}`);
  },

  createTicket: (data: Record<string, any>) =>
    apiCall("/tickets/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTicket: (id: number) =>
    apiCall(`/tickets/${id}/`),

  updateTicket: (id: number, data: Record<string, any>) =>
    apiCall(`/tickets/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  partialUpdateTicket: (id: number, data: Record<string, any>) =>
    apiCall(`/tickets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  performAction: (id: number, action: string, data?: Record<string, any>) =>
    apiCall(`/tickets/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }),

  // Messages
  listMessages: (ticketId: number) =>
    apiCall(`/tickets/${ticketId}/messages/`),

  addMessage: (ticketId: number, message: string, isInternal: boolean = false) =>
    apiCall(`/tickets/${ticketId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ message, is_internal: isInternal }),
    }),

  getMyTickets: () =>
    apiCall("/tickets/my-tickets/"),

  getStats: () =>
    apiCall("/tickets/stats/"),
};
