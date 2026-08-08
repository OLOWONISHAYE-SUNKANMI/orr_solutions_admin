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
  consultantFacingSummaryDraft?: string;
  confidentiality: string;
  consultantsNeeded: number;
  clarificationNotes?: string;
  pmInputRequestNotes?: string;
  interestedConsultants?: InterestedConsultant[];
  selectedConsultantId?: string;
  // Assignment tracking
  assignmentId?: number;
  assignmentStatus?: string; // draft | invitation_sent | accepted | access_activated
  accessLevel?: 'Assignment Brief Only' | 'Selected Documents Only' | 'Full Project Workspace' | 'Restricted Custom Access';
  isAccessActivated?: boolean;
  // Backend sourcing status
  sourcing_status?: string;
  createdBy?: string;
  sentTo?: string[];
  summaryVersionSent?: string;
}

interface AdminProjectState {
  projects: AdminProjectBrief[];
  isLoading: boolean;
  isGeneratingSummary: boolean;
  fetchProjects: () => Promise<void>;
  fetchProjectAssignments: (id: string) => Promise<void>;
  approveProjectForDrafting: (id: string) => void;
  requestClarification: (id: string, notes: string) => Promise<void>;
  generateConsultantSummary: (id: string) => Promise<void>;
  approveConsultantSummary: (id: string, editedSummary: string) => Promise<void>;
  requestPmInputForSourcing: (id: string, notes: string) => void;
  sourceProjectInternally: (id: string) => void;
  sourceProjectExternally: (id: string, email: string) => void;
  selectConsultant: (id: string, consultantId: string) => void;
  updateShortlistStatus: (projectId: string, consultantId: string, status: ShortlistStatus) => void;
  updateSelectionNotes: (projectId: string, consultantId: string, notes: string) => void;
  sendConsultantInvitation: (id: string, invitationMessage?: string) => Promise<void>;
  activateProjectAccess: (id: string, accessLevel: 'Assignment Brief Only' | 'Selected Documents Only' | 'Full Project Workspace' | 'Restricted Custom Access') => Promise<void>;
  completeProject: (id: string) => Promise<void>;
}

// Mock initial data bridging from the PM dashboard concepts
const MOCK_PROJECTS: AdminProjectBrief[] = [
  {
    id: 'ORR-PROJ-000001',
    dbId: 1,
    pmId: 'PM-Jane-Doe',
    clientName: 'Acme Corp',
    projectTitle: 'Q3 Market Expansion Strategy',
    primaryCategory: 'Strategy',
    targetDeadline: '2026-08-15',
    urgency: 'High',
    status: 'Pending Admin Review',
    createdAt: new Date().toISOString(),
    scope: 'Analyze European market entry feasibility and regulatory requirements for Acme Corp.',
    confidentiality: 'Highly Confidential',
    consultantsNeeded: 2,
    createdBy: 'System',
    sentTo: [],
    summaryVersionSent: 'none'
  },
  {
    id: 'ORR-PROJ-000002',
    dbId: 2,
    pmId: 'PM-John-Smith',
    clientName: 'TechFlow',
    projectTitle: 'IT Infrastructure Audit',
    primaryCategory: 'IT & Tech',
    targetDeadline: '2026-07-30',
    urgency: 'Normal',
    status: 'Pending Admin Review',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    scope: 'Comprehensive security audit of cloud infrastructure and internal networks.',
    confidentiality: 'Standard',
    consultantsNeeded: 1,
    createdBy: 'System',
    sentTo: [],
    summaryVersionSent: 'none'
  }
];

