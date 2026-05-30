import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/app/services/api';

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
  isLoading: boolean;
  fetchRequests: (status?: string) => Promise<void>;
  initiateRequest: (
    actionType: ApprovalActionType,
    requestedBy: { name: string; email: string; role: string },
    details: { targetId: string; targetName: string; description: string; meta?: any }
  ) => Promise<string>;
  approveRequest: (id: string, reviewerName: string) => Promise<void>;
  rejectRequest: (id: string, reviewerName: string, reason: string) => Promise<void>;
  clearHistory: () => void;
}

export const useApprovalStore = create<ApprovalState>()(
  persist(
    (set, get) => ({
      requests: [],
      isLoading: false,

      fetchRequests: async (status?: string) => {
        set({ isLoading: true });
        try {
          const response = await api.approvalQueue.getApprovalQueue(status) as any;
          const rawResults = response?.data?.results || response?.data || response?.results || (Array.isArray(response) ? response : []);
          const mappedRequests = rawResults.map((r: any) => ({
            id: r.id,
            actionType: r.action_type,
            requestedBy: {
              name: r.requested_by_name,
              email: '', // Backend might not return email currently, can add later if needed
              role: r.requested_by_role,
            },
            details: r.payload,
            status: r.status,
            createdAt: r.requested_at,
            reviewedBy: r.decided_by_name,
            reviewedAt: r.decided_at,
            rejectionReason: r.rejection_reason,
          }));
          set({ requests: mappedRequests, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch approval queue:", error);
          set({ isLoading: false });
        }
      },

      initiateRequest: async (actionType, requestedBy, details) => {
        try {
          const response = await api.approvalQueue.createApprovalRequest(actionType, details) as any;
          const newRequest: ApprovalRequest = {
            id: response.request_id,
            actionType,
            requestedBy,
            details,
            status: 'PENDING',
            createdAt: new Date().toISOString()
          };
          
          set((state) => ({
            requests: [newRequest, ...state.requests]
          }));
          return response.request_id;
        } catch (error) {
          console.error("Failed to initiate request:", error);
          throw error;
        }
      },

      approveRequest: async (id, reviewerName) => {
        try {
          await api.approvalQueue.decideApproval(id, 'APPROVED');
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
        } catch (error) {
          console.error("Failed to approve request:", error);
          throw error;
        }
      },

      rejectRequest: async (id, reviewerName, reason) => {
        try {
          await api.approvalQueue.decideApproval(id, 'REJECTED', reason);
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
        } catch (error) {
          console.error("Failed to reject request:", error);
          throw error;
        }
      },

      clearHistory: () => {
        set((state) => ({
          requests: state.requests.filter((r) => r.status === 'PENDING')
        }));
      }
    }),
    {
      name: 'approval-queue-storage',
      partialize: (state) => ({ requests: state.requests }), // Persist only requests locally, but fetch overrides on mount
    }
  )
);
