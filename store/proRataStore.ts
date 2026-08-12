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

export interface RecentDecision {
  request_id: string;
  client_name: string;
  client_email: string;
  request_type: string;
  current_plan: string;
  new_plan: string;
  prorata_amount: number;
  reason: string;
  status: 'approved' | 'rejected';
  decided_by: string;
  decided_at: string;
}

export interface WorkflowMetrics {
  average_approval_time: number;
  requests_by_priority: {
    high: number;
    normal: number;
    low: number;
  };
  requests_by_type: {
    plan_upgrade: number;
    plan_downgrade: number;
    billing_adjustment: number;
  };
  monthly_trend: Array<{
    month: string;
    requests: number;
  }>;
}

interface ProRataStats {
  totalRequestsThisMonth: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalProrataAmountPending: number;
  totalProrataAmountApproved: number;
  averageProcessingTime: number;
  approvalRate: number;
}

interface ProRataState {
  requests: ProRataRequest[];
  recentDecisions: RecentDecision[];
  workflowMetrics: WorkflowMetrics | null;
  statistics: ProRataStats;
  isLoading: boolean;
  
  fetchRequests: () => Promise<void>;
  processAction: (id: string, decision: 'approve' | 'reject') => Promise<void>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

export const useProRataStore = create<ProRataState>((set, get) => ({
  requests: [],
  recentDecisions: [],
  workflowMetrics: null,
  statistics: {
    totalRequestsThisMonth: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalProrataAmountPending: 0,
    totalProrataAmountApproved: 0,
    averageProcessingTime: 0,
    approvalRate: 0
  },
  isLoading: false,

  fetchRequests: async () => {
    set({ isLoading: true });
    try {
      const token = typeof window !== 'undefined' ? (
        localStorage.getItem('access_token') || 
        localStorage.getItem('accessToken') || 
        localStorage.getItem('auth-token')
      ) : null;

      const response = await fetch(`${baseUrl}/admin-portal/v1/prorata-approvals/requests/`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
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
        totalRequestsThisMonth: statsData.total_requests_this_month || 0,
        pendingRequests: statsData.pending_requests || 0,
        approvedRequests: statsData.approved_requests || 0,
        rejectedRequests: statsData.rejected_requests || 0,
        totalProrataAmountPending: statsData.total_prorata_amount_pending || 0,
        totalProrataAmountApproved: statsData.total_prorata_amount_approved || 0,
        averageProcessingTime: statsData.average_processing_time || 0,
        approvalRate: statsData.approval_rate || 0
      };

      const recentDecisions = data.recent_decisions || [];
      const workflowMetrics = data.workflow_metrics || null;

      set({ 
        requests: mappedRequests, 
        recentDecisions, 
        workflowMetrics, 
        statistics, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch pro-rata requests:', error);
      set({ isLoading: false });
    }
  },

  processAction: async (id, decision) => {
    try {
      const token = typeof window !== 'undefined' ? (
        localStorage.getItem('access_token') || 
        localStorage.getItem('accessToken') || 
        localStorage.getItem('auth-token')
      ) : null;

      await fetch(`${baseUrl}/admin-portal/v1/prorata-approvals/decision/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          request_id: id,
          decision: decision
        })
      });
      
      // Refresh statistics & requests list after change
      await get().fetchRequests();
    } catch (error) {
      console.error('Failed to process decision:', error);
    }
  }
}));
