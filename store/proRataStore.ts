import { create } from 'zustand';
import { AuthService } from '@/lib/auth';

export interface ProRataRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  type: string;
  currentPlan: string;
  newPlan: string;
  amount: number;
  reason: string;
  requestedDate: string;
  effectiveDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ProRataStats {
  pendingCount: number;
  totalAdjustmentValue: number;
  averageProcessingTime: string;
  approvalRate: number;
}

interface ProRataState {
  requests: ProRataRequest[];
  statistics: ProRataStats;
  isLoading: boolean;
  
  fetchRequests: () => Promise<void>;
  processAction: (id: string, decision: 'approve' | 'reject') => Promise<void>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

export const useProRataStore = create<ProRataState>((set) => ({
  requests: [],
  statistics: {
    pendingCount: 0,
    totalAdjustmentValue: 0,
    averageProcessingTime: '0 days',
    approvalRate: 0
  },
  isLoading: false,

  fetchRequests: async () => {
    set({ isLoading: true });
    try {
      const auth = AuthService.getInstance();
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/admin-portal/v1/prorata-approvals/requests/`);
      const result = await response.json();
      const data = result.data || result || {};
      
      const mappedRequests: ProRataRequest[] = (data.pending_requests || []).map((req: any) => ({
        id: req.request_id,
        clientName: req.client_name,
        clientEmail: req.client_email,
        type: req.request_type,
        currentPlan: req.current_plan,
        newPlan: req.new_plan,
        amount: req.prorata_amount,
        reason: req.reason,
        requestedDate: req.requested_date,
        effectiveDate: req.effective_date,
        status: req.status as any
      }));

      const statsData = data.statistics || {};
      const statistics: ProRataStats = {
        pendingCount: (data.pending_requests || []).length,
        totalAdjustmentValue: statsData.total_adjustment_value || 0,
        averageProcessingTime: statsData.average_processing_time || '0 days',
        approvalRate: statsData.approval_rate || 0
      };

      set({ requests: mappedRequests, statistics, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch pro-rata requests:', error);
      set({ isLoading: false });
    }
  },

  processAction: async (id, decision) => {
    try {
      const auth = AuthService.getInstance();
      await auth.makeAuthenticatedRequest(`${baseUrl}/admin-portal/v1/prorata-approvals/decision/`, {
        method: 'POST',
        body: JSON.stringify({
          request_id: id,
          decision: decision
        })
      });
      
      set(state => ({
        requests: state.requests.filter(r => r.id !== id),
        statistics: {
          ...state.statistics,
          pendingCount: state.statistics.pendingCount - 1
        }
      }));
    } catch (error) {
      console.error('Failed to process decision:', error);
    }
  }
}));
