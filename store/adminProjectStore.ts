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
  | 'Active';

export interface AdminProjectBrief {
  id: string;
  pmId: string;
  clientName: string;
  projectTitle: string;
  primaryCategory: string;
  targetDeadline: string;
  urgency: string;
  status: AdminProjectStatus;
  createdAt: string;
  scope: string;
  confidentiality: string;
  consultantsNeeded: number;
  clarificationNotes?: string;
  consultantFacingSummaryDraft?: string;
  pmInputRequestNotes?: string;
  interestedConsultants?: { id: string; name: string; expertise: string; cost: string }[];
  selectedConsultantId?: string;
}

interface AdminProjectState {
  projects: AdminProjectBrief[];
  isGeneratingSummary: boolean;
  approveProjectForDrafting: (id: string) => void;
  requestClarification: (id: string, notes: string) => void;
  generateConsultantSummary: (id: string) => Promise<void>;
  approveConsultantSummary: (id: string, editedSummary: string) => void;
  requestPmInputForSourcing: (id: string, notes: string) => void;
  sourceProjectInternally: (id: string) => void;
  sourceProjectExternally: (id: string, email: string) => void;
  selectConsultant: (id: string, consultantId: string) => void;
}

// Mock initial data bridging from the PM dashboard concepts
const MOCK_PROJECTS: AdminProjectBrief[] = [
  {
    id: 'ORR-PROJ-000001',
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
  },
  {
    id: 'ORR-PROJ-000002',
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
  }
];

export const useAdminProjectStore = create<AdminProjectState>((set, get) => ({
  projects: MOCK_PROJECTS,
  isGeneratingSummary: false,
  
  approveProjectForDrafting: (id) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, status: 'Drafting Consultant Summary' } : p
    )
  })),

  requestClarification: (id, notes) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, status: 'Needs PM Clarification', clarificationNotes: notes } : p
    )
  })),

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
        status: 'Approved for Sourcing' 
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
          status: 'Sourcing Internally' 
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
        interestedConsultants: [
          { id: 'EXT-001', name: email, expertise: 'External Consultant', cost: 'TBD' }
        ]
      } : p
    )
  })),

  selectConsultant: (id, consultantId) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { 
        ...p, 
        status: 'Consultant Assignment Pending',
        selectedConsultantId: consultantId
      } : p
    )
  })),
}));
