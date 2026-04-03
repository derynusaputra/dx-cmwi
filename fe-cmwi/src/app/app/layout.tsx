import React from 'react';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0f172a] min-h-screen text-white touch-manipulation">
      <div className="max-w-xl mx-auto min-h-screen border-x border-[#1e293b] shadow-2xl bg-[#0f172a] pb-10">
        {children}
      </div>
    </div>
  );
}
