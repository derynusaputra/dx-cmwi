"use client";
import { useRouter } from 'next/navigation';
import { RiArrowLeftLine } from '@remixicon/react';

export default function MachiningQCForm() {
  const router = useRouter();

  return (
    <div className="bg-[#0f172a] min-h-screen p-4 flex flex-col items-center">
      {/* Target Orange Header Component here */}
      <div className="w-full max-w-md bg-[#FF8C00] rounded-full px-6 py-4 flex items-center gap-4 shadow-xl mb-6 mt-4">
        <button onClick={() => router.back()} className="text-gray-900 border-none outline-none">
          <RiArrowLeftLine size={28} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Machining</h1>
      </div>

      {/* Item Check Label */}
      <div className="bg-gray-200 text-gray-800 rounded-full px-8 py-2 mb-6 font-medium italic text-sm">
        Item check QC
      </div>

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Main large white card */}
        <div className="w-full aspect-square bg-white rounded-[32px] shadow-lg flex items-center justify-center flex-col p-8 text-center text-gray-900 border border-gray-200">
          <h2 className="text-3xl font-bold mb-4">Machining</h2>
          <p className="text-gray-500 italic text-sm">(Form checks digitaslisasi Machining akan dimuat di sini)</p>
          
          <div className="mt-8 flex gap-4 w-full">
            <button className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-transform">NG</button>
            <button className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl active:scale-95 transition-transform">OK</button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-white mt-8 px-4 text-sm font-medium leading-relaxed">
          Key point : hasil check<br/>report dengan<br/>
          <span className="border-b-2 border-dashed border-red-500">digitalisasi</span>
        </p>
      </div>
    </div>
  );
}
