/**
 * ORR Admin Portal API Service
 * Centralized API functions for all backend requests
 * Base URL: /admin-portal/v1/
 */

const BASE_URL =  "https://orr-backend-web-latest.onrender.com";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Enhanced error handling utility
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

function createApiError(response: Response, errorData: any): ApiError {
  // For 500 errors, include the full error details in the message
  let baseMessage = errorData?.message || errorData?.detail || `API Error: ${response.status} ${response.statusText}`;
  
  if (response.status === 500 && errorData) {
    // Include full error details for 500 errors
    baseMessage = `Internal Server Error (500): ${JSON.stringify(errorData)}`;
  }
  
  return {
    message: baseMessage,
    status: response.status,
    code: errorData?.code || `HTTP_${response.status}`,
    details: errorData
  };
}

function logApiCall(method: string, endpoint: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.group(`🌐 [API ${method}] ${endpoint} - ${timestamp}`);
  if (data && Object.keys(data).length > 0) {
    console.log('📤 Request Data:', data);
  }
  console.groupEnd();
}

function logApiSuccess(endpoint: string, data: any) {
  const timestamp = new Date().toISOString();
  console.group(`✅ [API SUCCESS] ${endpoint} - ${timestamp}`);
  console.log('📥 Response Data:', data);
  console.groupEnd();
}

function logApiError(endpoint: string, error: any) {
  const timestamp = new Date().toISOString();
  console.group(`❌ [API ERROR] ${endpoint} - ${timestamp}`);
  console.error('💥 Error Details:', error);
  if (error.stack) {
    console.error('📍 Stack Trace:', error.stack);
  }
  console.groupEnd();
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  const method = options.method || 'GET';
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  // Log the API call
  try {
    logApiCall(method, endpoint, options.body ? JSON.parse(options.body as string) : undefined);
  } catch (e) {
    logApiCall(method, endpoint, 'FormData or non-JSON body');
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = {};
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = { message: await response.text() };
        }
      } catch (parseError) {
        console.warn('Failed to parse error response:', parseError);
        errorData = { message: `HTTP ${response.status} ${response.statusText}` };
      }
      
      const apiError = createApiError(response, errorData);
      
      // Attach the original response for detailed error handling
      const error = new Error(apiError.message);
      (error as any).response = response;
      (error as any).status = response.status;
      (error as any).details = errorData;
      
      // Handle specific HTTP status codes
      switch (response.status) {
        case 401:
          console.warn('🔐 Unauthorized access - token may be expired or invalid');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-storage');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          console.warn('🚫 Forbidden - insufficient permissions');
          break;
        case 404:
          console.warn('🔍 Resource not found');
          break;
        case 422:
          console.warn('📝 Validation error - check request data');
          // Handle specific constraint violations
          if (errorData.message && errorData.message.includes('duplicate key value violates unique constraint')) {
            console.error('🔑 Database constraint violation - duplicate entry detected');
            if (errorData.message.includes('user_id')) {
              console.error('👤 User ID already exists - this user may already be registered');
            }
            if (errorData.message.includes('email')) {
              console.error('📧 Email already exists - please use a different email');
            }
            if (errorData.message.includes('username')) {
              console.error('👤 Username already exists - please use a different username');
            }
          }
          break;
        case 429:
          console.warn('⏱️ Rate limit exceeded - too many requests');
          break;
        case 500:
          console.error('🔥 Internal server error');
      console.error('Full error response:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
          break;
        case 502:
          console.error('🌐 Bad gateway - server is down or unreachable');
          break;
        case 503:
          console.error('⚠️ Service unavailable - server is temporarily down');
          break;
        default:
          console.error(`❓ Unexpected error: ${response.status}`);
      }
      
      logApiError(endpoint, apiError);
      throw error;
    }

    const responseData = await response.json();
    logApiSuccess(endpoint, responseData);
    return responseData;
  } catch (error) {
    if (!(error instanceof Error && error.message.includes('API Error'))) {
      logApiError(endpoint, error);
    }
    throw error;
  }
}

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

export const dashboardAPI = {
  getOverview: () => {
    console.log('[API] Fetching dashboard overview');
    return apiCall("/admin-portal/v1/dashboard/overview/").catch(error => {
      console.error('[API ERROR] Failed to fetch dashboard overview:', error);
      throw error;
    });
  },

  getQuickStats: () => {
    console.log('[API] Fetching dashboard quick stats');
    return apiCall("/admin-portal/v1/dashboard/quick-stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch dashboard quick stats:', error);
      throw error;
    });
  },

  getRecentActivity: () => {
    console.log('[API] Fetching dashboard recent activity');
    return apiCall("/admin-portal/v1/dashboard/recent-activity/").catch(error => {
      console.error('[API ERROR] Failed to fetch dashboard recent activity:', error);
      throw error;
    });
  },
};

