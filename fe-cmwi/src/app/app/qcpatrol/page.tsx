"use client";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function QcPatrolList() {
  const router = useRouter();
  const lists = ['Dies Assurance', 'Melting', 'Casting', 'Machining', 'Painting', 'Shipment'];

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-sans w-full flex flex-col items-center">
      
      {/* Main Header Container (Sticky) */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-lg sm:text-lg font-bold text-slate-800">QC Patrol Department</h1>
        </div>
      </div>

      <div className="w-full max-w-3xl px-4 sm:px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map(item => {
            const isTargeted = item === 'Painting' || item === 'Machining';
            
            return (
              <button
                key={item}
                onClick={() => {
                  if (item === 'Painting') router.push('/app/qcpatrol/painting');
                  if (item === 'Machining') router.push('/app/qcpatrol/machining');
                }}
                className={`
                  w-full py-5 px-6 rounded-2xl text-base font-extrabold text-left transition-all active:scale-[0.98] shadow-sm flex items-center justify-between border
                  ${isTargeted 
                    ? 'bg-[#3b66f5] text-white border-transparent shadow-md hover:bg-[#2b51cc]' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <span>{item}</span>
              </button>
            )
          })}
        </div>
      </div>
    
    </div>
  );
}