export const useAdminProjectStore = create<AdminProjectState>((set, get) => ({
  projects: [],
  isLoading: true,
  isGeneratingSummary: false,

  fetchProjects: async () => {
    set({ isLoading: true });
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
      
      console.log("[Admin Projects] Raw Result:", result);
      console.log("[Admin Projects] Extracted List:", projectList);
      
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
        'awaiting_client_confirmation': 'Pending Admin Review',
        'awaiting_payment': 'Pending Admin Review',
        'ready_for_matching': 'Approved for Sourcing',
        'internal_review': 'Active',
        'delivered': 'Active',
        'completed': 'Completed',
        'closed': 'Completed',
        'on_hold': 'Needs PM Clarification',
        'cancelled': 'Completed',
      };

      const mappedProjects: AdminProjectBrief[] = projectList.map((p: any) => {
        let mappedStatus = statusMap[p.status] || p.status || 'Pending Admin Review';
        // If backend indicates summary approved, override status
        if (p.sourcing_status === 'summary_approved') {
          mappedStatus = 'Approved for Sourcing';
        }
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
          internalSummary: p.pm_approved_summary || p.ai_generated_summary || p.proposed_scope || '',
          consultantSummary: p.consultant_facing_summary || '',
          consultantFacingSummaryDraft: p.consultant_facing_summary || '',
          confidentiality: p.confidentiality_level || 'Standard',
          consultantsNeeded: p.num_consultants_required || 1,
          // Preserve backend sourcing status if present
          sourcing_status: p.sourcing_status || undefined,
        };
      });
      set({ projects: mappedProjects });
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      set({ isLoading: false });
    }
  },

  approveProjectForDrafting: (id) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? { ...p, status: 'Drafting Consultant Summary' } : p
    )
  })),

  fetchProjectAssignments: async (id) => {
    const project = get().projects.find(p => p.id === id);
    if (!project) return;
    try {
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      const response = await auth.makeAuthenticatedRequest(
        `${baseUrl}/pm/v1/projects/${project.dbId}/assignments/`
      );
      if (!response.ok) return;

      const result = await response.json();
      const assignments: any[] = Array.isArray(result.data) ? result.data
        : Array.isArray(result) ? result : [];

      if (assignments.length === 0) return;

      // Map assignments → InterestedConsultant shape
      const consultants = assignments.map((a: any) => ({
        id: String(a.consultant ?? a.consultant_id ?? a.id),
        name: a.consultant_name || a.consultant_email || `Consultant #${a.consultant ?? a.id}`,
        expertise: a.assignment_role || a.specialization || 'Consulting',
        cost: a.assignment_budget ? `$${a.assignment_budget}` : 'TBD',
        responseStatus: a.status === 'access_activated' ? 'Access Activated'
          : a.status === 'accepted' ? 'Assignment Accepted'
          : a.status === 'invitation_sent' ? 'Invited'
          : 'Selected' as any,
        lastUpdated: a.updated_at || a.created_at,
      }));

      // Primary assignment drives the project-level state
      const primary = assignments[0];
      const selectedId = String(primary.consultant ?? primary.consultant_id ?? primary.id);
      const assignmentId: number = primary.id;
      const assignmentStatus: string = primary.status ?? 'draft';
      const isAccessActivated = assignmentStatus === 'access_activated';

      const accessLevelMap: Record<string, string> = {
        assignment_brief_only: 'Assignment Brief Only',
        selected_documents_only: 'Selected Documents Only',
        full_project_workspace: 'Full Project Workspace',
        restricted_custom_access: 'Restricted Custom Access',
      };
      const accessLevel = accessLevelMap[primary.project_access_level] as any ?? undefined;

      // Derive admin-facing status from assignment status
      const derivedStatus = isAccessActivated ? 'Active'
        : assignmentStatus === 'accepted' ? 'Consultant Assignment Pending'
        : assignmentStatus === 'invitation_sent' ? 'Consultant Assignment Pending'
        : 'Consultant Assignment Pending';

      set(state => ({
        projects: state.projects.map(p =>
          p.id === id
            ? {
                ...p,
                interestedConsultants: consultants,
                selectedConsultantId: selectedId,
                assignmentId,
                assignmentStatus,
                isAccessActivated,
                ...(accessLevel ? { accessLevel } : {}),
                status: derivedStatus,
              }
            : p
        ),
      }));
    } catch (err) {
      console.error('[fetchProjectAssignments] Error:', err);
    }
  },


  sendConsultantInvitation: async (id, invitationMessage = '') => {
    const project = get().projects.find(p => p.id === id);
    if (!project || !project.selectedConsultantId) {
      console.error('[sendConsultantInvitation] No project or no selected consultant.');
      return;
    }

    const auth = (await import('@/lib/auth')).AuthService.getInstance();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

    try {
      // Step 1: Create assignment if not yet created
      let assignmentId = project.assignmentId ?? null;

      if (!assignmentId) {
        const assignRes = await auth.makeAuthenticatedRequest(
          `${baseUrl}/pm/v1/projects/${project.dbId}/assign/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              consultant: Number(project.selectedConsultantId),
              project_access_level: 'assignment_brief_only',
              assignment_scope: project.scope || project.internalSummary || 'Consultant assignment for this project.',
              invitation_message: invitationMessage,
            }),
          }
        );

        if (assignRes.ok) {
          const assignData = await assignRes.json();
          assignmentId = assignData?.data?.id ?? assignData?.id ?? null;
        } else {
          // Try fetching existing
          const existingRes = await auth.makeAuthenticatedRequest(
            `${baseUrl}/pm/v1/projects/${project.dbId}/assignments/`
          );
          if (existingRes.ok) {
            const ex = await existingRes.json();
            const list: any[] = Array.isArray(ex.data) ? ex.data : Array.isArray(ex) ? ex : [];
            const found = list.find((a: any) => String(a.consultant) === String(project.selectedConsultantId));
            assignmentId = found?.id ?? null;
          }
        }
      }

      if (!assignmentId) {
        console.error('[sendConsultantInvitation] Could not create or find assignment.');
        return;
      }

      // Step 2: Send invitation
      const inviteRes = await auth.makeAuthenticatedRequest(
        `${baseUrl}/pm/v1/assignments/${assignmentId}/send-invitation/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: invitationMessage }),
        }
      );

      if (!inviteRes.ok) {
        const errData = await inviteRes.json().catch(() => ({}));
        console.error('[sendConsultantInvitation] Failed:', errData);
        return;
      }

      // Step 3: Update local state
      set(state => ({
        projects: state.projects.map(p =>
          p.id === id
            ? {
                ...p,
                assignmentId,
                assignmentStatus: 'invitation_sent',
                interestedConsultants: p.interestedConsultants?.map(c =>
                  c.id === p.selectedConsultantId
                    ? { ...c, responseStatus: 'Invited', lastUpdated: new Date().toISOString() }
                    : c
                ),
              }
            : p
        ),
      }));

      console.log('[sendConsultantInvitation] Invitation sent, assignmentId:', assignmentId);
    } catch (err) {
      console.error('[sendConsultantInvitation] Error:', err);
    }
  },


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
      if (!project) return;
      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/generate-summary/`, {
        method: 'POST',
        body: JSON.stringify({ type: 'consultant_facing' })
      });
      
      let summary = '';
      if (response.ok) {
        const result = await response.json();
        summary = result.data?.summary || '';
      }
      
      if (!summary) {
        // Fallback to local mockup draft
        summary = `## Consultant Opportunity
