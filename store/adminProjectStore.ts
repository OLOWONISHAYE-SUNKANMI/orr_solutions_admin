import { create } from 'zustand';

export type AdminProjectStatus = 
  | 'Pending Admin Review'
  | 'Needs PM Clarification'
  | 'Drafting Consultant Summary'
  | 'PM Input Required'
  | 'Approved for Sourcing'
  | 'Sourcing Internally'
  | 'Sourcing Externally'
  | 'Consultant Assignment Pending'
  | 'Active'
  | 'Completed';

export type ShortlistStatus = 'Pending' | 'Shortlisted' | 'Not Shortlisted' | 'Reserve' | 'Needs Follow-up';
export type OpportunityResponseStatus = 'Invited' | 'Viewed' | 'Interested' | 'Clarification Requested' | 'Declined' | 'Shortlisted' | 'Not Shortlisted' | 'Selected' | 'Assignment Offered' | 'Assignment Accepted' | 'Assignment Declined' | 'Conflict Review Required' | 'Access Activated';

export interface InterestedConsultant {
  id: string;
  name: string;
  expertise: string;
  cost: string;
  shortlistStatus?: ShortlistStatus;
  selectionNotes?: string;
  responseStatus?: OpportunityResponseStatus;
  responseTimestamp?: string;
  lastUpdated?: string;
}

export interface AdminProjectBrief {
  id: string;
  dbId: number;
  pmId: string;
  clientName: string;
  projectTitle: string;
  primaryCategory: string;
  targetDeadline: string;
  urgency: string;
  status: AdminProjectStatus;
  createdAt: string;
  scope: string;
  internalSummary?: string;
  consultantSummary?: string;
  confidentiality: string;
  consultantsNeeded: number;
  clarificationNotes?: string;
  consultantFacingSummaryDraft?: string;
  pmInputRequestNotes?: string;
  interestedConsultants?: InterestedConsultant[];
  selectedConsultantId?: string;
  accessLevel?: 'Assignment Brief Only' | 'Selected Documents Only' | 'Full Project Workspace' | 'Restricted Custom Access';
  isAccessActivated?: boolean;
}

interface AdminProjectState {
  projects: AdminProjectBrief[];
  isGeneratingSummary: boolean;
  fetchProjects: () => Promise<void>;
  approveProjectForDrafting: (id: string) => void;
  requestClarification: (id: string, notes: string) => Promise<void>;
  generateConsultantSummary: (id: string) => Promise<void>;
  approveConsultantSummary: (id: string, editedSummary?: string) => Promise<void>;
  requestPmInputForSourcing: (id: string, notes: string) => Promise<void>;
  sourceProjectInternally: (id: string) => Promise<void>;
  sourceProjectExternally: (id: string, email: string) => Promise<void>;
  selectConsultant: (id: string, consultantId: string) => Promise<void>;
  completeProject: (id: string) => Promise<void>;
  updateShortlistStatus: (projectId: string, consultantId: string, status: ShortlistStatus) => void;
  updateSelectionNotes: (projectId: string, consultantId: string, notes: string) => void;
  activateProjectAccess: (id: string, accessLevel: 'Assignment Brief Only' | 'Selected Documents Only' | 'Full Project Workspace' | 'Restricted Custom Access') => void;
}

// Mock Data Removed