// ============================================================================
// AI & CHAT OVERSIGHT ENDPOINTS
// ============================================================================

export const aiOversightAPI = {
  listConversations: (filters?: Record<string, any>) => {
    console.log('[API] Fetching AI conversations with filters:', filters);
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/admin-portal/v1/ai-oversight/conversations/${queryString ? `?${queryString}` : ''}`).catch(error => {
      console.error('[API ERROR] Failed to fetch AI conversations:', error);
      throw error;
    });
  },

  getConversation: (id: number) => {
    console.log(`[API] Fetching AI conversation ${id}`);
    return apiCall(`/admin-portal/v1/ai-oversight/conversations/${id}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch AI conversation ${id}:`, error);
      throw error;
    });
  },

  performAction: (id: number, action: string, data?: Record<string, any>) => {
    console.log(`[API] Performing action '${action}' on AI conversation ${id}:`, data);
    return apiCall(`/admin-portal/v1/ai-oversight/conversations/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform action '${action}' on AI conversation ${id}:`, error);
      throw error;
    });
  },

  getStats: () => {
    console.log('[API] Fetching AI oversight stats');
    return apiCall("/admin-portal/v1/ai-oversight/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch AI oversight stats:', error);
      throw error;
    });
  },
};

// ============================================================================
// ANALYTICS & REPORTING ENDPOINTS
// ============================================================================

export const analyticsAPI = {
  getClientAnalytics: () => {
    console.log('[API] Fetching client analytics');
    return apiCall("/admin-portal/v1/analytics/clients/").catch(error => {
      console.error('[API ERROR] Failed to fetch client analytics:', error);
      throw error;
    });
  },

  getContentAnalytics: () => {
    console.log('[API] Fetching content analytics');
    return apiCall("/admin-portal/v1/analytics/content/").catch(error => {
      console.error('[API ERROR] Failed to fetch content analytics:', error);
      throw error;
    });
  },

  getOverview: () => {
    console.log('[API] Fetching analytics overview');
    return apiCall("/admin-portal/v1/analytics/overview/").catch(error => {
      console.error('[API ERROR] Failed to fetch analytics overview:', error);
      throw error;
    });
  },

  exportData: (format: "csv" | "pdf", dateRange?: { start: string; end: string }) => {
    console.log(`[API] Exporting analytics data in ${format} format:`, dateRange);
    return apiCall("/admin-portal/v1/analytics/export/", {
      method: "POST",
      body: JSON.stringify({ format, date_range: dateRange }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to export analytics data in ${format} format:`, error);
      throw error;
    });
  },
};

// ============================================================================
// AUTHENTICATION & AUTHORIZATION ENDPOINTS
// ============================================================================

