/**
 * Dedicated Client Management Service
 * Handles all client-related API operations with proper error handling and logging
 */

import { clientAPI } from './api';
import type { ClientListItem, Client } from './types';

export interface ClientFilters {
  stage?: string;
  primary_pillar?: string;
  is_portal_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ClientResponse {
  results: ClientListItem[];
  count: number;
  next?: string;
  previous?: string;
}

export class ClientService {
  private static instance: ClientService;

  public static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  /**
   * Fetch clients with filters and pagination
   */
  async getClients(filters: ClientFilters = {}): Promise<ClientListItem[]> {
    try {
      console.log('ClientService: Fetching clients with filters:', filters);
      
      // Clean up filters - remove empty values
      const cleanFilters: Record<string, any> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          cleanFilters[key] = value;
        }
      });

      const response = await clientAPI.listClients(cleanFilters);
      console.log('ClientService: Raw API response:', response);

      // Handle different response formats
      let clients: ClientListItem[] = [];
      if (Array.isArray(response)) {
        clients = response;
      } else if (response && typeof response === 'object') {
        clients = (response as any).results || (response as any).data || [];
      }

      console.log('ClientService: Processed clients:', clients);
      return clients;
    } catch (error: any) {
      console.error('ClientService: Error fetching clients:', error);
      throw new Error(error.message || 'Failed to fetch clients');
    }
  }

  /**
   * Get detailed client information
   */
  async getClientDetails(clientId: number): Promise<Client> {
    try {
      console.log('ClientService: Fetching client details for ID:', clientId);
      
      const client = await clientAPI.getClient(clientId);
      console.log('ClientService: Client details response:', client);
      
      return client as Client;
    } catch (error: any) {
      console.error('ClientService: Error fetching client details:', error);
      throw new Error(error.message || 'Failed to fetch client details');
    }
  }

  /**
   * Toggle client portal access
   */
  async togglePortalAccess(clientId: number): Promise<void> {
    try {
      console.log('ClientService: Toggling portal access for client ID:', clientId);
      
      await clientAPI.performAction(clientId, 'toggle_portal');
      console.log('ClientService: Portal access toggled successfully');
    } catch (error: any) {
      console.error('ClientService: Error toggling portal access:', error);
      throw new Error(error.message || 'Failed to toggle portal access');
    }
  }

  /**
   * Update client information
   */
  async updateClient(clientId: number, data: Partial<Client>): Promise<Client> {
    try {
      console.log('ClientService: Updating client ID:', clientId, 'with data:', data);
      
      const updatedClient = await clientAPI.partialUpdateClient(clientId, data);
      console.log('ClientService: Client updated successfully:', updatedClient);
      
      return updatedClient as Client;
    } catch (error: any) {
      console.error('ClientService: Error updating client:', error);
      throw new Error(error.message || 'Failed to update client');
    }
  }

  /**
   * Get client engagement history
   */
  async getEngagementHistory(clientId: number): Promise<any> {
    try {
      console.log('ClientService: Fetching engagement history for client ID:', clientId);
      
      const history = await clientAPI.getEngagementHistory(clientId);
      console.log('ClientService: Engagement history response:', history);
      
      return history;
    } catch (error: any) {
      console.error('ClientService: Error fetching engagement history:', error);
      throw new Error(error.message || 'Failed to fetch engagement history');
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats(): Promise<any> {
    try {
      console.log('ClientService: Fetching client statistics');
      
      const stats = await clientAPI.getStats();
      console.log('ClientService: Client stats response:', stats);
      
      return stats;
    } catch (error: any) {
      console.error('ClientService: Error fetching client stats:', error);
      throw new Error(error.message || 'Failed to fetch client statistics');
    }
  }

  /**
   * Search clients by query
   */
  async searchClients(query: string): Promise<ClientListItem[]> {
    try {
      console.log('ClientService: Searching clients with query:', query);
      
      return await this.getClients({ search: query });
    } catch (error: any) {
      console.error('ClientService: Error searching clients:', error);
      throw new Error(error.message || 'Failed to search clients');
    }
  }

  /**
   * Get complete client profile
   */
  async getCompleteProfile(clientId: number): Promise<any> {
    try {
      console.log('ClientService: Fetching complete profile for client ID:', clientId);
      
      const profile = await clientAPI.getCompleteProfile(clientId);
      console.log('ClientService: Complete profile response:', profile);
      
      return profile;
    } catch (error: any) {
      console.error('ClientService: Error fetching complete profile:', error);
      throw new Error(error.message || 'Failed to fetch complete profile');
    }
  }

  /**
   * Get client documents
   */
  async getClientDocuments(clientId: number): Promise<any[]> {
    try {
      console.log('ClientService: Fetching documents for client ID:', clientId);
      
      const documents = await clientAPI.listDocuments(clientId);
      console.log('ClientService: Documents response:', documents);
      
      return Array.isArray(documents) ? documents : ((documents as any).results || []);
    } catch (error: any) {
      console.error('ClientService: Error fetching client documents:', error);
      throw new Error(error.message || 'Failed to fetch client documents');
    }
  }

  /**
   * Upload client document
   */
  async uploadClientDocument(clientId: number, formData: FormData): Promise<any> {
    try {
      console.log('ClientService: Uploading document for client ID:', clientId);
      
      const result = await clientAPI.uploadDocument(clientId, formData);
      console.log('ClientService: Document upload response:', result);
      
      return result;
    } catch (error: any) {
      console.error('ClientService: Error uploading document:', error);
      throw new Error(error.message || 'Failed to upload document');
    }
  }

  /**
   * Update client document
   */
  async updateClientDocument(clientId: number, docId: number, data: Record<string, any>): Promise<any> {
    try {
      console.log('ClientService: Updating document for client ID:', clientId, 'doc ID:', docId);
      
      const result = await clientAPI.partialUpdateDocument(clientId, docId, data);
      console.log('ClientService: Document update response:', result);
      
      return result;
    } catch (error: any) {
      console.error('ClientService: Error updating document:', error);
      throw new Error(error.message || 'Failed to update document');
    }
  }

  /**
   * Delete client document
   */
  async deleteClientDocument(clientId: number, docId: number): Promise<void> {
    try {
      console.log('ClientService: Deleting document for client ID:', clientId, 'doc ID:', docId);
      
      await clientAPI.deleteDocument(clientId, docId);
      console.log('ClientService: Document deleted successfully');
    } catch (error: any) {
      console.error('ClientService: Error deleting document:', error);
      throw new Error(error.message || 'Failed to delete document');
    }
  }
}

// Export singleton instance
export const clientService = ClientService.getInstance();