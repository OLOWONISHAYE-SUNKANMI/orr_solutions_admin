import { create } from 'zustand';
import { AuthService } from '@/lib/auth';

export interface Dispute {
  id: string;
  transactionId: string;
  userName: string;
  amount: number;
  reason: string;
  status: 'needs_response' | 'under_review' | 'won' | 'lost' | 'resolved';
  dueDate: string;
  timestamp: string;
}

interface DisputeStats {
  totalDisputes: number;
  activeCount: number;
  resolvedCount: number;
  winRate: number;
  disputeRate: number;
  totalAmount: number;
}

interface DisputeState {
  disputes: Dispute[];
  statistics: DisputeStats;
  isLoading: boolean;
  fetchDisputes: () => Promise<void>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

export const useDisputeStore = create<DisputeState>((set) => ({
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
  }
}));
