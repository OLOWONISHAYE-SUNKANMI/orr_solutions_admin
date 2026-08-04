import { create } from 'zustand';
import { AuthService } from '@/lib/auth';

export interface Dispute {
  id: string;
  transactionId: string;
  userName: string;
  amount: number;
  reason: string;
  status: 'open' | 'needs_response' | 'under_review' | 'won' | 'lost' | 'resolved' | 'closed';
  dueDate: string;
  timestamp: string;
  disputeType?: string;
  priority?: string;
  daysRemaining?: number;
}

interface DisputeStats {
  totalDisputes: number;
  activeCount: number;
  resolvedCount: number;
  winRate: number;
  disputeRate: number;
  totalAmount: number;
}

type StatusFilter = 'all' | 'needs_response' | 'under_review' | 'resolved';

interface DisputeState {
  disputes: Dispute[];
  statistics: DisputeStats;
  isLoading: boolean;
  searchQuery: string;
  statusFilter: StatusFilter;
  createModalOpen: boolean;

  // Derived
  filteredDisputes: () => Dispute[];

  // Actions
  fetchDisputes: () => Promise<void>;
  createDispute: (data: {
    client_id: number;
    invoice_id: number;
    dispute_amount: number;
    dispute_reason: string;
    dispute_type: string;
  }) => Promise<{ success: boolean; error?: string }>;
  performAction: (disputeId: string, action: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setCreateModalOpen: (open: boolean) => void;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

export const useDisputeStore = create<DisputeState>((set, get) => ({
  disputes: [],
  statistics: {
    totalDisputes: 0,
    activeCount: 0,
    resolvedCount: 0,
    winRate: 0,
    disputeRate: 0,
    totalAmount: 0
  },
  isLoading: false,
  searchQuery: '',
  statusFilter: 'all',
  createModalOpen: false,

  filteredDisputes: () => {
    const { disputes, searchQuery, statusFilter } = get();
    return disputes.filter(d => {
      const matchesSearch =
        !searchQuery ||
        d.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.reason.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'needs_response') {
        matchesStatus = d.status === 'open' || d.status === 'needs_response';
      } else if (statusFilter === 'under_review') {
        matchesStatus = d.status === 'under_review';
      } else if (statusFilter === 'resolved') {
        matchesStatus = d.status === 'resolved' || d.status === 'closed' || d.status === 'won' || d.status === 'lost';
      }

      return matchesSearch && matchesStatus;
    });
  },

  fetchDisputes: async () => {
    set({ isLoading: true });
    try {
      const auth = AuthService.getInstance();
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/admin-portal/v1/payment-disputes/overview/`);
      const result = await response.json();
      const data = result.data || result || {};
      
      const mappedDisputes: Dispute[] = (data.active_disputes || []).map((d: any) => ({
        id: d.dispute_id,
        transactionId: d.invoice_id,
        userName: d.client_name,
        amount: d.amount,
        reason: d.reason,
        status: d.status as any,
        dueDate: d.due_date,
        timestamp: d.created_date,
        disputeType: d.dispute_type,
        priority: d.priority,
        daysRemaining: d.days_remaining
      }));

      const statsData = data.dispute_statistics || {};
      const statistics: DisputeStats = {
        totalDisputes: statsData.total_disputes || 0,
        activeCount: statsData.active_disputes || 0,
        resolvedCount: statsData.resolved_disputes || 0,
        winRate: statsData.win_rate || 0,
        disputeRate: statsData.dispute_rate || 0,
        totalAmount: statsData.total_disputed_amount || 0
      };

      set({ disputes: mappedDisputes, statistics, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      set({ isLoading: false });
    }
  },

  createDispute: async (data) => {
    try {
      const auth = AuthService.getInstance();
      const response = await auth.makeAuthenticatedRequest(`${baseUrl}/admin-portal/v1/payment-disputes/overview/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Refresh the list
      await get().fetchDisputes();
      return { success: true };
    } catch (error: any) {
      console.error('Failed to create dispute:', error);
      return { success: false, error: error.message || 'Failed to create dispute' };
    }
  },

  performAction: async (disputeId, action, notes = '') => {
    try {
      const auth = AuthService.getInstance();
      const response = await auth.makeAuthenticatedRequest(
        `${baseUrl}/admin-portal/v1/payment-disputes/${disputeId}/actions/`,
        {
          method: 'POST',
          body: JSON.stringify({ action, notes }),
        }
      );
      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Refresh the list
      await get().fetchDisputes();
      return { success: true };
    } catch (error: any) {
      console.error('Failed to perform dispute action:', error);
      return { success: false, error: error.message || 'Action failed' };
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setCreateModalOpen: (open) => set({ createModalOpen: open }),
}));