export const useAdminProjectStore = create<AdminProjectState>((set, get) => ({
  projects: [],
  isGeneratingSummary: false,
  
  fetchProjects: async () => {
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/`);
      const result = await response.json();
      
      // Handle potential API response wrapping
      let projectList = [];
      if (Array.isArray(result)) {
        projectList = result;
      } else if (result.data) {
        if (Array.isArray(result.data)) {
          projectList = result.data;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          projectList = result.data.data;
        }
      }
      
      const statusMap: Record<string, AdminProjectStatus> = {
        'pending_admin_review': 'Pending Admin Review',
        'needs_pm_clarification': 'Needs PM Clarification',
        'pm_input_required': 'PM Input Required',
        'approved_for_sourcing': 'Approved for Sourcing',
        'sourcing_internally': 'Sourcing Internally',
        'sourcing_externally': 'Sourcing Externally',
        'consultant_assignment_pending': 'Consultant Assignment Pending',
        'active': 'Active',
        'draft': 'Pending Admin Review',
        'completed': 'Completed',
      };

      const mappedProjects: AdminProjectBrief[] = projectList.map((p: any) => {
        let mappedStatus = statusMap[p.status] || p.status || 'Pending Admin Review';
        // Force exact mappings for newly added statuses just in case of case mismatches
        if (p.status === 'sourcing_internally') mappedStatus = 'Sourcing Internally';
        if (p.status === 'sourcing_externally') mappedStatus = 'Sourcing Externally';
        
        let pmString = 'Unassigned';
        if (p.assigned_pm) {
          if (typeof p.assigned_pm === 'object') {
            pmString = p.assigned_pm.full_name || p.assigned_pm.email || p.assigned_pm.id?.toString() || 'Unassigned';
          } else {
            pmString = p.assigned_pm.toString();
          }
        }

        return {
          id: p.project_id || p.id?.toString() || 'Unknown',
          dbId: p.id,
          pmId: pmString,
          clientName: p.client_name || 'Client',
          projectTitle: p.title || 'Untitled',
          primaryCategory: p.service_category || 'Other',
          targetDeadline: p.target_deadline || 'TBD',
          urgency: p.urgency || 'Normal',
          status: mappedStatus,
          createdAt: p.created_at || new Date().toISOString(),
          scope: p.proposed_scope || '',
          internalSummary: p.pm_approved_summary || '',
          consultantSummary: p.consultant_facing_summary || '',
          confidentiality: p.confidentiality_level || 'Standard',
          consultantsNeeded: p.num_consultants_required || 1,
        };
      });
      set({ projects: mappedProjects });
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  },
  
  approveProjectForDrafting: (id) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, status: 'Drafting Consultant Summary' } : p
    )
  })),

  requestClarification: async (id, notes) => {
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) return;
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/review/`, {
        method: 'POST',
        body: JSON.stringify({ action: 'clarify', notes })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request clarification');
      }
      get().fetchProjects(); // Reload from backend
    } catch (error) {
      console.error('Failed to request clarification', error);
      throw error;
    }
  },

  generateConsultantSummary: async (id) => {
    set({ isGeneratingSummary: true });
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) {
        set({ isGeneratingSummary: false });
        return;
      }
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/generate-summary/`, { 
        method: 'POST',
        body: JSON.stringify({ type: 'consultant_facing' })
      });
      const result = await response.json();
      
      let summary = '';
      if (result && result.data && result.data.summary) {
        summary = result.data.summary;
      } else if (result && result.summary) {
        summary = result.summary;
      } else {
        throw new Error("Invalid response format");
      }

      set((state) => ({
        isGeneratingSummary: false,
        projects: state.projects.map(p => {
          if (p.id === id) {
            return { ...p, consultantSummary: summary };
          }
          return p;
        })
      }));
    } catch (error) {
      console.error('Failed to generate summary', error);
      set({ isGeneratingSummary: false });
      throw error;
    }
  },

  approveConsultantSummary: async (id, editedSummary) => {
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) return;
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      
      // If admin edited the summary, save it first
      if (editedSummary && editedSummary !== project.consultantSummary) {
        const patchRes = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/`, {
          method: 'PATCH',
          body: JSON.stringify({ consultant_facing_summary: editedSummary })
        });
        if (!patchRes.ok) {
          const errorData = await patchRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to save summary edits');
        }
      }

      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/review/`, {
        method: 'POST',
        body: JSON.stringify({ action: 'approve' })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to approve summary');
      }
      get().fetchProjects(); // Reload from backend
    } catch (error) {
      console.error('Failed to approve summary', error);
      throw error;
    }
  },

  requestPmInputForSourcing: async (id, notes) => {
    get().requestClarification(id, notes);
  },

  sourceProjectInternally: async (id) => {
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) return;
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/match-consultants/`, {
        method: 'POST'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to source internally');
      }
      const data = await response.json();
      
      set((state) => ({
        projects: state.projects.map(p => {
          if (p.id === id) {
            return {
              ...p,
              status: 'Sourcing Internally',
              interestedConsultants: data.data?.matches?.map((match: any) => ({
                id: match.consultant?.id?.toString() || 'Unknown',
                name: match.consultant?.user?.full_name || match.consultant?.user?.email || 'Consultant',
                expertise: match.consultant?.specialization?.primary_specialization || 'Matched Consultant',
                cost: 'TBD'
              })) || []
            };
          }
          return p;
        })
      }));
    } catch (error) {
      console.error('Failed to source internally', error);
      throw error;
    }
  },

  sourceProjectExternally: async (id, email) => {
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) return;
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/source-externally/`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to source externally');
      }
      
      set((state) => ({
        projects: state.projects.map(p => {
          if (p.id === id) {
            return {
              ...p,
              status: 'Sourcing Externally',
              interestedConsultants: [
                { id: 'EXT-001', name: email, expertise: 'External Consultant', cost: 'TBD' }
              ]
            };
          }
          return p;
        })
      }));
    } catch (error) {
      console.error('Failed to source externally', error);
      throw error;
    }
  },

  selectConsultant: async (id, consultantId) => {
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) return;
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      
      // 1. Assign Consultant
      const assignRes = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/assign/`, {
        method: 'POST',
        body: JSON.stringify({ consultant_id: parseInt(consultantId) })
      });
      if (!assignRes.ok) {
        const errorData = await assignRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to assign consultant');
      }
      const assignData = await assignRes.json();
      const assignmentId = assignData.data.assignment_id || assignData.data.id;

      // 2. Send Invitation (Creates PMOpportunity)
      if (assignmentId) {
        const inviteRes = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/assignments/${assignmentId}/send-invitation/`, {
          method: 'POST',
          body: JSON.stringify({ custom_message: 'Please review this opportunity.' })
        });
        if (!inviteRes.ok) {
          const errorData = await inviteRes.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to send invitation');
        }
      }
      
      set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? { 
            ...p, 
            status: 'Consultant Assignment Pending',
            selectedConsultantId: consultantId
          } : p
        )
      }));
    } catch (error) {
      console.error('Failed to select consultant', error);
      throw error;
    }
  },

  completeProject: async (id) => {
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) return;
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to complete project');
      }
      get().fetchProjects(); // Reload from backend
    } catch (error) {
      console.error('Failed to complete project', error);
      throw error;
    }
  },

  updateShortlistStatus: (projectId, consultantId, status) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId ? {
        ...p,
        interestedConsultants: p.interestedConsultants?.map(c => 
          c.id === consultantId ? { 
            ...c, 
            shortlistStatus: status,
            responseStatus: status === 'Shortlisted' ? 'Shortlisted' : status === 'Not Shortlisted' ? 'Not Shortlisted' : c.responseStatus,
            lastUpdated: new Date().toISOString()
          } : c
        )
      } : p
    )
  })),

  updateSelectionNotes: (projectId, consultantId, notes) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId ? {
        ...p,
        interestedConsultants: p.interestedConsultants?.map(c => 
          c.id === consultantId ? { ...c, selectionNotes: notes } : c
        )
      } : p
    )
  })),

  activateProjectAccess: (id, accessLevel) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { 
        ...p, 
        accessLevel,
        isAccessActivated: true,
        status: 'Active',
        interestedConsultants: p.interestedConsultants?.map(c => 
          c.id === p.selectedConsultantId ? {
            ...c,
            responseStatus: 'Access Activated',
            lastUpdated: new Date().toISOString()
          } : c
        )
      } : p
    )
  })),
}));