export const authAPI = {
  login: (email: string, password: string) => {
    console.log(`[API] Attempting login for email: ${email}`);
    return apiCall("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then(response => {
      console.log('[API SUCCESS] Login successful');
      return response;
    }).catch(error => {
      console.error('[API ERROR] Login failed:', error);
      throw error;
    });
  },

  getCurrentUser: () => {
    console.log('[API] Fetching current user');
    return apiCall("/admin-portal/v1/auth/me/").catch(error => {
      console.error('[API ERROR] Failed to fetch current user:', error);
      throw error;
    });
  },

  checkPermission: (permission: string) => {
    console.log(`[API] Checking permission: ${permission}`);
    return apiCall("/admin-portal/v1/auth/check-permission/", {
      method: "POST",
      body: JSON.stringify({ permission }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to check permission '${permission}':`, error);
      throw error;
    });
  },

  getAvailableRoles: () => {
    console.log('[API] Fetching available roles');
    return apiCall("/admin-portal/v1/admin-roles/").catch(error => {
      console.error('[API ERROR] Failed to fetch available roles:', error);
      throw error;
    });
  },
};

// ============================================================================
// CLIENT MANAGEMENT ENDPOINTS
// ============================================================================

export const clientAPI = {
  listClients: (filters?: Record<string, any>) => {
    console.log('[API] Fetching clients with filters:', filters);
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/admin-portal/v1/clients/${queryString ? `?${queryString}` : ''}`).catch(error => {
      console.error('[API ERROR] Failed to fetch clients:', error);
      throw error;
    });
  },

  createClient: (data: Record<string, any>) => {
    console.log('[API] Creating client:', data);
    return apiCall("/admin-portal/v1/clients/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to create client:', error);
      throw error;
    });
  },

  getClient: (id: number) => {
    console.log(`[API] Fetching client ${id}`);
    return apiCall(`/admin-portal/v1/clients/${id}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch client ${id}:`, error);
      throw error;
    });
  },

  updateClient: (id: number, data: Record<string, any>) => {
    console.log(`[API] Updating client ${id}:`, data);
    return apiCall(`/admin-portal/v1/clients/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update client ${id}:`, error);
      throw error;
    });
  },

  partialUpdateClient: (id: number, data: Record<string, any>) => {
    console.log(`[API] Partially updating client ${id}:`, data);
    return apiCall(`/admin-portal/v1/clients/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to partially update client ${id}:`, error);
      throw error;
    });
  },

  performAction: (id: number, action: string, data?: Record<string, any>) => {
    console.log(`[API] Performing action '${action}' on client ${id}:`, data);
    return apiCall(`/admin-portal/v1/clients/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform action '${action}' on client ${id}:`, error);
      throw error;
    });
  },

  getEngagementHistory: (id: number) => {
    console.log(`[API] Fetching engagement history for client ${id}`);
    return apiCall(`/admin-portal/v1/clients/${id}/engagement-history/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch engagement history for client ${id}:`, error);
      throw error;
    });
  },

  getCompleteProfile: (id: number) => {
    console.log(`[API] Fetching complete profile for client ${id}`);
    return apiCall(`/admin-portal/v1/clients/${id}/complete-profile/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch complete profile for client ${id}:`, error);
      throw error;
    });
  },

  getStats: () => {
    console.log('[API] Fetching client stats');
    return apiCall("/admin-portal/v1/clients/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch client stats:', error);
      throw error;
    });
  },

  // Documents
  listDocuments: (clientId: number) => {
    console.log(`[API] Fetching documents for client ${clientId}`);
    return apiCall(`/admin-portal/v1/clients/${clientId}/documents/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch documents for client ${clientId}:`, error);
      throw error;
    });
  },

  uploadDocument: (clientId: number, formData: FormData) => {
    console.log(`[API] Uploading document for client ${clientId}`);
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    return fetch(`${BASE_URL}/admin-portal/v1/clients/${clientId}/documents/`, {
      method: "POST",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        console.error(`[API ERROR] Failed to upload document for client ${clientId}:`, res.status, res.statusText);
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }
      console.log(`[API SUCCESS] Document uploaded for client ${clientId}`);
      return res.json();
    }).catch(error => {
      console.error(`[API ERROR] Failed to upload document for client ${clientId}:`, error);
      throw error;
    });
  },

  getDocument: (clientId: number, docId: number) => {
    console.log(`[API] Fetching document ${docId} for client ${clientId}`);
    return apiCall(`/admin-portal/v1/clients/${clientId}/documents/${docId}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch document ${docId} for client ${clientId}:`, error);
      throw error;
    });
  },

  updateDocument: (clientId: number, docId: number, data: Record<string, any>) => {
    console.log(`[API] Updating document ${docId} for client ${clientId}:`, data);
    return apiCall(`/admin-portal/v1/clients/${clientId}/documents/${docId}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update document ${docId} for client ${clientId}:`, error);
      throw error;
    });
  },

  partialUpdateDocument: (clientId: number, docId: number, data: Record<string, any>) => {
    console.log(`[API] Partially updating document ${docId} for client ${clientId}:`, data);
    return apiCall(`/admin-portal/v1/clients/${clientId}/documents/${docId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to partially update document ${docId} for client ${clientId}:`, error);
      throw error;
    });
  },

  deleteDocument: (clientId: number, docId: number) => {
    console.log(`[API] Deleting document ${docId} for client ${clientId}`);
    return apiCall(`/admin-portal/v1/clients/${clientId}/documents/${docId}/`, {
      method: "DELETE",
    }).catch(error => {
      console.error(`[API ERROR] Failed to delete document ${docId} for client ${clientId}:`, error);
      throw error;
    });
  },
};

// ============================================================================
// CONTENT MANAGEMENT ENDPOINTS
// ============================================================================

