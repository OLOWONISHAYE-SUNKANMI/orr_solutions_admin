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
      : (existingClients as any)?.results || (existingClients as any)?.data || [];

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
 * Creates a client with proper validation
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
    // Clean up the data before sending
    const cleanedData = { ...clientData };
    
    // Clean email
    if (cleanedData.email) {
      cleanedData.email = cleanedData.email.trim().toLowerCase();
    }
    
    // Clean company name
    if (cleanedData.company) {
      cleanedData.company = cleanedData.company.trim();
    }
    
    // Clean full name
    if (cleanedData.full_name) {
      cleanedData.full_name = cleanedData.full_name.trim();
    }
    
    // Remove username from request - let backend handle it
    delete cleanedData.username;
    
    // Remove empty optional fields
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key as keyof typeof cleanedData];
      if (value === '' || value === null || value === undefined) {
        // Keep required fields even if empty (let backend handle validation)
        if (key !== 'email' && key !== 'full_name' && key !== 'company') {
          delete cleanedData[key as keyof typeof cleanedData];
        }
      }
    });
    
    // Ensure required fields are present
    if (!cleanedData.email || !cleanedData.company) {
      throw new Error('Missing required fields: email and company are required');
    }
    
    console.log('🚀 Creating client with cleaned data:', cleanedData);
    
    const result = await clientAPI.createClient(cleanedData);
    console.log('✅ Client created successfully');
    return result;
    
  } catch (error: any) {
    console.error('❌ Failed to create client:', error);
    
    // Handle specific error cases with improved messaging
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('client with this email already exists') || 
        errorMessage.includes('Email address already exists')) {
      throw new Error('A client with this email address already exists. Please search the client list to find the existing client or use a different email address.');
    }
    
    if (errorMessage.includes('user already has a client profile') || 
        errorMessage.includes('This user already has a client profile')) {
      throw new Error('This user already has a client profile in the system. Please search for the existing client instead of creating a new one.');
    }
    
    if (errorMessage.includes('Username conflict') || 
        errorMessage.includes('Username already exists')) {
      throw new Error('Username conflict occurred. The system will auto-generate a unique username.');
    }
    
    if (errorMessage.includes('constraint error') || 
        errorMessage.includes('Database constraint')) {
      throw new Error('This client may already exist in the system. Please verify the email address and check the existing client list.');
    }
    
    throw error;
  }
}

/**
 * Formats error messages for user display
 */
export function formatClientError(error: any): string {
  const message = error.message || error.toString();
  
  // Handle specific backend error messages
  if (message.includes('client with this email already exists') || 
      message.includes('Email address already exists')) {
    return 'A client with this email address already exists. Please search the client list or use a different email.';
  }
  
  if (message.includes('user already has a client profile') || 
      message.includes('This user already has a client profile')) {
    return 'This user already has a client profile. Please search for the existing client.';
  }
  
  if (message.includes('Username conflict')) {
    return 'Username conflict occurred. The system will handle this automatically.';
  }
  
  if (message.includes('constraint error') || message.includes('Database constraint')) {
    return 'This client may already exist. Please check the client list first.';
  }
  
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
  
  if (message.includes('validation') || message.includes('required')) {
    return 'Please check your input data. Some required fields may be missing or invalid.';
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