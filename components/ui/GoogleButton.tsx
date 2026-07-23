"use client";

import React, { useCallback } from "react";

// Simple local mock of useLanguage for compile safety in the lightweight Consultant Portal
const useLanguage = () => {
  return {
    t: {
      login: {
        continueWithGoogle: "Continue with Google"
      }
    },
    interpolate: (str: string) => str || "Continue with Google"
  };
};

interface GoogleButtonProps {
  onClick?: () => void;
  text?: string;
  isLoading?: boolean;
  renderGoogleButton?: (container: HTMLDivElement | null) => void;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, text, isLoading, renderGoogleButton }) => {
  const { t, interpolate } = useLanguage();

  const hiddenRef = useCallback((node: HTMLDivElement | null) => {
    if (renderGoogleButton) {
      renderGoogleButton(node);
    }
  }, [renderGoogleButton]);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={isLoading}
        type="button"
        className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform duration-200">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
            />
          </svg>
        )}
        <span className="font-poppins text-sm md:text-base text-gray-700">
          {text || interpolate((t.login as any).continueWithGoogle || "Continue with Google")}
        </span>
      </button>
      {/* Hidden Google native button for reliable OAuth popup */}
      <div 
        ref={hiddenRef} 
        className="absolute opacity-0 pointer-events-none overflow-hidden"
        style={{ width: 0, height: 0 }}
      />
    </div>
  );
};
