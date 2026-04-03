"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { RiEyeOffLine, RiEyeLine, RiTeamFill, RiMacbookLine, RiSmartphoneLine, RiArrowLeftLine } from '@remixicon/react';

export default function UnifiedSignIn() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // States
  const [step, setStep] = useState<'choose' | 'login' | 'register'>('choose');
  const [intendedRole, setIntendedRole] = useState<'admin' | 'operator'>('operator');
  const [isTablet, setIsTablet] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Hydrate tablet detector
  useEffect(() => {
    const checkIsTablet = () => window.innerWidth <= 1024;
    setIsTablet(checkIsTablet());
    window.addEventListener('resize', checkIsTablet);
    return () => window.removeEventListener('resize', checkIsTablet);
  }, []);

  const handleSelectRole = (role: 'admin' | 'operator') => {
    setIntendedRole(role);
    document.cookie = `intended_role=${role}; path=/; max-age=3600`;
    setStep('login'); 
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/auth/login', { username, password });
      return data;
    },
    onSuccess: (data) => {
    
      setAuth(data.accessToken, data.user);
      document.cookie = `active_role=${intendedRole}; path=/; max-age=86400`; 
      
      if (intendedRole === 'admin') router.push('/');
      else router.push('/app/dashboard');
    },
    onError: () => {
      alert('Login Gagal. Pastikan username dan password benar.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/auth/register', { username, password });
      return data;
    },
    onSuccess: () => {
      alert('Registrasi Berhasil! Silakan Login.');
      setStep('login');
      setPassword('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Registrasi Gagal.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'login') loginMutation.mutate();
    if (step === 'register') registerMutation.mutate();
  };

  // === RENDER: CHOOSE ROLE STEP ===
  if (step === 'choose') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white touch-manipulation">
        <h1 className="text-3xl font-extrabold mb-3 tracking-wide text-white">Sistem Quality Control</h1>
        <p className="text-slate-400 mb-12 text-center max-w-md font-medium">Buka antarmuka apa sebelum Anda SignIn?</p>
        
        <div className={`grid gap-6 w-full max-w-3xl ${isTablet ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <button 
            onClick={() => handleSelectRole('admin')}
            className="group flex flex-col items-center justify-center p-10 bg-[#1e293b] border border-slate-700 rounded-3xl transition-all duration-300 hover:border-blue-500 hover:bg-[#1e293b]/80 shadow-lg"
          >
            <div className="mb-6 relative">
               <div className="absolute inset-0 bg-blue-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
               <RiMacbookLine size={64} className="text-slate-300 group-hover:text-blue-400 transition-colors drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Mode Admin</h2>
            <p className="text-sm text-slate-400 text-center font-medium">Layar PC, Chart Analytics, Data</p>
          </button>
  
          <button 
            onClick={() => handleSelectRole('operator')}
            className={`relative group flex flex-col items-center justify-center p-10 bg-[#1e293b] border rounded-3xl transition-all duration-300 shadow-lg ${isTablet ? 'border-orange-500/50 shadow-orange-500/10' : 'border-slate-700 hover:border-orange-500 hover:bg-[#1e293b]/80'}`}
          >
            {isTablet && (
              <div className="absolute -top-3 inset-x-0 flex justify-center">
                 <span className="bg-orange-500 text-white text-[11px] px-3 py-1 font-bold rounded-full uppercase tracking-wider shadow-sm">Saran Tablet</span>
              </div>
            )}
            <div className="mb-6 relative">
               <div className="absolute inset-0 bg-orange-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
               <RiSmartphoneLine size={64} className="text-slate-300 group-hover:text-orange-400 transition-colors drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Mode Operator</h2>
            <p className="text-sm text-slate-400 text-center font-medium">Tombol Besar, QC Patrol Khusus Tablet</p>
          </button>
        </div>
      </div>
    );
  }

  // === RENDER: LOGIN / REGISTER STEP ===
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#111827]">
      {/* FORM SECTION */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 py-12 relative overflow-y-auto min-h-screen">
        
        {/* Back Button */}
        <button 
          onClick={() => setStep('choose')}
          className="absolute top-8 left-8 text-sm text-gray-500 font-medium hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <RiArrowLeftLine size={18} /> Ganti Peran ({intendedRole})
        </button>

        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-[32px] font-bold text-gray-900 mb-2">
            {step === 'login' ? `Sign In (${intendedRole})` : "Sign Up"}
          </h1>
          <p className="text-sm text-gray-500 mb-8 font-medium">
            {step === 'login' ? "Enter your email and password to sign in!" : "Register your new account to proceed!"}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email/Username <span className="text-red-500">*</span></label>
              <input 
                className="w-full text-gray-900 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow placeholder:text-gray-400"
                placeholder={step === 'login' ? "info@gmail.com" : "Choose username"}
                value={username} onChange={e => setUsername(e.target.value)} required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full text-gray-900 bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow placeholder:text-gray-400"
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <RiEyeLine size={20} /> : <RiEyeOffLine size={20} />}
                </button>
              </div>
            </div>

            {step === 'login' && (
              <div className="flex items-center justify-between text-sm py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                  <span className="text-gray-700 font-medium group-hover:text-gray-900">Keep me logged in</span>
                </label>
                <button type="button" className="text-blue-600 font-bold hover:underline">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={loginMutation.isPending || registerMutation.isPending} className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl py-3.5 font-bold text-sm transition-colors shadow-lg shadow-indigo-500/30 flex justify-center items-center mt-2">
              {(loginMutation.isPending || registerMutation.isPending) ? <span className="animate-spin border-4 border-white/20 border-t-white h-5 w-5 rounded-full"/> : (step === 'login' ? "Sign in" : "Sign Up")}
            </button>
          </form>

          <p className="mt-8 text-sm text-gray-600">
            {step === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => { setStep(step === 'login' ? 'register' : 'login'); setPassword(''); }} className="text-[#4f46e5] font-bold hover:underline">
              {step === 'login' ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
      
      {/* BRANDING SECTION */}
      <div className={`hidden md:flex w-1/2 flex-col justify-center items-center relative overflow-hidden text-center p-12 lg:p-24 border-l ${intendedRole === 'operator' ? 'bg-[#0f172a] border-orange-500/20' : 'bg-[#111c43] border-[#273359]'}`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
             <div className={`${intendedRole === 'operator' ? 'bg-[#FF8C00]' : 'bg-[#4f46e5]'} p-3 rounded-2xl shadow-xl`}>
               <RiTeamFill size={36} className="text-white bg-white/20 rounded-full p-1" />
             </div>
             <h1 className="text-4xl lg:text-5xl font-black text-white tracking-widest drop-shadow-md font-sans">QC-PANDAWARA</h1>
          </div>
          <p className="text-gray-400 text-sm lg:text-base font-medium max-w-sm mt-2 leading-relaxed">
             Sistem Quality Control berbasis digitalisasi <br/> <strong className="text-white mt-1 uppercase tracking-wider">({intendedRole} Access)</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
