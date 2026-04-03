"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { 
  FileText, 
  Disc, 
  ClipboardList, 
  FileBox, 
  CalendarCheck, 
  ListChecks,
  User,
  LogOut
} from 'lucide-react';
import { apiClient } from '@/lib/axios';

export default function OperatorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [greetingTimestamp, setGreetingTimestamp] = useState('');

  // Example real-time effect if needed
  useEffect(() => {
    setGreetingTimestamp(new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    }
    useAuthStore.getState().logout();
    router.push('/signin');
  };

  const menus = [
    { title: 'Dokumen', icon: <FileText size={42} strokeWidth={1.5} />, path: '/dokumen', active: false },
    { title: 'Wheel Type', icon: <Disc size={42} strokeWidth={1.5} />, path: '/wheel-type', active: false },
    { title: 'QC Patrol', icon: <ClipboardList size={42} strokeWidth={1.5} />, path: '/app/qcpatrol', active: true },
    { title: 'QCR', icon: <FileBox size={42} strokeWidth={1.5} />, path: '/qcr', active: false },
    { title: 'Kalibrasi', icon: <CalendarCheck size={42} strokeWidth={1.5} />, path: '/kalibrasi', active: false },
    { title: 'Change List', icon: <ListChecks size={42} strokeWidth={1.5} />, path: '/change-list', active: false },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#f8f9fc] text-slate-800 pt-10 px-4 pb-20 font-sans">
      
      {/* Container Utama agar responsif memanjang ke bawah di mobile/tablet */}
      <div className="w-full max-w-[480px]">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm mb-6 w-full border border-slate-100">
           {/* Avatar Area */}
           <div className="w-16 h-16 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
             {/* Jika ada foto, pakai tag img. Ini fallback icon */}
             <User size={32} className="text-blue-500" />
           </div>
           
           {/* Info Area */}
           <div className="flex flex-col">
             <h2 className="text-xl font-extrabold text-[#1e293b] leading-tight tracking-tight">Mustafic Fahruri</h2>
             <span className="text-sm font-bold text-slate-600 mt-1">12121212</span>
             <span className="text-xs text-slate-400 font-bold italic mt-1">Quality Assurance</span>
             <span className="text-xs text-slate-400 font-medium tracking-wide">fahruri@cmwi.co.id</span>
           </div>
        </div>

        {/* Menu Grid (2 Kolom) */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {menus.map((menu, idx) => (
             <button
                key={idx}
                onClick={() => router.push(menu.path)}
                className={`
                  flex flex-col items-center justify-center p-8 rounded-[1.5rem] outline-none transition-all duration-200 aspect-[4/3] gap-3 border shadow-sm
                  ${menu.active 
                     ? 'bg-[#3b66f5] text-white border-transparent shadow-md hover:bg-[#2b51cc] active:scale-[0.98]' 
                     : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 active:bg-slate-100 active:scale-[0.98]'}
                `}
             >
                <div className={`${menu.active ? 'text-white' : 'text-slate-600'}`}>
                  {menu.icon}
                </div>
                <span className="text-[15px] font-extrabold tracking-wide">{menu.title}</span>
             </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button 
            onClick={handleLogout}
            className="w-full h-16 flex items-center justify-center gap-3 bg-[#fff1f2] text-[#f43f5e] rounded-[1.25rem] hover:bg-[#ffe4e6] transition-all duration-300 active:scale-[0.98] font-extrabold text-base tracking-wide"
          >
            <LogOut size={22} strokeWidth={2} className="rotate-180" />
            Keluar Aplikasi
          </button>
        </div>

      </div>

    </div>
  );
}
