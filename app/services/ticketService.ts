/**
 * Dedicated Ticket Management Service
 * Handles all ticket-related API operations with proper error handling and logging
 */

import { ticketAPI } from './api';
import type { TicketListItem, Ticket, TicketMessage, TicketStatus, TicketPriority, TicketSource } from './types';

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  source?: TicketSource;
  client?: string;
  assigned_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class TicketService {
  private static instance: TicketService;

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  /**
   * Fetch tickets with filters and pagination
   */
  async getTickets(filters: TicketFilters = {}): Promise<TicketListItem[]> {
    try {
      console.log('TicketService: Fetching tickets with filters:', filters);
      
      const cleanFilters: Record<string, any> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanFilters[key] = value;
        }
      });

      const response = await ticketAPI.listTickets(cleanFilters);
      console.log('TicketService: Raw API response:', response);

      let tickets: TicketListItem[] = [];
      if (Array.isArray(response)) {
        tickets = response;
      } else if (response && typeof response === 'object') {
        tickets = (response as any).results || (response as any).data || [];
      }

      console.log('TicketService: Processed tickets:', tickets);
      return Array.isArray(tickets) ? tickets : [];
    } catch (error: any) {
      console.error('TicketService: Error fetching tickets:', error);
      throw new Error(error.message || 'Failed to fetch tickets');
    }
  }

  /**
   * Get detailed ticket information
   */
  async getTicketDetails(ticketId: number): Promise<Ticket> {
    try {
      console.log('TicketService: Fetching ticket details for ID:', ticketId);
      
      const ticket = await ticketAPI.getTicket(ticketId);
      console.log('TicketService: Ticket details response:', ticket);
      
      return (ticket as any).data || ticket;
    } catch (error: any) {
      console.error('TicketService: Error fetching ticket details:', error);
      throw new Error(error.message || 'Failed to fetch ticket details');
    }
  }

  /**
   * Create new ticket
   */
  async createTicket(data: Partial<Ticket>): Promise<Ticket> {
    try {
      console.log('TicketService: Creating ticket with data:', data);
      
      const ticket = await ticketAPI.createTicket(data);
      console.log('TicketService: Ticket created successfully:', ticket);
      
      return (ticket as any).data || ticket;
    } catch (error: any) {
      console.error('TicketService: Error creating ticket:', error);
      throw new Error(error.message || 'Failed to create ticket');
    }
  }

  /**
   * Update ticket information
   */
  async updateTicket(ticketId: number, data: Partial<Ticket>): Promise<Ticket> {
    try {
      console.log('TicketService: Updating ticket ID:', ticketId, 'with data:', data);
      
      const updatedTicket = await ticketAPI.partialUpdateTicket(ticketId, data);
      console.log('TicketService: Ticket updated successfully:', updatedTicket);
      
      return (updatedTicket as any).data || updatedTicket;
    } catch (error: any) {
      console.error('TicketService: Error updating ticket:', error);
      throw new Error(error.message || 'Failed to update ticket');
    }
  }

  /**
   * Perform ticket action (assign, resolve, etc.)
   */
  async performTicketAction(ticketId: number, action: string, data?: any): Promise<void> {
    try {
      console.log('TicketService: Performing action:', action, 'on ticket ID:', ticketId);
      
      await ticketAPI.performAction(ticketId, action, data);
      console.log('TicketService: Action performed successfully');
    } catch (error: any) {
      console.error('TicketService: Error performing action:', error);
      throw new Error(error.message || 'Failed to perform action');
    }
  }

  /**
   * Get ticket messages
   */
  async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    try {
      console.log('TicketService: Fetching messages for ticket ID:', ticketId);
      
      const response = await ticketAPI.listMessages(ticketId);
      const messages = (response as any).data || response || [];
      
      console.log('TicketService: Messages response:', messages);
      return Array.isArray(messages) ? messages : [];
    } catch (error: any) {
      console.error('TicketService: Error fetching messages:', error);
      throw new Error(error.message || 'Failed to fetch messages');
    }
  }

  /**
   * Add message to ticket
   */
  async addTicketMessage(ticketId: number, message: string, isInternal: boolean = false): Promise<TicketMessage> {
    try {
      console.log('TicketService: Adding message to ticket ID:', ticketId);
      
      const response = await ticketAPI.addMessage(ticketId, message, isInternal);
      console.log('TicketService: Message added successfully:', response);
      
      return (response as any).data || response;
    } catch (error: any) {
      console.error('TicketService: Error adding message:', error);
      throw new Error(error.message || 'Failed to add message');
    }
  }

  /**
   * Get current user's tickets
   */
  async getMyTickets(): Promise<TicketListItem[]> {
    try {
      console.log('TicketService: Fetching my tickets');
      
      const response = await ticketAPI.getMyTickets();
      const tickets = (response as any).data || response || [];
      
      console.log('TicketService: My tickets response:', tickets);
      return Array.isArray(tickets) ? tickets : [];
    } catch (error: any) {
      console.error('TicketService: Error fetching my tickets:', error);
      throw new Error(error.message || 'Failed to fetch my tickets');
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(): Promise<any> {
    try {
      console.log('TicketService: Fetching ticket statistics');
      
      const stats = await ticketAPI.getStats();
      console.log('TicketService: Ticket stats response:', stats);
      
      return (stats as any).data || stats;
    } catch (error: any) {
      console.error('TicketService: Error fetching ticket stats:', error);
      throw new Error(error.message || 'Failed to fetch ticket statistics');
    }
  }

  /**
   * Search tickets by query
   */
  async searchTickets(query: string): Promise<TicketListItem[]> {
    try {
      console.log('TicketService: Searching tickets with query:', query);
      
      return await this.getTickets({ search: query });
    } catch (error: any) {
      console.error('TicketService: Error searching tickets:', error);
      throw new Error(error.message || 'Failed to search tickets');
    }
  }
}

// Export singleton instance
export const ticketService = TicketService.getInstance();