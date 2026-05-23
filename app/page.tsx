"use client";
import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/hooks/auth";
import { authAPI } from "@/app/services/api";
import { useLanguageStore } from "@/store/languageStore";
import LanguageToggle from "@/app/components/ui/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function RootPage() {
  const { t } = useLanguageStore();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRevoked, setIsRevoked] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('revoked') === 'true') {
        setIsRevoked(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response: any = await authAPI.login(formData.email, formData.password);
      
      // Handle different response formats
      const data = response.data || response;
      const token = data.access || data.accessToken || data.access_token || response.accessToken;
      const user = data.user || response.user;

      if (token && user) {
        login(token, user);
        router.push("/dashboard/");
      } else {
        setError(response.message || t('auth.error_invalid_format'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('auth.error_login'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image + Text */}

    
      <div
        className="hidden md:flex flex-1 bg-cover m-3 rounded-lg bg-center relative text-white"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/depeqzb6z/image/upload/v1764168892/side-image_1_jwpnup.png')",
        }}
      >
        <div className='justify-between flex flex-row w-full'>
          <div className="justify-start flex items-start">
            <img 
              src="/images/logo.svg"
              alt="ORR Solutions"
              className="w-32 h-32 mt-5 ml-10" />
          </div>
        </div>


        <div className="absolute bottom-10 w-full px-6 text-start">
          <p className="text-[48px] font-poppins font-extrabold text-[32px] md:text-[48px] lg:text-[48px] xl:text-[40px] ml-5 mx-auto">
            <span className="text-[#86FF22] ">ORR Solutions</span>  <br />
           Listen. Solve. Optimise.
          </p>
        </div>
      </div>

        {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-16 py-12">
        <div className="max-w-3xl w-full">
          {/* Mobile logo + language toggle row */}
          <div className="flex items-center justify-between mb-8 md:justify-end md:mb-6">
            <img
              src="/images/logo.svg"
              alt="ORR solutions"
              className="w-12 h-12 md:hidden"
            />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
         

          <h2 className="text-2xl font-extrabold mb-2 md:text-start text-center text-[#FFFFFF]">
            {t('auth.welcome_back').split(' ').slice(0, -1).join(' ')} <span className="text-[#61FD51]">{t('auth.welcome_back').split(' ').slice(-1)[0]}</span>
          </h2>
          <p className="text-sm font-medium mb-10 text-[#FFFFFF]  md:text-start text-center">
            {t('auth.sign_in_desc')}
          </p>

          <form className="space-y-7" onSubmit={handleSubmit}>
            {isRevoked && (
              <div className="p-5 rounded-3xl border border-red-500/20 bg-red-500/10 text-red-200 animate-in fade-in slide-in-from-top-4 duration-500 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="font-black uppercase tracking-wider text-[10px] text-red-400">SESSION TERMINATED</span>
                </div>
                <h4 className="font-bold text-sm text-white">Administrative Access Revoked</h4>
                <p className="text-[12px] opacity-80 leading-relaxed">
                  Your administrative session has been instantly terminated by system administration. Please contact support if you believe this is an error.
                </p>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <input
              type="text"
              placeholder={t('auth.email')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border-b-1 border-gray-300 px-6 py-5 focus:outline-none text-white"
              // required
            />
          <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border-b-1 border-gray-300 px-6 py-5 focus:outline-none text-white bg-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />  }
              </button>

            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="inline-flex items-center text-sm text-white">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-[#61FD51] bg-transparent border-gray-300 rounded focus:ring-0 mr-2"
                />
                <span className="ml-2">{t('auth.remember_me')}</span>
              </label>

            
            </div>
            <button
              type="submit"
              className="w-full bg-[#13BE77] py-5 rounded-lg cursor-pointer mt-4 transition disabled:opacity-50"
            >
              {loading ? t('auth.signing_in') : t('auth.login')}
            </button>

          </form>
        
        </div>
      </div>

    </div>
  );
}
