'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/hooks/auth';
import { useRouter } from 'next/navigation';

export function useGoogleAuth() {
  const login = useAuthStore(state => state.login);
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      setIsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}`;
      const res = await fetch(`${apiUrl}/api/auth/google-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential, portal: 'admin' }),
      });

      const result = await res.json();

      if (res.ok) {
        const data = result?.data?.data || result?.data || result;
        const accessToken = data?.access || data?.token?.access || data?.tokens?.access;
        const user = data?.user || result?.user || {};
        
        if (accessToken) {
          login(accessToken, user);
          router.push('/dashboard');
        } else {
          console.error("Login succeeded but no token received.");
          alert("Login failed: Invalid token received from server");
        }
      } else {
        const errorMsg = result?.message || result?.detail || "Authentication failed";
        console.error("Google authentication failed:", errorMsg);
        alert(errorMsg); // Temporary user-facing feedback 
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      alert('Network error communicating with authentication server.');
    } finally {
      setIsLoading(false);
    }
  }, [login, router]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.warn('Google Client ID not found in environment variables');
      return;
    }

    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        // Cancel any pending UI to prevent FedCM AbortError in React StrictMode
        (window as any).google.accounts.id.cancel();
        
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
          // @ts-ignore - disable FedCM which causes AbortError in newer Chrome
          use_fedcm_for_prompt: false,
          auto_select: false, // Prevent auto-prompt race conditions
        });
        isInitialized.current = true;
        
        if (googleButtonRef.current) {
          try {
            (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: '400',
            });
          } catch (e) {
            console.error('Failed to render button after initialize:', e);
          }
        }
      }
    };

    // If script already loaded
    if (typeof window !== 'undefined' && (window as any).google) {
      initializeGoogle();
    } else {
      // Wait for script to load (added in layout.tsx)
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).google) {
          initializeGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleCredentialResponse]);

  // Render Google's native hidden button as a reliable fallback
  const renderGoogleButton = useCallback((container: HTMLDivElement | null) => {
    googleButtonRef.current = container;
    if (container && isInitialized.current && typeof window !== 'undefined' && (window as any).google) {
      try {
        (window as any).google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: '400',
        });
      } catch (e) {
        console.error('Failed to render button in callback:', e);
      }
    }
  }, []);

  const signInWithGoogle = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      // Try to click Google's rendered button (most reliable approach)
      if (googleButtonRef.current) {
        const iframe = googleButtonRef.current.querySelector('iframe');
        const btn = googleButtonRef.current.querySelector('div[role="button"]') as HTMLElement;
        if (btn) {
          btn.click();
          return;
        }
      }
      // Fallback to prompt()
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap not available, reason:', notification.getNotDisplayedReason?.() || notification.getSkippedReason?.());
          // If prompt fails, try opening Google's OAuth consent screen directly
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (clientId) {
            const redirectUri = window.location.origin;
            const scope = 'openid email profile';
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;
            // Open in popup window
            const popup = window.open(authUrl, 'google-auth', 'width=500,height=600,menubar=no,toolbar=no');
            if (!popup) {
              console.error('Popup blocked. Please allow popups for this site.');
            }
          }
        }
      });
    }
  };

  return { signInWithGoogle, isLoading, renderGoogleButton };
}