export const contentAPI = {
  listContent: (filters?: Record<string, any>) => {
    console.log('[API] Fetching content with filters:', filters);
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/admin-portal/v1/content/${queryString ? `?${queryString}` : ''}`).catch(error => {
      console.error('[API ERROR] Failed to fetch content:', error);
      throw error;
    });
  },

  createContent: (data: FormData | Record<string, any>) => {
    console.log('[API] Creating content:', data instanceof FormData ? 'FormData with file' : data);
    if (data instanceof FormData) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      return fetch(`${BASE_URL}/admin-portal/v1/content/`, {
        method: "POST",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: data,
      }).then(res => {
        if (!res.ok) {
          console.error('[API ERROR] Failed to create content with file:', res.status, res.statusText);
          throw new Error(`Content creation failed: ${res.status} ${res.statusText}`);
        }
        console.log('[API SUCCESS] Content created successfully with file');
        return res.json();
      }).catch(error => {
        console.error('[API ERROR] Failed to create content with file:', error);
        throw error;
      });
    }
    return apiCall("/admin-portal/v1/content/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to create content:', error);
      throw error;
    });
  },

  getContent: (id: number) => {
    console.log(`[API] Fetching content ${id}`);
    return apiCall(`/admin-portal/v1/content/${id}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch content ${id}:`, error);
      throw error;
    });
  },

  updateContent: (id: number, data: Record<string, any>) => {
    console.log(`[API] Updating content ${id}:`, data);
    return apiCall(`/admin-portal/v1/content/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update content ${id}:`, error);
      throw error;
    });
  },

  partialUpdateContent: (id: number, data: Record<string, any>) => {
    console.log(`[API] Partially updating content ${id}:`, data);
    return apiCall(`/admin-portal/v1/content/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to partially update content ${id}:`, error);
      throw error;
    });
  },

  deleteContent: (id: number) => {
    console.log(`[API] Deleting content ${id}`);
    return apiCall(`/admin-portal/v1/content/${id}/`, {
      method: "DELETE",
    }).catch(error => {
      console.error(`[API ERROR] Failed to delete content ${id}:`, error);
      throw error;
    });
  },

  previewContent: (id: number) => {
    console.log(`[API] Previewing content ${id}`);
    return apiCall(`/admin-portal/v1/content/${id}/preview/`).catch(error => {
      console.error(`[API ERROR] Failed to preview content ${id}:`, error);
      throw error;
    });
  },

  publishContent: (id: number, action: "publish" | "unpublish" | "archive") => {
    console.log(`[API] Publishing content ${id} with action:`, action);
    return apiCall(`/admin-portal/v1/content/${id}/publish/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to publish content ${id}:`, error);
      throw error;
    });
  },

  createVersion: (id: number) => {
    console.log(`[API] Creating version for content ${id}`);
    return apiCall(`/admin-portal/v1/content/${id}/versions/`, {
      method: "POST",
    }).catch(error => {
      console.error(`[API ERROR] Failed to create version for content ${id}:`, error);
      throw error;
    });
  },

  bulkActions: (action: string, contentIds: number[]) => {
    console.log(`[API] Performing bulk action '${action}' on content IDs:`, contentIds);
    return apiCall("/admin-portal/v1/content/bulk-actions/", {
      method: "POST",
      body: JSON.stringify({ action, content_ids: contentIds }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform bulk action '${action}':`, error);
      throw error;
    });
  },

  getStats: () => {
    console.log('[API] Fetching content stats');
    return apiCall("/admin-portal/v1/content/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch content stats:', error);
      throw error;
    });
  },

  incrementViewCount: (id: number) => {
    console.log(`[API] Incrementing view count for content ${id}`);
    return apiCall(`/admin-portal/v1/content/${id}/view/`, {
      method: "POST",
    }).catch(error => {
      console.error(`[API ERROR] Failed to increment view count for content ${id}:`, error);
      throw error;
    });
  },
};

// ============================================================================
// MEETING MANAGEMENT ENDPOINTS
// ============================================================================

