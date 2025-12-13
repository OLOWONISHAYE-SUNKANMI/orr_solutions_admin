/**
 * React Hook for API Consumption
 * Provides easy-to-use hooks for all ORR Admin Portal APIs with built-in error handling
 */

import { useState, useEffect, useCallback } from 'react';
import {
  dashboardAPI,
  aiOversightAPI,
  analyticsAPI,
  authAPI,
  clientAPI,
  contentAPI,
  meetingAPI,
  notificationAPI,
  searchAPI,
  settingsAPI,
  ticketAPI,
  billingAPI,
  cmsAPI,
} from './api';

// Generic API state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Generic hook for API calls
function useApiCall<T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = [],
  immediate: boolean = true
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useApi] Fetching data...');
      
      const result = await apiFunction();
      setData(result);
      console.log('✅ [useApi] Data fetched successfully:', result);
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('❌ [useApi] Error fetching data:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Dashboard Hooks
export const useDashboardOverview = () => {
  return useApiCall(() => dashboardAPI.getOverview());
};

export const useDashboardQuickStats = () => {
  return useApiCall(() => dashboardAPI.getQuickStats());
};

export const useDashboardRecentActivity = () => {
  return useApiCall(() => dashboardAPI.getRecentActivity());
};

// Auth Hooks
export const useCurrentUser = () => {
  return useApiCall(() => authAPI.getCurrentUser());
};

export const useAvailableRoles = () => {
  return useApiCall(() => authAPI.getAvailableRoles());
};

export const usePermissionCheck = (permission: string) => {
  return useApiCall(
    () => authAPI.checkPermission(permission),
    [permission],
    !!permission
  );
};

// Client Hooks
export const useClients = (filters?: Record<string, any>) => {
  return useApiCall(
    () => clientAPI.listClients(filters),
    [JSON.stringify(filters)]
  );
};

export const useClient = (id: number) => {
  return useApiCall(
    () => clientAPI.getClient(id),
    [id],
    !!id
  );
};

export const useClientStats = () => {
  return useApiCall(() => clientAPI.getStats());
};

export const useClientDocuments = (clientId: number) => {
  return useApiCall(
    () => clientAPI.listDocuments(clientId),
    [clientId],
    !!clientId
  );
};

// Content Hooks
export const useContent = (filters?: Record<string, any>) => {
  return useApiCall(
    () => contentAPI.listContent(filters),
    [JSON.stringify(filters)]
  );
};

export const useContentItem = (id: number) => {
  return useApiCall(
    () => contentAPI.getContent(id),
    [id],
    !!id
  );
};

export const useContentStats = () => {
  return useApiCall(() => contentAPI.getStats());
};

// Meeting Hooks
export const useMeetings = (filters?: Record<string, any>) => {
  return useApiCall(
    () => meetingAPI.listMeetings(filters),
    [JSON.stringify(filters)]
  );
};

export const useMeeting = (id: number) => {
  return useApiCall(
    () => meetingAPI.getMeeting(id),
    [id],
    !!id
  );
};

export const useUpcomingMeetings = () => {
  return useApiCall(() => meetingAPI.getUpcomingMeetings());
};

export const useMyMeetings = () => {
  return useApiCall(() => meetingAPI.getMyMeetings());
};

export const useMeetingStats = () => {
  return useApiCall(() => meetingAPI.getStats());
};

// Ticket Hooks
export const useTickets = (filters?: Record<string, any>) => {
  return useApiCall(
    () => ticketAPI.listTickets(filters),
    [JSON.stringify(filters)]
  );
};

export const useTicket = (id: number) => {
  return useApiCall(
    () => ticketAPI.getTicket(id),
    [id],
    !!id
  );
};

export const useMyTickets = () => {
  return useApiCall(() => ticketAPI.getMyTickets());
};

export const useTicketStats = () => {
  return useApiCall(() => ticketAPI.getStats());
};

export const useTicketMessages = (ticketId: number) => {
  return useApiCall(
    () => ticketAPI.listMessages(ticketId),
    [ticketId],
    !!ticketId
  );
};

// Notification Hooks
export const useNotifications = (filters?: Record<string, any>) => {
  return useApiCall(
    () => notificationAPI.listNotifications(filters),
    [JSON.stringify(filters)]
  );
};

export const useNotification = (id: number) => {
  return useApiCall(
    () => notificationAPI.getNotification(id),
    [id],
    !!id
  );
};

export const useNotificationStats = () => {
  return useApiCall(() => notificationAPI.getStats());
};

// Billing Hooks
export const useBillingHistory = (filters?: Record<string, any>) => {
  return useApiCall(
    () => billingAPI.getHistory(filters),
    [JSON.stringify(filters)]
  );
};

export const useBillingStats = () => {
  return useApiCall(() => billingAPI.getStats());
};

export const usePricingPlans = () => {
  return useApiCall(() => billingAPI.getPricingPlans());
};

export const useAllPaymentStats = () => {
  return useApiCall(() => billingAPI.getAllPaymentStats());
};

// Analytics Hooks
export const useAnalyticsOverview = () => {
  return useApiCall(() => analyticsAPI.getOverview());
};

export const useClientAnalytics = () => {
  return useApiCall(() => analyticsAPI.getClientAnalytics());
};

export const useContentAnalytics = () => {
  return useApiCall(() => analyticsAPI.getContentAnalytics());
};

// Search Hooks
export const useGlobalSearch = (query: string, type?: string, limit?: number) => {
  return useApiCall(
    () => searchAPI.globalSearch(query, type as any, limit),
    [query, type, limit],
    !!query
  );
};

export const useQuickSearch = (query: string) => {
  return useApiCall(
    () => searchAPI.quickSearch(query),
    [query],
    !!query
  );
};

// CMS Hooks
export const useUserRole = () => {
  return useApiCall(() => cmsAPI.getUserRole());
};

export const useCMSContent = (contentType: string) => {
  return useApiCall(
    () => cmsAPI.getContent(contentType),
    [contentType],
    !!contentType
  );
};

// Settings Hooks
export const useAuditLogs = (filters?: Record<string, any>) => {
  return useApiCall(
    () => settingsAPI.getAuditLogs(filters),
    [JSON.stringify(filters)]
  );
};

export const useRoles = () => {
  return useApiCall(() => settingsAPI.listRoles());
};

export const useRole = (id: number) => {
  return useApiCall(
    () => settingsAPI.getRole(id),
    [id],
    !!id
  );
};

export const useUsers = () => {
  return useApiCall(() => settingsAPI.listUsers());
};

export const useUser = (id: number) => {
  return useApiCall(
    () => settingsAPI.getUser(id),
    [id],
    !!id
  );
};

export const useSystemSettings = () => {
  return useApiCall(() => settingsAPI.getSystemSettings());
};

// AI Oversight Hooks
export const useAIConversations = (filters?: Record<string, any>) => {
  return useApiCall(
    () => aiOversightAPI.listConversations(filters),
    [JSON.stringify(filters)]
  );
};

export const useAIConversation = (id: number) => {
  return useApiCall(
    () => aiOversightAPI.getConversation(id),
    [id],
    !!id
  );
};

export const useAIOversightStats = () => {
  return useApiCall(() => aiOversightAPI.getStats());
};

// Compliance Hooks
export const useComplianceReport = () => {
  return useApiCall(() => settingsAPI.getAuditLogs());
};

// Mutation hooks for create/update operations
interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (data: any) => Promise<T>;
  reset: () => void;
}

