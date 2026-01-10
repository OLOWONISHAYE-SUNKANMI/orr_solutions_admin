'use client';
import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';

export default function AuthDebugger() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const auth = AuthService.getInstance();

  useEffect(() => {
    updateAuthInfo();
  }, []);

  const updateAuthInfo = () => {
    setAuthInfo({
      isAuthenticated: auth.isAuthenticated(),
      canEdit: auth.canEdit(),
      user: auth.getUser(),
      token: auth.getToken() ? 'Present' : 'Missing',
    });
  };

  const testLogin = async () => {
    try {
      const result = await auth.login('editor', 'editor123');
      setTestResults((prev: any) => ({ ...prev, login: 'Success' }));
      updateAuthInfo();
    } catch (error) {
      setTestResults((prev: any) => ({ ...prev, login: `Failed: ${error}` }));
    }
  };

  const testApiCall = async () => {
    try {
      const response = await auth.makeAuthenticatedRequest(
        'https://orr-backend-web-latest.onrender.com/admin-portal/v1/cms/business-system-section/',
        { method: 'GET' }
      );
      
      if (response.ok) {
        setTestResults((prev: any) => ({ ...prev, api: 'Success' }));
      } else {
        setTestResults((prev: any) => ({ ...prev, api: `Failed: ${response.status}` }));
      }
    } catch (error) {
      setTestResults((prev: any) => ({ ...prev, api: `Error: ${error}` }));
    }
  };

  const logout = () => {
    auth.logout();
    updateAuthInfo();
    setTestResults({});
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debugger</h3>
      
      <div className="mb-2">
        <strong>Status:</strong>
        <div>Authenticated: {authInfo?.isAuthenticated ? '✅' : '❌'}</div>
        <div>Can Edit: {authInfo?.canEdit ? '✅' : '❌'}</div>
        <div>Token: {authInfo?.token}</div>
        <div>User: {authInfo?.user?.username || 'None'}</div>
        <div>Role: {authInfo?.user?.role || 'None'}</div>
      </div>

      <div className="mb-2">
        <strong>Tests:</strong>
        <div>Login: {testResults.login || 'Not tested'}</div>
        <div>API Call: {testResults.api || 'Not tested'}</div>
      </div>

      <div className="flex gap-1 flex-wrap">
        <button 
          onClick={testLogin}
          className="bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Test Login
        </button>
        <button 
          onClick={testApiCall}
          className="bg-green-600 px-2 py-1 rounded text-xs"
        >
          Test API
        </button>
        <button 
          onClick={logout}
          className="bg-red-600 px-2 py-1 rounded text-xs"
        >
          Logout
        </button>
        <button 
          onClick={updateAuthInfo}
          className="bg-gray-600 px-2 py-1 rounded text-xs"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}