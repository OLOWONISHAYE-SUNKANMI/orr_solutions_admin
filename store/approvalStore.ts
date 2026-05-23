import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApprovalActionType = 'HARD_DELETE' | 'ROLE_CHANGE' | 'MASS_REASSIGN';

export interface ApprovalRequest {
  id: string;
  actionType: ApprovalActionType;
  requestedBy: {
    name: string;
    email: string;
    role: string;
  };
  details: {
    targetId: string;
    targetName: string;
    description: string;
    meta?: any;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface ApprovalState {
  requests: ApprovalRequest[];
  initiateRequest: (
    actionType: ApprovalActionType,
    requestedBy: { name: string; email: string; role: string },
    details: { targetId: string; targetName: string; description: string; meta?: any }
  ) => Promise<string>;
  approveRequest: (id: string, reviewerName: string) => Promise<void>;
  rejectRequest: (id: string, reviewerName: string, reason: string) => Promise<void>;
  clearHistory: () => void;
}

// Initial realistic mock data to populate the Operations Console immediately
const initialMockRequests: ApprovalRequest[] = [
  {
    id: 'REQ-1092',
    actionType: 'HARD_DELETE',
    requestedBy: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@orr.solutions',
      role: 'Admin'
    },
    details: {
      targetId: 'DOC-772',
      targetName: 'Tax_Audit_Report_2025.pdf',
      description: 'Hard deletion of client-facing financial statement in Zenith Digital Workspace.',
      meta: { clientId: '4', company: 'Zenith Digital' }
    },
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString() // 2.5 hours ago
  },
  {
    id: 'REQ-1093',
    actionType: 'ROLE_CHANGE',
    requestedBy: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@orr.solutions',
      role: 'Admin'
    },
    details: {
      targetId: 'USR-881',
      targetName: 'David Kim',
      description: 'Elevate user role from Operational Operator to Standard Administrator.',
      meta: { currentRole: 'operator', newRole: 'admin' }
    },
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString() // 48 mins ago
  },
  {
    id: 'REQ-1094',
    actionType: 'MASS_REASSIGN',
    requestedBy: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@orr.solutions',
      role: 'Admin'
    },
    details: {
      targetId: 'REASSIGN-09',
      targetName: 'David Kim → Robert Chen',
      description: 'Mass reassign all 14 active clients under Operator David Kim to Operator Robert Chen due to transition of accounts.',
      meta: { clientCount: 14, sourceUser: 'David Kim', targetUser: 'Robert Chen' }
    },
    status: 'PENDING',
    createdAt: new Date(Date.now() - 600000 * 2).toISOString() // 20 mins ago
  },
  // Completed History Mock Data
  {
    id: 'REQ-1088',
    actionType: 'HARD_DELETE',
    requestedBy: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@orr.solutions',
      role: 'Admin'
    },
    details: {
      targetId: 'DOC-512',
      targetName: 'Old_Marketing_Draft_2023.zip',
      description: 'Hard deletion of obsolete legacy files.',
      meta: { clientId: '9', company: 'Apex Global' }
    },
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviewedBy: 'Super Admin Override',
    reviewedAt: new Date(Date.now() - 3600000 * 22).toISOString()
  },
  {
    id: 'REQ-1089',
    actionType: 'ROLE_CHANGE',
    requestedBy: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@orr.solutions',
      role: 'Admin'
    },
    details: {
      targetId: 'USR-902',
      targetName: 'Lisa Vance',
      description: 'Elevate Lisa Vance to Super Admin role.',
      meta: { currentRole: 'admin', newRole: 'super_admin' }
    },
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    reviewedBy: 'Super Admin Override',
    reviewedAt: new Date(Date.now() - 3600000 * 25.5).toISOString(),
    rejectionReason: 'Elevation of external administrators to Super Admin is forbidden without formal corporate approval.'
  }
];

export const useApprovalStore = create<ApprovalState>()(
  persist(
    (set, get) => ({
      requests: initialMockRequests,

      initiateRequest: async (actionType, requestedBy, details) => {
        const id = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
        const newRequest: ApprovalRequest = {
          id,
          actionType,
          requestedBy,
          details,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };

        // Add request to list
        set((state) => ({
          requests: [newRequest, ...state.requests]
        }));

        // Log to simulated global audit log
        try {
          const auditLogs = JSON.parse(localStorage.getItem('orr_admin_audit_logs') || '[]');
          const newAudit = {
            id: `AUDIT-${Math.floor(10000 + Math.random() * 90000)}`,
            username: requestedBy.name,
            user_full_name: requestedBy.name,
            action: `INITIATED_APPROVAL`,
            model_name: actionType,
            object_id: details.targetId,
            description: `Initiated dual-approval request ${id} for sensitive action: ${details.description}`,
            ip_address: '192.168.1.104',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('orr_admin_audit_logs', JSON.stringify([newAudit, ...auditLogs]));
        } catch (e) {
          console.warn('Simulated audit log write failed:', e);
        }

        return id;
      },

      approveRequest: async (id, reviewerName) => {
        const request = get().requests.find((r) => r.id === id);
        if (!request) return;

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'APPROVED',
                  reviewedBy: reviewerName,
                  reviewedAt: new Date().toISOString()
                }
              : r
          )
        }));

        // Trigger simulated actual execution logs into audit trail
        try {
          const auditLogs = JSON.parse(localStorage.getItem('orr_admin_audit_logs') || '[]');
          const actionAudit = {
            id: `AUDIT-${Math.floor(10000 + Math.random() * 90000)}`,
            username: reviewerName,
            user_full_name: reviewerName,
            action: `APPROVED_ACTION`,
            model_name: request.actionType,
            object_id: request.details.targetId,
            description: `Approved and executed dual-approval request ${id}: ${request.details.description}`,
            ip_address: '192.168.1.1',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('orr_admin_audit_logs', JSON.stringify([actionAudit, ...auditLogs]));
        } catch (e) {
          console.warn('Simulated audit log write failed:', e);
        }
      },

      rejectRequest: async (id, reviewerName, reason) => {
        const request = get().requests.find((r) => r.id === id);
        if (!request) return;

        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'REJECTED',
                  reviewedBy: reviewerName,
                  reviewedAt: new Date().toISOString(),
                  rejectionReason: reason
                }
              : r
          )
        }));

        // Log to simulated global audit log
        try {
          const auditLogs = JSON.parse(localStorage.getItem('orr_admin_audit_logs') || '[]');
          const actionAudit = {
            id: `AUDIT-${Math.floor(10000 + Math.random() * 90000)}`,
            username: reviewerName,
            user_full_name: reviewerName,
            action: `REJECTED_ACTION`,
            model_name: request.actionType,
            object_id: request.details.targetId,
            description: `Rejected dual-approval request ${id} with reason: "${reason}". Action: ${request.details.description}`,
            ip_address: '192.168.1.1',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('orr_admin_audit_logs', JSON.stringify([actionAudit, ...auditLogs]));
        } catch (e) {
          console.warn('Simulated audit log write failed:', e);
        }
      },

      clearHistory: () => {
        set((state) => ({
          requests: state.requests.filter((r) => r.status === 'PENDING')
        }));
      }
    }),
    {
      name: 'approval-queue-storage'
    }
  )
);