export const meetingAPI = {
  listMeetings: (filters?: Record<string, any>) => {
    console.log('[API] Fetching meetings with filters:', filters);
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/admin-portal/v1/meetings/${queryString ? `?${queryString}` : ''}`)
      .then((response: any) => {
        // Handle wrapped response format
        if (response && response.data) {
          return response.data;
        }
        return response;
      })
      .catch(error => {
        console.error('[API ERROR] Failed to fetch meetings:', error);
        throw error;
      });
  },

  createMeeting: (data: Record<string, any>) => {
    console.log('[API] Creating meeting:', data);
    return apiCall("/admin-portal/v1/meetings/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to create meeting:', error);
      throw error;
    });
  },

  getMeeting: (id: number) => {
    console.log(`[API] Fetching meeting ${id}`);
    return apiCall(`/admin-portal/v1/meetings/${id}/`)
      .then((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      })
      .catch(error => {
        console.error(`[API ERROR] Failed to fetch meeting ${id}:`, error);
        throw error;
      });
  },

  updateMeeting: (id: number, data: Record<string, any>) => {
    console.log(`[API] Updating meeting ${id}:`, data);
    return apiCall(`/admin-portal/v1/meetings/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update meeting ${id}:`, error);
      throw error;
    });
  },

  partialUpdateMeeting: (id: number, data: Record<string, any>) => {
    console.log(`[API] Partially updating meeting ${id}:`, data);
    return apiCall(`/admin-portal/v1/meetings/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to partially update meeting ${id}:`, error);
      throw error;
    });
  },

  performAction: (id: number, action: "confirm" | "reschedule" | "decline" | "complete" | "cancel", data?: Record<string, any>) => {
    console.log(`[API] Performing action '${action}' on meeting ${id}:`, data);
    return apiCall(`/admin-portal/v1/meetings/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform action '${action}' on meeting ${id}:`, error);
      throw error;
    });
  },

  assignHost: (id: number, hostId: number) => {
    console.log(`[API] Assigning host ${hostId} to meeting ${id}`);
    return apiCall(`/admin-portal/v1/meetings/${id}/assign/`, {
      method: "POST",
      body: JSON.stringify({ host_id: hostId }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to assign host to meeting ${id}:`, error);
      throw error;
    });
  },

  getMyMeetings: () => {
    console.log('[API] Fetching my meetings');
    return apiCall("/admin-portal/v1/meetings/my-meetings/").catch(error => {
      console.error('[API ERROR] Failed to fetch my meetings:', error);
      throw error;
    });
  },

  getConfirmedMeetings: (hostId?: number) => {
    console.log('[API] Fetching confirmed meetings', hostId ? `for host ${hostId}` : '');
    const params = hostId ? `?host_id=${hostId}` : '';
    return apiCall(`/admin-portal/v1/meetings/confirmed/${params}`)
      .then((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      })
      .catch(error => {
        console.error('[API ERROR] Failed to fetch confirmed meetings:', error);
        throw error;
      });
  },

  getRequestedMeetings: (hostId?: number) => {
    console.log('[API] Fetching requested meetings', hostId ? `for host ${hostId}` : '');
    const params = hostId ? `?host_id=${hostId}` : '';
    return apiCall(`/admin-portal/v1/meetings/requested/${params}`)
      .then((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      })
      .catch(error => {
        console.error('[API ERROR] Failed to fetch requested meetings:', error);
        throw error;
      });
  },

  getUpcomingMeetings: () => {
    console.log('[API] Fetching upcoming meetings');
    return apiCall("/admin-portal/v1/meetings/upcoming/").catch(error => {
      console.error('[API ERROR] Failed to fetch upcoming meetings:', error);
      throw error;
    });
  },

  getStats: () => {
    console.log('[API] Fetching meeting stats');
    return apiCall("/admin-portal/v1/meetings/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch meeting stats:', error);
      throw error;
    });
  },
};

// ============================================================================
// NOTIFICATIONS ENDPOINTS
// ============================================================================

export const notificationAPI = {
  listNotifications: (filters?: Record<string, any>) => {
    console.log('[API] Fetching notifications with filters:', filters);
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/admin-portal/v1/notifications/${queryString ? `?${queryString}` : ''}`).catch(error => {
      console.error('[API ERROR] Failed to fetch notifications:', error);
      throw error;
    });
  },

  createNotification: (data: Record<string, any>) => {
    console.log('[API] Creating notification:', data);
    return apiCall("/admin-portal/v1/notifications/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to create notification:', error);
      throw error;
    });
  },

  getNotification: (id: number) => {
    console.log(`[API] Fetching notification ${id}`);
    return apiCall(`/admin-portal/v1/notifications/${id}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch notification ${id}:`, error);
      throw error;
    });
  },

  performAction: (id: number, action: "mark_read" | "mark_unread") => {
    console.log(`[API] Performing action '${action}' on notification ${id}`);
    return apiCall(`/admin-portal/v1/notifications/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform action '${action}' on notification ${id}:`, error);
      throw error;
    });
  },

  bulkActions: (action: "mark_all_read" | "delete_read" | "delete_all") => {
    console.log(`[API] Performing bulk notification action '${action}'`);
    return apiCall("/admin-portal/v1/notifications/bulk-actions/", {
      method: "POST",
      body: JSON.stringify({ action }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform bulk notification action '${action}':`, error);
      throw error;
    });
  },

  getStats: () => {
    console.log('[API] Fetching notification stats');
    return apiCall("/admin-portal/v1/notifications/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch notification stats:', error);
      throw error;
    });
  },
};

// ============================================================================
// SEARCH & NAVIGATION ENDPOINTS
// ============================================================================

export const searchAPI = {
  globalSearch: (query: string, type?: "all" | "clients" | "tickets" | "meetings" | "content", limit?: number) => {
    console.log(`[API] Performing global search for '${query}' with type '${type}' and limit ${limit}`);
    const params = new URLSearchParams({
      q: query,
      ...(type && { type }),
      ...(limit && { limit: limit.toString() }),
    });
    return apiCall(`/admin-portal/v1/search/global/?${params}`).catch(error => {
      console.error(`[API ERROR] Failed to perform global search for '${query}':`, error);
      throw error;
    });
  },

  quickSearch: (query: string) => {
    console.log(`[API] Performing quick search for '${query}'`);
    const params = new URLSearchParams({ q: query });
    return apiCall(`/admin-portal/v1/search/quick/?${params}`).catch(error => {
      console.error(`[API ERROR] Failed to perform quick search for '${query}':`, error);
      throw error;
    });
  },
};

// ============================================================================
// SETTINGS & SYSTEM CONFIG ENDPOINTS
// ============================================================================

