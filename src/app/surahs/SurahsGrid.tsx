"use client";

import { useState } from "react";
import Link from "next/link";

interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

export default function SurahsGrid({ initialSurahs }: { initialSurahs: Chapter[] }) {
  const [search, setSearch] = useState("");

  const filteredSurahs = initialSurahs.filter(surah => 
    surah.name_arabic.includes(search) || 
    surah.name_simple.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12 relative">
        <input 
          type="text"
          placeholder="ابحث عن اسم السورة (عربي / English)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] focus:border-[#6b8ba7] rounded-full px-6 py-4 pr-12 text-lg text-[#1e354d] dark:text-[#f8fafc] placeholder-[#5a7b9c] dark:placeholder-[#94a3b8] outline-none shadow-sm transition-all focus:shadow-md"
        />
        <svg className="w-6 h-6 text-[#5a7b9c] dark:text-[#94a3b8] absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
        {filteredSurahs.length > 0 ? (
          filteredSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-[#e2e8f0] dark:border-[#334155] hover:border-[#6b8ba7] dark:hover:border-[#6b8ba7] hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="text-left" dir="ltr">
                <span className="block font-bold text-[#1e354d] dark:text-[#f8fafc] group-hover:text-[#6b8ba7] transition-colors">{surah.id}. {surah.name_simple}</span>
                <span className="block text-xs text-[#5a7b9c] dark:text-[#94a3b8] uppercase mt-1">{surah.revelation_place === "makkah" ? "مكية" : "مدنية"}</span>
              </div>
              <div className="text-right">
                <span className="block font-serif text-xl font-bold text-[#6b8ba7] dark:text-[#94a3b8]">{surah.name_arabic}</span>
                <span className="block text-xs text-[#5a7b9c] dark:text-[#94a3b8] mt-1">{surah.verses_count} آية</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-[#5a7b9c] dark:text-[#94a3b8] text-xl font-medium">
            لم يتم العثور على سورة بهذا الاسم
          </div>
        )}
      </div>
    </div>
  );
}
