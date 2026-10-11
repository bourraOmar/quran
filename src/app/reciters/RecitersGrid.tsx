"use client";

import { useState } from "react";
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
    <div className="w-full">
      {/* Search Bar matching Dua/Dhikr theme */}
      <div className="max-w-2xl mx-auto mb-10 relative">
        <input 
          type="text"
          placeholder="ابحث عن اسم القارئ (عبد الباسط، المعيقلي، العفاسي...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white pl-10 pr-12 py-4 rounded-3xl text-sm border border-transparent hover:border-[#4a6b8c]/30 focus:border-[#0f8e5d] focus:outline-none shadow-sm transition-all placeholder:text-[#4a6b8c]/60 dark:placeholder:text-[#8ba7c0]/60"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6b8c] dark:text-[#8ba7c0] pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 text-center">
        {filteredReciters.length > 0 ? (
          filteredReciters.map((reciter) => (
            <Link 
              key={reciter.id} 
              href={`/reciter/${reciter.id}`} 
              className="group bg-white dark:bg-[#1e293b] p-5 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-[#0f8e5d]/30 active:scale-95 flex flex-col items-center gap-3.5 relative"
            >
              {/* Circular Avatar */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 text-[#0f8e5d] dark:text-[#4ade80] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-inner">
                <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>

              {/* Text Info */}
              <div className="w-full">
                <h3 className="font-bold text-[#1e354d] dark:text-white text-sm md:text-base truncate w-full group-hover:text-[#0f8e5d] dark:group-hover:text-[#4ade80] transition-colors">
                  {reciter.reciter_name}
                </h3>
                <span className="inline-block text-[11px] text-[#0f8e5d] dark:text-[#4ade80] font-semibold bg-[#0f8e5d]/10 px-2.5 py-0.5 rounded-full mt-1.5 truncate max-w-full">
                  {reciter.style || "حفص عن عاصم"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#1e293b] rounded-3xl p-8 shadow-sm">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="font-bold text-lg text-[#1e354d] dark:text-white">لم يتم العثور على قارئ بهذا الاسم</p>
            <p className="text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-1">جرب البحث بكلمة أخرى</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 px-5 py-2 bg-[#0f8e5d] text-white rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform"
            >
              عرض جميع القراء
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
