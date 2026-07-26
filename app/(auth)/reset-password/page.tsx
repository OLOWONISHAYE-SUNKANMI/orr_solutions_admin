"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/app/services/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!uid || !token) {
      setError("Invalid or missing reset token.");
    }
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!uid || !token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await authAPI.resetPassword(uid, token, password);
      setMessage("Password has been reset successfully!");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B151F]">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-white">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.svg" alt="ORR solutions" className="w-20 h-20" />
          </div>
          
          <h2 className="text-2xl font-extrabold mb-2 text-center">
            Reset Password
          </h2>
          <p className="text-sm text-gray-400 mb-8 text-center">
            Enter your new password below.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                {message}
              </div>
            )}
            
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-500 px-4 py-3 focus:outline-none focus:border-[#61FD51] bg-transparent text-white transition-colors"
              required
            />
            
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-b border-gray-500 px-4 py-3 focus:outline-none focus:border-[#61FD51] bg-transparent text-white transition-colors"
              required
            />
            
            <button
              type="submit"
              disabled={loading || !uid || !token}
              className="w-full bg-[#13BE77] hover:bg-[#10a165] text-white py-4 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-[#61FD51] hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
