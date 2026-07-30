'use client';
import { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function TwoFactorSetup() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/api/auth/mfa/setup/`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to initialize MFA setup');
      setQrCodeUrl(data.qr_code_base64);
      setSecret(data.secret);
    } catch (err: any) {
      setError(err.message || 'An error occurred during MFA setup.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verifyCode) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/api/auth/mfa/setup/verify/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ code: verifyCode })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid verification code');
      
      setIsSetupComplete(true);
      setQrCodeUrl(null);
    } catch (err: any) {
      setError(err.message || 'Invalid code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSetupComplete) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="text-green-700 font-medium">
          Two-Factor Authentication is successfully configured for your account.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-gray-50/50">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-blue-500" />
          Two-Factor Authentication (2FA)
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Enhance your account security by requiring a verification code from your authenticator app (e.g. Google Authenticator, Authy) when you sign in.
        </p>
      </div>
      
      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {!qrCodeUrl ? (
          <div className="flex justify-center">
            <button 
                onClick={startSetup} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Set Up 2FA'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center">
            <p className="text-sm text-gray-600 text-center">
              Scan this QR code with your authenticator app, then enter the 6-digit code below to verify.
            </p>
            <div className="bg-white p-4 rounded-lg border inline-block shadow-sm">
              <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
            </div>
            {secret && (
              <p className="text-xs text-gray-400 font-mono">Setup Key: {secret}</p>
            )}
            <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
              <input 
                type="text" 
                placeholder="000000" 
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                  onClick={verifySetup} 
                  disabled={isLoading || verifyCode.length < 6}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex-shrink-0"
              >
                Verify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
