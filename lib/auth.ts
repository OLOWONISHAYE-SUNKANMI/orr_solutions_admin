const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  user_type: 'admin' | 'client';
  role: string;
  can_edit_content: boolean;
  permissions: {
    [key: string]: boolean;
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('access_token');
      this.token = (storedToken && storedToken !== 'undefined') ? storedToken : null;
      
      const userData = localStorage.getItem('user_data');
      if (userData && userData !== 'undefined') {
        try {
          this.user = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user_data');
        }
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }

    const responseData = await response.json();
    const resultData = responseData.data || responseData;
    
    // Normalize token keys from backend (handles both camelCase and snake_case)
    const access = resultData.access || resultData.accessToken;
    const refresh = resultData.refresh || resultData.refreshToken;
    
    this.token = access;
    this.user = resultData.user;

    if (typeof window !== 'undefined') {
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      if (this.user) localStorage.setItem('user_data', JSON.stringify(this.user));
    }

    return { 
      access: access || '', 
      refresh: refresh || '', 
      user: this.user as User 
    };
  }

  logout(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  canEdit(): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }
    
    // Only allow super_admin and content_editor roles
    const allowedRoles = ['super_admin', 'content_editor'];
    const canEdit = this.user?.is_superuser || allowedRoles.includes(this.user?.role || '');
    
    return canEdit;
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.user?.user_type === 'admin';
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Always get the freshest token from any available key
    const currentToken = typeof window !== 'undefined' ? (
      localStorage.getItem('access_token') || 
      localStorage.getItem('accessToken') || 
      localStorage.getItem('auth-token')
    ) : this.token;
    
    if (currentToken && currentToken !== 'undefined') {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}