**Sector:** ${project.primaryCategory}
**Timeline:** Complete by ${project.targetDeadline}

**Overview:**
We are seeking an experienced consultant to ${project.scope.replace(/Acme Corp|TechFlow/gi, 'a leading enterprise client in the sector')}.

**Requirements:**
This project requires ${project.consultantsNeeded} consultant(s). The work is highly specialized and requires adherence to strict confidentiality protocols.

*Note: Specific client names and sensitive operational details will be disclosed upon project assignment.*`;
      }

      set((state) => ({
        isGeneratingSummary: false,
        projects: state.projects.map(p => {
          if (p.id === id) {
            return { 
              ...p, 
              consultantSummary: summary,
              consultantFacingSummaryDraft: summary
            };
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
      if (!project) throw new Error('Project not found in local state');

      const auth = (await import('@/lib/auth')).AuthService.getInstance();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

      // Step 1: Save the edited summary text to the project
      const patchResponse = await auth.makeAuthenticatedRequest(
        `${baseUrl}/pm/v1/projects/${project.dbId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify({ consultant_facing_summary: editedSummary }),
        }
      );
      if (!patchResponse.ok) {
        const errData = await patchResponse.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save consultant summary');
      }

      // Step 2: Call the review endpoint with action 'approve_summary'
      const reviewResponse = await auth.makeAuthenticatedRequest(
        `${baseUrl}/pm/v1/projects/${project.dbId}/review/`,
        {
          method: 'POST',
          body: JSON.stringify({ action: 'approve_summary' }),
        }
      );
      if (!reviewResponse.ok) {
        const errData = await reviewResponse.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to approve consultant summary');
      }

      // Step 3: Optimistically update local state, then sync from backend
      set((state) => ({
        projects: state.projects.map(p =>
          p.id === id
            ? {
                ...p,
                consultantFacingSummaryDraft: editedSummary,
                consultantSummary: editedSummary,
                status: 'Approved for Sourcing',
                // Ensure sourcing_status reflects the backend approval
                sourcing_status: 'summary_approved',
              }
            : p
        ),
      }));

      // Refresh from backend to get authoritative state
      await get().fetchProjects();
    } catch (error) {
      console.error('[approveConsultantSummary] Failed:', error);
      throw error;
    }
  },

  requestPmInputForSourcing: (id, notes) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? {
        ...p,
        status: 'PM Input Required',
        pmInputRequestNotes: notes
      } : p
    )
  })),

  sourceProjectInternally: (id) => {
    // Set status and clear previous consultants while matching runs
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? {
          ...p,
          status: 'Sourcing Internally',
          interestedConsultants: undefined,
          sentTo: [],
          summaryVersionSent: 'v1.0 (Auto-match)'
        } : p
      )
    }));

    // Run matching algorithm on backend and fetch results
    (async () => {
      try {
        const project = get().projects.find(p => p.id === id);
        if (!project) return;
        const auth = (await import('@/lib/auth')).AuthService.getInstance();
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
        // Trigger matching (POST)
        await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/match-consultants/`, {
          method: 'POST',
        });
        // Retrieve matches (GET)
        const response = await auth.makeAuthenticatedRequest(`${baseUrl}/pm/v1/projects/${project.dbId}/matches/`);
        if (!response.ok) {
          console.error('Failed to fetch matches for internal sourcing');
          return;
        }
        const result = await response.json();
        const matches = result.data || result;
        const consultants = (Array.isArray(matches) ? matches : []).map((m: any) => ({
          id: m.consultant?.toString() || m.id?.toString() || '',
          name: m.consultant_name || m.name || 'Unnamed',
          expertise: m.specialization || m.expertise || 'General',
          cost: m.rate ? `$${m.rate}/hr` : '$0/hr',
        }));
        // Update state with real consultants
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === id ? {
              ...p,
              interestedConsultants: consultants,
              sentTo: consultants.map(c => c.id),
            } : p
          )
        }));
      } catch (error) {
        console.error('Error during internal sourcing', error);
      }
    })();
  },

  sourceProjectExternally: (id, email) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? {
        ...p,
        status: 'Sourcing Externally',
        sentTo: [...(p.sentTo || []), email],
        summaryVersionSent: 'v1.0 (External)',
        interestedConsultants: [
          ...(p.interestedConsultants || []),
          { id: 'EXT-' + Math.random().toString(36).substr(2, 5), name: email, expertise: 'External Consultant', cost: 'TBD' }
        ]
      } : p
    )
  })),

  selectConsultant: (id, consultantId) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? {
        ...p,
        status: 'Consultant Assignment Pending',
        selectedConsultantId: consultantId,
        interestedConsultants: p.interestedConsultants?.map(c =>
          c.id === consultantId ? {
            ...c,
            responseStatus: 'Selected',
            lastUpdated: new Date().toISOString()
          } : c
        )
      } : p
    )
  })),

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

  activateProjectAccess: async (id, accessLevel) => {
    const project = get().projects.find(p => p.id === id);
    if (!project) return;

    // Must have an assignment already (created during send-invitation)
    const assignmentId = project.assignmentId;
    if (!assignmentId) {
      console.error('[activateProjectAccess] No assignment ID found. Send invitation first.');
      return;
    }

    const auth = (await import('@/lib/auth')).AuthService.getInstance();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
    const accessLevelMap: Record<string, string> = {
      'Assignment Brief Only': 'assignment_brief_only',
      'Selected Documents Only': 'selected_documents_only',
      'Full Project Workspace': 'full_project_workspace',
      'Restricted Custom Access': 'restricted_custom_access',
    };

    try {
      const activateResponse = await auth.makeAuthenticatedRequest(
        `${baseUrl}/pm/v1/assignments/${assignmentId}/activate-access/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_level: accessLevelMap[accessLevel] ?? 'full_project_workspace' }),
        }
      );

      if (!activateResponse.ok) {
        const errData = await activateResponse.json().catch(() => ({}));
        console.error('[activateProjectAccess] Failed:', errData);
        return;
      }

      set(state => ({
        projects: state.projects.map(p =>
          p.id === id
            ? {
                ...p,
                accessLevel,
                assignmentStatus: 'access_activated',
                isAccessActivated: true,
                status: 'Active',
                interestedConsultants: p.interestedConsultants?.map(c =>
                  c.id === p.selectedConsultantId
                    ? { ...c, responseStatus: 'Access Activated', lastUpdated: new Date().toISOString() }
                    : c
                ),
              }
            : p
        ),
      }));

      console.log('[activateProjectAccess] Done for assignment', assignmentId);
    } catch (error) {
      console.error('[activateProjectAccess] Error:', error);
      throw error;
    }
  },

  completeProject: async (id: string) => {
    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, status: 'Completed' } : p
      )
    }));
  },
}));
