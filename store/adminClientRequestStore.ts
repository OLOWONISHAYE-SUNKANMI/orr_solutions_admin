import { create } from 'zustand';

export type ClientRequestStatus = 
  | 'draft'
  | 'submitted'
  | 'clarification_requested'
  | 'approved_for_meeting'
  | 'approved_for_pm_assignment'
  | 'converted_to_project'
  | 'rejected'
  | 'closed'
  | 'archived';

export interface AdminClientRequestBrief {
  id: number;
  request_id: string;
  request_title: string;
  main_request_type: string;
  orr_service_area: string;
  urgency: string;
  status: ClientRequestStatus;
  sensitivity_level: string;
  submission_date: string | null;
  created_at: string;
  updated_at: string;
  client: number;
  client_name: string;
  submitted_by_name: string;
  document_count: number;
}

export interface AdminClientRequestDetail extends AdminClientRequestBrief {
  short_description: string;
  desired_outcome: string;
  background_context: string;
  main_question: string;
  current_challenge: string;
  actions_taken: string;
  decision_needed: string;
  expected_support: string;
  expected_deliverable: string;
  target_date: string;
  budget_expectation: string;
  sector: string;
  jurisdiction: string;
  location: string;
  has_documents: boolean;
  confidentiality_agreed: boolean;
  confirm_accuracy: boolean;
  authority_to_submit: boolean;
  no_emergency_reliance: boolean;
  ai_processing_notice: boolean;
  admin_classification: string;
  admin_review_notes: string;
  assigned_pm: number | null;
  assigned_pm_name: string | null;
  converted_project: number | null;
}

interface AdminClientRequestState {
  requests: AdminClientRequestBrief[];
  currentRequest: AdminClientRequestDetail | null;
  pms: { id: number; name: string; email: string }[];
  isLoading: boolean;
  error: string | null;
  
  fetchRequests: (status?: string) => Promise<void>;
  fetchRequestDetail: (id: number) => Promise<void>;
  fetchProjectManagers: () => Promise<void>;
  reviewRequest: (id: number, action: string, notes?: string, classification?: string, pmId?: number) => Promise<boolean>;
  convertToProject: (id: number, projectTitle: string, serviceCategory: string) => Promise<{ projectId: string } | null>;
  createInternalRequest: (payload: any) => Promise<boolean>;
}

export const useAdminClientRequestStore = create<AdminClientRequestState>((set, get) => ({
  requests: [],
  currentRequest: null,
  pms: [],
  isLoading: false,
  error: null,
  
  fetchRequests: async (statusFilter?: string) => {
    set({ isLoading: true, error: null });
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      let url = `${baseUrl}/api/admin/requests/`;
      if (statusFilter && statusFilter !== 'ALL') {
        url += `?status=${encodeURIComponent(statusFilter)}`;
      }
      const response = await auth.makeAuthenticatedRequest(url);
      const result = await response.json();
      
      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Failed to fetch: ${response.statusText}`);
      }

      let requestList = [];
      if (Array.isArray(result)) {
        requestList = result;
      } else if (result.data) {
        if (Array.isArray(result.data)) {
          requestList = result.data;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          requestList = result.data.data;
        }
      }
      
      set({ requests: requestList, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch client requests', error);
      set({ error: error.message || 'Failed to load requests', isLoading: false });
    }
  },
  
  fetchRequestDetail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/api/admin/requests/${id}/`);
      const result = await response.json();
      
      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Failed to fetch: ${response.statusText}`);
      }

      let reqDetail = result;
      if (result.data && !Array.isArray(result.data)) {
        reqDetail = result.data.data || result.data;
      }
      
      set({ currentRequest: reqDetail as AdminClientRequestDetail, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch request detail', error);
      set({ error: error.message || 'Failed to load request details', isLoading: false });
    }
  },

  fetchProjectManagers: async () => {
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/api/admin/pms/`);
      const result = await response.json();
      
      console.log('fetchProjectManagers result:', result);
      
      if (response.ok && result) {
        let pmList = [];
        if (Array.isArray(result)) {
          pmList = result;
        } else if (result.data) {
          if (Array.isArray(result.data)) {
            pmList = result.data;
          } else if (result.data.data && Array.isArray(result.data.data)) {
            pmList = result.data.data;
          } else {
            console.warn('fetchProjectManagers: Unrecognized data format inside result.data', result.data);
          }
        } else {
          console.warn('fetchProjectManagers: Unrecognized result format', result);
        }
        console.log('fetchProjectManagers setting pms to:', pmList);
        set({ pms: pmList });
      } else {
        console.error('fetchProjectManagers failed:', response.status, result);
      }
    } catch (error) {
      console.error('Failed to fetch project managers', error);
    }
  },

  reviewRequest: async (id: number, action: string, notes?: string, classification?: string, pmId?: number) => {
    set({ isLoading: true, error: null });
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const payload: any = { action };
      if (notes) payload.admin_review_notes = notes;
      if (classification) payload.admin_classification = classification;
      if (pmId && action === 'approve_for_pm_assignment') payload.assigned_pm_id = pmId;

      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/api/admin/requests/${id}/review/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to review request');
      }
      
      const result = await response.json();
      let updatedData = result;
      if (result.data) updatedData = result.data;

      set((state) => ({ 
        currentRequest: state.currentRequest && state.currentRequest.id === id 
          ? { ...state.currentRequest, ...updatedData } 
          : state.currentRequest,
        isLoading: false 
      }));
      
      // Update in list as well
      get().fetchRequests();
      return true;
    } catch (error: any) {
      console.error('Failed to review request', error);
      set({ error: error.message || 'Failed to review request', isLoading: false });
      return false;
    }
  },

  convertToProject: async (id: number, projectTitle: string, serviceCategory: string) => {
    set({ isLoading: true, error: null });
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const payload = { 
        project_title: projectTitle,
        service_category: serviceCategory
      };

      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/api/admin/requests/${id}/convert-to-project/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to convert to project');
      }
      
      const result = await response.json();
      const projectData = result.data || result;
      
      set((state) => ({ 
        currentRequest: state.currentRequest && state.currentRequest.id === id 
          ? { ...state.currentRequest, status: 'converted_to_project' } 
          : state.currentRequest,
        isLoading: false 
      }));
      
      get().fetchRequests();
      return { projectId: projectData.project_id || 'UNKNOWN' };
    } catch (error: any) {
      console.error('Failed to convert to project', error);
      set({ error: error.message || 'Failed to convert to project', isLoading: false });
      return null;
    }
  },

  createInternalRequest: async (payload: any) => {
    set({ isLoading: true, error: null });
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/api/admin/requests/create/`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create internal request');
      }
      
      get().fetchRequests();
      return true;
    } catch (error: any) {
      console.error('Failed to create internal request', error);
      set({ error: error.message || 'Failed to create internal request', isLoading: false });
      return false;
    }
  }
}));
