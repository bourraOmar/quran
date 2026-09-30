"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Reciter {
  id: number;
  reciter_name: string;
  reciter_name_eng: string;
  style: string;
}

export default function RecitersGrid({ initialReciters }: { initialReciters: Reciter[] }) {
  const [search, setSearch] = useState("");

  const filteredReciters = initialReciters.filter(r => 
    r.reciter_name.toLowerCase().includes(search.toLowerCase()) ||
    r.reciter_name_eng.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-8 relative">
      
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12 relative">
        <input 
          type="text"
          placeholder="ابحث عن اسم القارئ (عربي / English)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] focus:border-[#6b8ba7] rounded-full px-6 py-4 pr-12 text-lg text-[#1e354d] dark:text-[#f8fafc] placeholder-[#5a7b9c] outline-none shadow-sm transition-all focus:shadow-md"
        />
        <svg className="w-6 h-6 text-[#5a7b9c] dark:text-[#94a3b8] absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 text-center">
        {filteredReciters.length > 0 ? (
          filteredReciters.map((reciter) => (
            <Link 
              key={reciter.id} 
              href={`/reciter/${reciter.id}`} 
              className="group bg-white dark:bg-[#1e293b] hover:bg-[#e8edf2] dark:bg-[#1e293b] p-5 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg border border-transparent hover:border-[#6b8ba7]/20 flex flex-col items-center gap-4 relative"
            >
              {/* Circular Avatar */}
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] shadow-inner flex items-center justify-center relative overflow-hidden group-hover:bg-[#d8e2eb] dark:bg-[#334155] transition-colors duration-300">
                <svg className="w-16 h-16 text-[#4a6b8c] dark:text-[#94a3b8] opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>

              {/* Text Info */}
              <div className="w-full">
                <h3 className="font-bold text-[#1e354d] dark:text-[#f8fafc] text-base truncate w-full group-hover:text-[#4a6b8c] dark:text-[#94a3b8] transition-colors">{reciter.reciter_name}</h3>
                <p className="text-xs text-[#5a7b9c] dark:text-[#94a3b8] mt-1 truncate w-full">{reciter.style}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-[#5a7b9c] dark:text-[#94a3b8] text-xl font-medium">
            لم يتم العثور على قارئ بهذا الاسم
          </div>
        )}
      </div>

    </div>
  );
}