export const settingsAPI = {
  getAuditLogs: (filters?: Record<string, any>) => {
    console.log('[API] Fetching audit logs with filters:', filters);
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/admin-portal/v1/settings/audit-logs/${queryString ? `?${queryString}` : ''}`).catch(error => {
      console.error('[API ERROR] Failed to fetch audit logs:', error);
      throw error;
    });
  },

  listRoles: () => {
    console.log('[API] Fetching roles');
    return apiCall("/admin-portal/v1/settings/roles/").catch(error => {
      console.error('[API ERROR] Failed to fetch roles:', error);
      throw error;
    });
  },

  createRole: (data: Record<string, any>) => {
    console.log('[API] Creating role:', data);
    return apiCall("/admin-portal/v1/settings/roles/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to create role:', error);
      throw error;
    });
  },

  getRole: (id: number) => {
    console.log(`[API] Fetching role ${id}`);
    return apiCall(`/admin-portal/v1/settings/roles/${id}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch role ${id}:`, error);
      throw error;
    });
  },

  updateRole: (id: number, data: Record<string, any>) => {
    console.log(`[API] Updating role ${id}:`, data);
    return apiCall(`/admin-portal/v1/settings/roles/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update role ${id}:`, error);
      throw error;
    });
  },

  partialUpdateRole: (id: number, data: Record<string, any>) => {
    console.log(`[API] Partially updating role ${id}:`, data);
    return apiCall(`/admin-portal/v1/settings/roles/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to partially update role ${id}:`, error);
      throw error;
    });
  },

  deleteRole: (id: number) => {
    console.log(`[API] Deleting role ${id}`);
    return apiCall(`/admin-portal/v1/settings/roles/${id}/`, {
      method: "DELETE",
    }).catch(error => {
      console.error(`[API ERROR] Failed to delete role ${id}:`, error);
      throw error;
    });
  },

  getSystemSettings: () => {
    console.log('[API] Fetching system settings');
    return apiCall("/admin-portal/v1/settings/system/").catch(error => {
      console.error('[API ERROR] Failed to fetch system settings:', error);
      throw error;
    });
  },

  updateSystemSettings: (data: Record<string, any>) => {
    console.log('[API] Updating system settings:', data);
    return apiCall("/admin-portal/v1/settings/system/", {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to update system settings:', error);
      throw error;
    });
  },

  listUsers: () => {
    console.log('[API] Fetching users');
    return apiCall("/admin-portal/v1/settings/users/").catch(error => {
      console.error('[API ERROR] Failed to fetch users:', error);
      throw error;
    });
  },

  getUser: (id: number) => {
    console.log(`[API] Fetching user ${id}`);
    return apiCall(`/admin-portal/v1/settings/users/${id}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch user ${id}:`, error);
      throw error;
    });
  },

  updateUser: (id: number, data: Record<string, any>) => {
    console.log(`[API] Updating user ${id}:`, data);
    return apiCall(`/admin-portal/v1/settings/users/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update user ${id}:`, error);
      throw error;
    });
  },

  partialUpdateUser: (id: number, data: Record<string, any>) => {
    console.log(`[API] Partially updating user ${id}:`, data);
    return apiCall(`/admin-portal/v1/settings/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to partially update user ${id}:`, error);
      throw error;
    });
  },

  performUserAction: (id: number, action: "activate" | "deactivate" | "reset_password") => {
    console.log(`[API] Performing action '${action}' on user ${id}`);
    return apiCall(`/admin-portal/v1/settings/users/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform action '${action}' on user ${id}:`, error);
      throw error;
    });
  },

  createUser: (data: Record<string, any>) => {
    console.log('[API] Creating user:', data);
    return apiCall("/admin-portal/v1/settings/users/create/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to create user:', error);
      throw error;
    });
  },
};

// ============================================================================
// TICKET MANAGEMENT ENDPOINTS
// ============================================================================

export const ticketAPI = {
  listTickets: (filters?: Record<string, any>) => {
    console.log('[API] Fetching tickets with filters:', filters);
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/admin-portal/v1/tickets/${queryString ? `?${queryString}` : ''}`).catch(error => {
      console.error('[API ERROR] Failed to fetch tickets:', error);
      throw error;
    });
  },

  createTicket: (data: Record<string, any>) => {
    console.log('[API] Creating ticket:', data);
    return apiCall("/admin-portal/v1/tickets/", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to create ticket:', error);
      throw error;
    });
  },

  getTicket: (id: number) => {
    console.log(`[API] Fetching ticket ${id}`);
    return apiCall(`/admin-portal/v1/tickets/${id}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch ticket ${id}:`, error);
      throw error;
    });
  },

  updateTicket: (id: number, data: Record<string, any>) => {
    console.log(`[API] Updating ticket ${id}:`, data);
    return apiCall(`/admin-portal/v1/tickets/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update ticket ${id}:`, error);
      throw error;
    });
  },

  partialUpdateTicket: (id: number, data: Record<string, any>) => {
    console.log(`[API] Partially updating ticket ${id}:`, data);
    return apiCall(`/admin-portal/v1/tickets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to partially update ticket ${id}:`, error);
      throw error;
    });
  },

  performAction: (id: number, action: string, data?: Record<string, any>) => {
    console.log(`[API] Performing action '${action}' on ticket ${id}:`, data);
    return apiCall(`/admin-portal/v1/tickets/${id}/actions/`, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to perform action '${action}' on ticket ${id}:`, error);
      throw error;
    });
  },

  listMessages: (ticketId: number) => {
    console.log(`[API] Fetching messages for ticket ${ticketId}`);
    return apiCall(`/admin-portal/v1/tickets/${ticketId}/messages/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch messages for ticket ${ticketId}:`, error);
      throw error;
    });
  },

  addMessage: (ticketId: number, message: string, isInternal: boolean = false) => {
    console.log(`[API] Adding message to ticket ${ticketId}:`, { message, isInternal });
    return apiCall(`/admin-portal/v1/tickets/${ticketId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ message, is_internal: isInternal }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to add message to ticket ${ticketId}:`, error);
      throw error;
    });
  },

  getMyTickets: () => {
    console.log('[API] Fetching my tickets');
    return apiCall("/admin-portal/v1/tickets/my-tickets/").catch(error => {
      console.error('[API ERROR] Failed to fetch my tickets:', error);
      throw error;
    });
  },

  getStats: () => {
    console.log('[API] Fetching ticket stats');
    return apiCall("/admin-portal/v1/tickets/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch ticket stats:', error);
      throw error;
    });
  },

  getAssignableUsers: () => {
    console.log('[API] Fetching assignable users');
    return apiCall("/admin-portal/v1/tickets/assignable-users/").catch(error => {
      console.error('[API ERROR] Failed to fetch assignable users:', error);
      throw error;
    });
  },
};

// ============================================================================
// BILLING & PAYMENT ENDPOINTS
// ============================================================================

export const billingAPI = {
  getHistory: (filters?: Record<string, any>) => {
    console.log('[API] Fetching billing history with filters:', filters);
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
    ).catch(error => {
      console.error('[API ERROR] Failed to fetch billing history:', error);
      throw error;
    });
  },

  getStats: () => {
    console.log('[API] Fetching billing stats');
    return apiCall("/admin-portal/v1/billing-history/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch billing stats:', error);
      throw error;
    });
  },

  getPricingPlans: () => {
    console.log('[API] Fetching pricing plans');
    return apiCall("/admin-portal/v1/pricing-plans/").catch(error => {
      console.error('[API ERROR] Failed to fetch pricing plans:', error);
      throw error;
    });
  },

  createCheckoutSession: (planId: number, clientId: number) => {
    console.log(`[API] Creating checkout session for plan ${planId} and client ${clientId}`);
    return apiCall("/admin-portal/v1/payments/create-checkout/", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, client_id: clientId }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to create checkout session for plan ${planId}:`, error);
      throw error;
    });
  },

  changePlan: (subscriptionId: string, newPlanId: number) => {
    console.log(`[API] Changing plan for subscription ${subscriptionId} to plan ${newPlanId}`);
    return apiCall("/admin-portal/v1/subscriptions/change-plan/", {
      method: "POST",
      body: JSON.stringify({ subscription_id: subscriptionId, new_plan_id: newPlanId }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to change plan for subscription ${subscriptionId}:`, error);
      throw error;
    });
  },

  pauseSubscription: (subscriptionId: string) => {
    console.log(`[API] Pausing subscription ${subscriptionId}`);
    return apiCall("/admin-portal/v1/subscriptions/pause/", {
      method: "POST",
      body: JSON.stringify({ subscription_id: subscriptionId }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to pause subscription ${subscriptionId}:`, error);
      throw error;
    });
  },

  getPortalSession: (clientId: number) => {
    console.log(`[API] Getting portal session for client ${clientId}`);
    return apiCall("/admin-portal/v1/subscriptions/portal/", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    }).catch(error => {
      console.error(`[API ERROR] Failed to get portal session for client ${clientId}:`, error);
      throw error;
    });
  },

  getAllPayments: (filters?: Record<string, any>) => {
    console.log('[API] Fetching all payments with filters:', filters);
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
    ).catch(error => {
      console.error('[API ERROR] Failed to fetch all payments:', error);
      throw error;
    });
  },

  getAllPaymentStats: () => {
    console.log('[API] Fetching all payment stats');
    return apiCall("/admin-portal/v1/billing-history/stats/").catch(error => {
      console.error('[API ERROR] Failed to fetch all payment stats:', error);
      throw error;
    });
  },
};

