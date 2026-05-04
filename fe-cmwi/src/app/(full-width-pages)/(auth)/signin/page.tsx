"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { RiEyeOffLine, RiEyeLine, RiTeamFill, RiMacbookLine, RiSmartphoneLine, RiArrowLeftLine, RiUser3Line, RiLockPasswordLine } from '@remixicon/react';

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
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

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
    onSuccess: async (data) => {
      const roles = data.user.roles || [];
      const isOperator = roles.includes('operator');

      // Validasi Akses
      if (intendedRole === 'operator' && !isOperator) {
        alert('Akses Ditolak: Mode ini hanya untuk Operator.');
        await apiClient.post('/auth/logout').catch(() => {});
        return;
      }

      if (intendedRole === 'admin' && isOperator && roles.length === 1) {
        alert('Akses Ditolak: Operator tidak dapat masuk ke Mode Admin.');
        await apiClient.post('/auth/logout').catch(() => {});
        return;
      }
    
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
      const finalRole = intendedRole === 'operator' ? 'operator' : role;
      const payload = { username, password, name, roles: finalRole ? [finalRole] : [] };
      const { data } = await apiClient.post('/auth/register', payload);
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

  // === RENDER ===
  return (
    <div className="flex w-full h-full text-gray-800 font-sans selection:bg-[#4f46e5] selection:text-white">
      {/* LEFT: Branding Panel (Hidden di mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-[#111528] flex-col items-center justify-center relative p-12 text-center shadow-2xl z-10 transition-colors duration-500 overflow-hidden">
        {/* Custom Grid Background Pattern via inline style so it persists without tailwind custom config */}
        <div 
          className="absolute inset-0 opacity-100 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        {/* Glow Effect */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-colors duration-700 ${intendedRole === 'operator' && step !== 'choose' ? 'bg-orange-600/20' : 'bg-blue-600/20'}`} />

        <div className="relative z-10 animate-[fadeIn_0.5s_ease-out]">
          {/* Logo Mockup */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`w-14 h-14 ${intendedRole === 'operator' && step !== 'choose' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-[#4f46e5] shadow-[#4f46e5]/30'} rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500`}>
              <RiTeamFill size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-wide">QC-PANDAWARA</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Sistem Quality Control berbasis digitalisasi
            {step !== 'choose' && <span className="block mt-1 uppercase text-white font-bold tracking-widest text-sm opacity-80">({intendedRole} Access)</span>}
          </p>

          <div className="mt-16 opacity-50">
            <div className="flex gap-2 justify-center mb-2">
              <div className="w-16 h-2 bg-gray-600 rounded-full" />
              <div className={`w-8 h-2 ${intendedRole === 'operator' && step !== 'choose' ? 'bg-orange-500' : 'bg-blue-500'} rounded-full transition-colors`} />
            </div>
            <div className="flex gap-2 justify-center">
              <div className="w-8 h-2 bg-gray-600 rounded-full" />
              <div className="w-12 h-2 bg-gray-600 rounded-full" />
              <div className="w-16 h-2 bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Interactive Panel */}
      <div className="w-full md:w-1/2 lg:w-7/12 bg-white dark:bg-[#121212] h-full flex flex-col justify-center relative overflow-y-auto min-h-screen lg:min-h-0">
        
        {step === 'choose' ? (
          <div className="w-full max-w-xl mx-auto px-8 sm:px-12 animate-[fadeIn_0.4s_ease-out]">
            {/* Header Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-10">
              <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center">
                <RiTeamFill size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">QC-PANDAWARA</h1>
            </div>

            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sistem Quality Control</h2>
              <p className="text-gray-500 dark:text-gray-400">Pilih antarmuka masuk sebelum Anda Sign In.</p>
            </div>

            <div className={`grid gap-6 ${isTablet ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
              {/* Kartu Mode Admin */}
              <button 
                onClick={() => handleSelectRole('admin')}
                className="group relative flex flex-col items-center p-8 rounded-2xl border-2 border-gray-100 dark:border-white/10 dark:bg-white/5 bg-white hover:border-[#4f46e5] hover:shadow-xl hover:shadow-[#4f46e5]/10 dark:hover:border-[#4f46e5] dark:hover:bg-[#4f46e5]/5 transition-all duration-300 text-left w-full h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-black/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-[#4f46e5]/20 transition-all duration-300">
                  <RiMacbookLine size={36} className="text-gray-400 dark:text-gray-500 group-hover:text-[#4f46e5]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mode Admin</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Layar PC, Chart Analytics, Master Data</p>
              </button>

              {/* Kartu Mode Operator */}
              <button 
                onClick={() => handleSelectRole('operator')}
                className="group relative flex flex-col items-center p-8 rounded-2xl border-2 border-gray-100 dark:border-white/10 dark:bg-white/5 bg-white hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 dark:hover:border-orange-500 dark:hover:bg-orange-500/5 transition-all duration-300 text-left w-full h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-black/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/20 transition-all duration-300">
                  <RiSmartphoneLine size={36} className="text-gray-400 dark:text-gray-500 group-hover:text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mode Operator</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Tombol Besar, QC Patrol Khusus Tablet</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto px-8 animate-[slideUp_0.4s_ease-out]">
            {/* Tombol Kembali */}
            <button 
              onClick={() => setStep('choose')}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group"
            >
              <RiArrowLeftLine size={18} className="group-hover:-translate-x-1 transition-transform" />
              Ganti Peran (<span className="capitalize">{intendedRole}</span>)
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step === 'login' ? "Sign In" : "Sign Up"} <span className={intendedRole === 'operator' ? 'text-orange-500' : 'text-[#4f46e5]'}>({intendedRole})</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {step === 'login' ? "Masukkan email dan password untuk masuk." : "Daftarkan akun baru untuk melanjutkan."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Name (Only for Register) */}
              {step === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <RiUser3Line size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Masukkan nama lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 focus:ring-4 outline-none transition-all bg-gray-50 dark:text-white ${intendedRole === 'operator' ? 'focus:border-orange-500 focus:ring-orange-500/10' : 'focus:border-[#4f46e5] focus:ring-[#4f46e5]/10'} focus:bg-white dark:focus:bg-[#1a1a1a]`}
                      required={step === 'register'}
                    />
                  </div>
                </div>
              )}

              {/* Input Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">Email/Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <RiUser3Line size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder={step === 'login' ? "info@gmail.com" : "Pilih username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 focus:ring-4 outline-none transition-all bg-gray-50 dark:text-white ${intendedRole === 'operator' ? 'focus:border-orange-500 focus:ring-orange-500/10' : 'focus:border-[#4f46e5] focus:ring-[#4f46e5]/10'} focus:bg-white dark:focus:bg-[#1a1a1a]`}
                    required 
                  />
                </div>
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <RiLockPasswordLine size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 focus:ring-4 outline-none transition-all bg-gray-50 dark:text-white ${intendedRole === 'operator' ? 'focus:border-orange-500 focus:ring-orange-500/10' : 'focus:border-[#4f46e5] focus:ring-[#4f46e5]/10'} focus:bg-white dark:focus:bg-[#1a1a1a]`}
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    {showPassword ? <RiEyeLine size={20} /> : <RiEyeOffLine size={20} />}
                  </button>
                </div>
              </div>

              {/* Input Role (Only for Register and Admin) */}
              {step === 'register' && intendedRole !== 'operator' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">Role <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 focus:ring-4 outline-none transition-all bg-gray-50 dark:text-white appearance-none focus:border-[#4f46e5] focus:ring-[#4f46e5]/10 focus:bg-white dark:focus:bg-[#1a1a1a]`}
                      required={step === 'register'}
                    >
                      <option value="" disabled>Pilih Role</option>
                      <option value="gl">Group Leader (gl)</option>
                      <option value="spv">Supervisor (spv)</option>
                      <option value="amg">Assistant Manager (amg)</option>
                      <option value="req">Requester (req)</option>
                      <option value="re_mg">Request Manager (req_mg)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              {step === 'login' && (
                <div className="flex items-center justify-between text-sm py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className={`w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2 ${intendedRole === 'operator' ? 'text-orange-500 focus:ring-orange-500' : 'text-[#4f46e5] focus:ring-[#4f46e5]'}`} />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Keep me logged in</span>
                  </label>
                  <a href="#" className={`font-semibold transition-colors ${intendedRole === 'operator' ? 'text-orange-500 hover:text-orange-600' : 'text-[#4f46e5] hover:text-[#4338ca]'}`}>Forgot password?</a>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loginMutation.isPending || registerMutation.isPending}
                className={`w-full py-3.5 px-4 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center ${
                  intendedRole === 'operator' 
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 hover:shadow-orange-500/40' 
                    : 'bg-[#4f46e5] hover:bg-[#4338ca] shadow-[#4f46e5]/30 hover:shadow-[#4f46e5]/40'
                }`}
              >
                {(loginMutation.isPending || registerMutation.isPending) ? (
                  <span className="animate-spin border-4 border-white/20 border-t-white h-5 w-5 rounded-full"/>
                ) : (
                  step === 'login' ? "Sign In" : "Sign Up"
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {step === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => { setStep(step === 'login' ? 'register' : 'login'); setPassword(''); }} 
                className={`font-semibold hover:underline ${intendedRole === 'operator' ? 'text-orange-500' : 'text-[#4f46e5]'}`}
              >
                {step === 'login' ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
