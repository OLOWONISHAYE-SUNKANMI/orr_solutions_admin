import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../../app/services/types';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  setUser: (user: AdminUser) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (token: string, user: AdminUser) => {
        localStorage.setItem('auth-token', token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },
      setUser: (user: AdminUser) => set({ user, isAuthenticated: true }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Ensure token is synced with localStorage after rehydration
        if (state?.token) {
          const storedToken = localStorage.getItem('auth-token');
          if (storedToken && storedToken === state.token) {
            state.isAuthenticated = true;
          } else if (storedToken) {
            // localStorage has token but store doesn't, use localStorage version
            state.token = storedToken;
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
);