// ============================================================================
// CMS API ENDPOINTS
// ============================================================================

export const cmsAPI = {
  getUserRole: async (): Promise<any> => {
    console.log('[API] Fetching user role and permissions');
    try {
      const userData = await apiCall<any>("/admin-portal/v1/auth/me/");
      console.log('[API SUCCESS] Current User Role:', userData?.role || userData?.user?.role);
      console.log('[API SUCCESS] Current User Permissions:', userData?.permissions || userData?.user?.permissions);
      console.log('[API SUCCESS] Full User Data:', userData);
      return userData;
    } catch (error) {
      console.error('[API ERROR] Failed to fetch user role:', error);
      throw error;
    }
  },

  getContent: (contentType: string) => {
    console.log(`[API] Fetching CMS content for type '${contentType}'`);
    return apiCall(`/admin-portal/v1/cms/${contentType}/`).catch(error => {
      console.error(`[API ERROR] Failed to fetch CMS content for type '${contentType}':`, error);
      throw error;
    });
  },

  updateContent: (contentType: string, data: Record<string, any>) => {
    console.log(`[API] Updating CMS content for type '${contentType}':`, data);
    
    // Handle special content types that need different endpoints
    let endpoint = `/admin-portal/v1/cms/${contentType}/`;
    
    // Map content types to their correct endpoints
    const endpointMap: Record<string, string> = {
      'contact-content': '/admin-portal/v1/cms/contact-content/',
      'services-content': '/admin-portal/v1/cms/services-content/',
      'resources-content': '/admin-portal/v1/cms/resources-content/',
      'legal-policy-content': '/admin-portal/v1/cms/legal-policy-content/',
      'how-we-operate': '/admin-portal/v1/cms/how-we-operate/',
      'living-systems': '/admin-portal/v1/cms/living-systems/',
    };
    
    if (endpointMap[contentType]) {
      endpoint = endpointMap[contentType];
    }
    
    return apiCall(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error(`[API ERROR] Failed to update CMS content for type '${contentType}':`, error);
      throw error;
    });
  },

  uploadImage: (formData: FormData) => {
    console.log('[API] Uploading image to CMS');
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    return fetch(`${BASE_URL}/admin-portal/v1/cms/upload-image/`, {
      method: "POST",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => {
      if (!res.ok) {
        console.error('[API ERROR] Failed to upload image:', res.status, res.statusText);
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }
      console.log('[API SUCCESS] Image uploaded successfully');
      return res.json();
    }).catch(error => {
      console.error('[API ERROR] Failed to upload image:', error);
      throw error;
    });
  },

  // Service Pillar Pages
  getStrategicAdvisoryContent: () => {
    console.log('[API] Fetching Strategic Advisory content');
    return apiCall("/admin-portal/v1/cms/strategic-advisory/").catch(error => {
      console.error('[API ERROR] Failed to fetch Strategic Advisory content:', error);
      throw error;
    });
  },

  updateStrategicAdvisoryContent: (data: Record<string, any>) => {
    console.log('[API] Updating Strategic Advisory content:', data);
    return apiCall("/admin-portal/v1/cms/strategic-advisory/", {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to update Strategic Advisory content:', error);
      throw error;
    });
  },

  getOperationalSystemsContent: () => {
    console.log('[API] Fetching Operational Systems content');
    return apiCall("/admin-portal/v1/cms/operational-systems/").catch(error => {
      console.error('[API ERROR] Failed to fetch Operational Systems content:', error);
      throw error;
    });
  },

  updateOperationalSystemsContent: (data: Record<string, any>) => {
    console.log('[API] Updating Operational Systems content:', data);
    return apiCall("/admin-portal/v1/cms/operational-systems/", {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to update Operational Systems content:', error);
      throw error;
    });
  },

  getLivingSystemsContent: () => {
    console.log('[API] Fetching Living Systems content');
    return apiCall("/admin-portal/v1/cms/living-systems/").catch(error => {
      console.error('[API ERROR] Failed to fetch Living Systems content:', error);
      throw error;
    });
  },

  updateLivingSystemsContent: (data: Record<string, any>) => {
    console.log('[API] Updating Living Systems content:', data);
    return apiCall("/admin-portal/v1/cms/living-systems/", {
      method: "PUT",
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('[API ERROR] Failed to update Living Systems content:', error);
      throw error;
    });
  },
};

// ============================================================================
// EXPORT ALL APIS
// ============================================================================

export default {
  dashboard: dashboardAPI,
  aiOversight: aiOversightAPI,
  analytics: analyticsAPI,
  auth: authAPI,
  client: clientAPI,
  content: contentAPI,
  meeting: meetingAPI,
  notification: notificationAPI,
  search: searchAPI,
  settings: settingsAPI,
  ticket: ticketAPI,
  billing: billingAPI,
  cms: cmsAPI,
};