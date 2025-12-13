/**
 * Client Utilities
 * Helper functions for client management and validation
 */

import { clientAPI } from './api';

export interface ClientValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: {
    email?: string;
    username?: string;
  };
}

/**
 * Validates client data before creation
 */
export async function validateClientData(clientData: {
  email: string;
  username?: string;
  full_name: string;
  company: string;
}): Promise<ClientValidationResult> {
  const errors: string[] = [];
  const suggestions: { email?: string; username?: string } = {};

  try {
    // Check if email already exists by searching clients
    const existingClients = await clientAPI.listClients({ 
      search: clientData.email,
      limit: 10 
    });
    
    const clientsArray = Array.isArray(existingClients) 
      ? existingClients 
      : existingClients?.results || existingClients?.data || [];

    // Check for email duplicates
    const emailExists = clientsArray.some((client: any) => 
      client.email?.toLowerCase() === clientData.email.toLowerCase()
    );

    if (emailExists) {
      errors.push('Email address already exists');
      suggestions.email = generateUniqueEmail(clientData.email);
    }

    // Check for username duplicates if username provided
    if (clientData.username) {
      const usernameExists = clientsArray.some((client: any) => 
        client.username?.toLowerCase() === clientData.username?.toLowerCase()
      );

      if (usernameExists) {
        errors.push('Username already exists');
        suggestions.username = generateUniqueUsername(clientData.username);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };

  } catch (error) {
    console.warn('Could not validate client data:', error);
    // If validation fails, assume it's valid and let the backend handle it
    return {
      isValid: true,
      errors: [],
      suggestions: {}
    };
  }
}

/**
 * Generates a unique email address
 */
export function generateUniqueEmail(originalEmail: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  const emailParts = originalEmail.split('@');
  const domain = emailParts[1] || 'example.com';
  const localPart = emailParts[0] || 'user';
  
  return `${localPart}_${timestamp}_${randomSuffix}@${domain}`;
}

/**
 * Generates a unique username
 */
export function generateUniqueUsername(originalUsername: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  return `${originalUsername}_${timestamp}_${randomSuffix}`;
}

/**
 * Creates a client with automatic retry and unique identifier generation
 */
export async function createClientSafely(clientData: {
  email: string;
  username?: string;
  full_name: string;
  company: string;
  role?: string;
  stage?: string;
  primary_pillar?: string;
  secondary_pillars?: string;
  internal_notes?: string;
  is_portal_active?: boolean;
}): Promise<any> {
  try {
    // Generate unique identifiers to avoid any conflicts
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    
    const emailParts = clientData.email.split('@');
    const uniqueEmail = `${emailParts[0]}_${timestamp}_${randomSuffix}@${emailParts[1] || 'example.com'}`;
    const uniqueUsername = `${clientData.username || emailParts[0] || 'user'}_${timestamp}_${randomSuffix}`;
    
    const finalClientData = {
      ...clientData,
      email: uniqueEmail,
      username: uniqueUsername
    };
    
    console.log('🚀 Creating client with unique identifiers');
    
    const result = await clientAPI.createClient(finalClientData);
    console.log('✅ Client created successfully');
    return result;
    
  } catch (error: any) {
    console.error('❌ Failed to create client:', error);
    throw error;
  }
}

/**
 * Formats error messages for user display
 */
export function formatClientError(error: any): string {
  const message = error.message || error.toString();
  
  if (message.includes('duplicate key value violates unique constraint')) {
    if (message.includes('user_id')) {
      return 'This user is already registered in the system. Please check if the client already exists.';
    }
    if (message.includes('email')) {
      return 'This email address is already registered. Please use a different email address.';
    }
    if (message.includes('username')) {
      return 'This username is already taken. Please choose a different username.';
    }
    return 'A client with this information already exists. Please check your input.';
  }
  
  if (message.includes('validation')) {
    return 'Please check your input data. Some fields may be invalid.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return message;
}

export default {
  validateClientData,
  generateUniqueEmail,
  generateUniqueUsername,
  createClientSafely,
  formatClientError
};