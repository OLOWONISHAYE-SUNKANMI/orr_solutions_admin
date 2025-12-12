"use client";
import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../lib/hooks/auth";
import { authAPI } from "../../services/api";

export default function Page() {
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response: any = await authAPI.login(formData.email, formData.password);
      if (response.success && response.data) {
        login(response.data.accessToken, response.data.user);
        router.push("/");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
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
        {/* <div className="absolute inset-0 bg-black/80"></div> */}
        {/* <div className="relative text-center px-6 flex  justify-center h-full py-12">
          <div className="flex justify-center">
            <img
              src="/images/logo.svg"
              alt="ORR Solutions"
              className="mx-auto mb-6 w-28 h-auto"
            />
          <p className="text-3xl font-extrabold md:text-xl  mx-auto mt-auto">
          ORR Solutions - Listen. 
          Solve. Optimise.
          </p>
          </div>
          
        </div> */}
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
          {/* Top right sign-in */}
           <div className="flex md:hidden flex-col items-center justify-center mb-8">
              <img
                src="/images/logo.svg"
                alt="ORR solutions"
                className="w-16 h-16 mb-4"
              />
            </div>
         

          <h2 className="text-2xl font-extrabold mb-2 md:text-start text-center text-[#FFFFFF]">
            Welcome <span className="text-[#61FD51]">Back</span>
          </h2>
          <p className="text-sm font-medium mb-10 text-[#FFFFFF]  md:text-start text-center">
            Sign in to your dashboard
          </p>

          <form className="space-y-7" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <input
              type="text"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border-b-1 border-gray-300 px-6 py-5 focus:outline-none text-white"
              // required
            />
          <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
                <span className="ml-2">Remember me</span>
              </label>

              <div className="hidden md:flex items-center">
                <Link
                  href="/forgot-password"
                  className="px-6 font-extrabold underline text-md text-[#61FD51] "
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#13BE77] py-5 rounded-lg cursor-pointer mt-4 transition disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Login"}
            </button>

                <div className="hidden md:flex items-end  justify-end mt-4 ">
                <Link
                  href="/register"
                  className="px-6 font-extrabold text-md text-[#FFFFFF] "
                >
                  New here? <span className="text-[#61FD51] underline">Register</span>
                </Link>
              </div>
          </form>
        
        </div>
      </div>

    </div>
  );
}
