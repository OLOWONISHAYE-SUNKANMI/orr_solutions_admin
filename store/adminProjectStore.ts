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
  createdBy?: string;
  sentTo?: string[];
  summaryVersionSent?: string;
}

interface AdminProjectState {
  projects: AdminProjectBrief[];
  isGeneratingSummary: boolean;
  fetchProjects: () => Promise<void>;
  approveProjectForDrafting: (id: string) => void;
  requestClarification: (id: string, notes: string) => Promise<void>;
  generateConsultantSummary: (id: string) => Promise<void>;
  approveConsultantSummary: (id: string, editedSummary: string) => void;
  requestPmInputForSourcing: (id: string, notes: string) => void;
  sourceProjectInternally: (id: string) => void;
  sourceProjectExternally: (id: string, email: string) => void;
  selectConsultant: (id: string, consultantId: string) => void;
  updateShortlistStatus: (projectId: string, consultantId: string, status: ShortlistStatus) => void;
  updateSelectionNotes: (projectId: string, consultantId: string, notes: string) => void;
  activateProjectAccess: (id: string, accessLevel: 'Assignment Brief Only' | 'Selected Documents Only' | 'Full Project Workspace' | 'Restricted Custom Access') => void;
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
  isGeneratingSummary: false,

  fetchProjects: async () => {
    // Simulated fetch using MOCK_PROJECTS
    // TODO: Implement actual API fetch here
    set({ projects: MOCK_PROJECTS });
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
    // Simulate AI stripping out restricted client information
    await new Promise((resolve) => setTimeout(resolve, 2500));

    set((state) => ({
      isGeneratingSummary: false,
      projects: state.projects.map(p => {
        if (p.id === id) {
          const draft = `## Consultant Opportunity
**Sector:** ${p.primaryCategory}
**Timeline:** Complete by ${p.targetDeadline}

**Overview:**
We are seeking an experienced consultant to ${p.scope.replace(/Acme Corp|TechFlow/gi, 'a leading enterprise client in the sector')}.

**Requirements:**
This project requires ${p.consultantsNeeded} consultant(s). The work is highly specialized and requires adherence to strict confidentiality protocols.

*Note: Specific client names and sensitive operational details will be disclosed upon project assignment.*`;
          return { ...p, consultantFacingSummaryDraft: draft };
        }
        return p;
      })
    }));
  },

  approveConsultantSummary: (id, editedSummary) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? {
        ...p,
        consultantFacingSummaryDraft: editedSummary,
        status: 'Approved for Sourcing',
        createdBy: "Admin System",
        sentTo: ["ORR-CONS-8492", "ORR-CONS-1102"],
        summaryVersionSent: "v1.0"
      } : p
    )
  })),

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
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? {
          ...p,
          status: 'Sourcing Internally',
          sentTo: p.interestedConsultants?.map(c => c.id) || [],
          summaryVersionSent: 'v1.0 (Auto-match)'
        } : p
      )
    }));

    // Simulate consultants expressing interest after a delay
    setTimeout(() => {
      set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? {
            ...p,
            interestedConsultants: [
              { id: 'C-001', name: 'Dr. Evelyn Sato', expertise: 'Enterprise Strategy', cost: '$200/hr' },
              { id: 'C-002', name: 'Marcus Vance', expertise: 'EU Regulatory Compliance', cost: '$180/hr' }
            ]
          } : p
        )
      }));
    }, 2000);
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

  completeProject: async (id) => {
    // Simulated API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, status: 'Completed' } : p
      )
    }));
  },
}));