function useMutation<T>(
  mutationFunction: (data: any) => Promise<T>
): MutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (mutationData: any): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useMutation] Executing mutation...', mutationData);
      
      const result = await mutationFunction(mutationData);
      setData(result);
      console.log('✅ [useMutation] Mutation successful:', result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Mutation failed';
      setError(errorMessage);
      console.error('❌ [useMutation] Mutation failed:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

// Mutation hooks
export const useCreateClient = () => {
  return useMutation((data: any) => clientAPI.createClient(data));
};

export const useUpdateClient = () => {
  return useMutation(({ id, data }: { id: number; data: any }) => 
    clientAPI.updateClient(id, data)
  );
};

export const useCreateContent = () => {
  return useMutation((data: any) => contentAPI.createContent(data));
};

export const useUpdateContent = () => {
  return useMutation(({ id, data }: { id: number; data: any }) => 
    contentAPI.updateContent(id, data)
  );
};

export const useCreateMeeting = () => {
  return useMutation((data: any) => meetingAPI.createMeeting(data));
};

export const useUpdateMeeting = () => {
  return useMutation(({ id, data }: { id: number; data: any }) => 
    meetingAPI.updateMeeting(id, data)
  );
};

export const useCreateTicket = () => {
  return useMutation((data: any) => ticketAPI.createTicket(data));
};

export const useUpdateTicket = () => {
  return useMutation(({ id, data }: { id: number; data: any }) => 
    ticketAPI.updateTicket(id, data)
  );
};

export const useAddTicketMessage = () => {
  return useMutation(({ ticketId, message, isInternal }: { 
    ticketId: number; 
    message: string; 
    isInternal?: boolean 
  }) => ticketAPI.addMessage(ticketId, message, isInternal));
};

export const useCreateNotification = () => {
  return useMutation((data: any) => notificationAPI.createNotification(data));
};

export const useUploadDocument = () => {
  return useMutation(({ clientId, formData }: { clientId: number; formData: FormData }) => 
    clientAPI.uploadDocument(clientId, formData)
  );
};

export const useUploadImage = () => {
  return useMutation((formData: FormData) => cmsAPI.uploadImage(formData));
};

// Export all hooks as a single object for easy importing
export const apiHooks = {
  // Dashboard
  useDashboardOverview,
  useDashboardQuickStats,
  useDashboardRecentActivity,
  
  // Auth
  useCurrentUser,
  useAvailableRoles,
  usePermissionCheck,
  
  // Clients
  useClients,
  useClient,
  useClientStats,
  useClientDocuments,
  
  // Content
  useContent,
  useContentItem,
  useContentStats,
  
  // Meetings
  useMeetings,
  useMeeting,
  useUpcomingMeetings,
  useMyMeetings,
  useMeetingStats,
  
  // Tickets
  useTickets,
  useTicket,
  useMyTickets,
  useTicketStats,
  useTicketMessages,
  
  // Notifications
  useNotifications,
  useNotification,
  useNotificationStats,
  
  // Billing
  useBillingHistory,
  useBillingStats,
  usePricingPlans,
  useAllPaymentStats,
  
  // Analytics
  useAnalyticsOverview,
  useClientAnalytics,
  useContentAnalytics,
  
  // Search
  useGlobalSearch,
  useQuickSearch,
  
  // CMS
  useUserRole,
  useCMSContent,
  
  // Settings
  useAuditLogs,
  useRoles,
  useRole,
  useUsers,
  useUser,
  useSystemSettings,
  
  // AI Oversight
  useAIConversations,
  useAIConversation,
  useAIOversightStats,
  
  // Compliance
  useComplianceReport,
  
  // Mutations
  useCreateClient,
  useUpdateClient,
  useCreateContent,
  useUpdateContent,
  useCreateMeeting,
  useUpdateMeeting,
  useCreateTicket,
  useUpdateTicket,
  useAddTicketMessage,
  useCreateNotification,
  useUploadDocument,
  useUploadImage,
};

export default apiHooks;