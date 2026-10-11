"use client";

import { useState, useMemo } from "react";
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
  const [filterType, setFilterType] = useState<"all" | "makkah" | "madinah">("all");

  const filteredSurahs = useMemo(() => {
    return initialSurahs.filter((surah) => {
      const matchesSearch =
        surah.name_arabic.includes(search) ||
        surah.name_simple.toLowerCase().includes(search.toLowerCase()) ||
        surah.id.toString() === search.trim();

      const matchesType =
        filterType === "all" ||
        (filterType === "makkah" && surah.revelation_place === "makkah") ||
        (filterType === "madinah" && surah.revelation_place === "madinah");

      return matchesSearch && matchesType;
    });
  }, [initialSurahs, search, filterType]);

  const makkahCount = useMemo(() => initialSurahs.filter((s) => s.revelation_place === "makkah").length, [initialSurahs]);
  const madinahCount = useMemo(() => initialSurahs.filter((s) => s.revelation_place === "madinah").length, [initialSurahs]);

  return (
    <div className="w-full">
      {/* Search Bar matching Dua/Dhikr theme */}
      <div className="max-w-2xl mx-auto mb-6 relative">
        <input 
          type="text"
          placeholder="ابحث عن اسم السورة أو رقمها (الكهف، 18، Yasin)..."
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

      {/* Filter Chips matching Dua/Dhikr */}
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterType === "all"
              ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
              : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-transparent hover:border-[#4a6b8c]/30"
          }`}
        >
          الكل ({initialSurahs.length})
        </button>
        <button
          onClick={() => setFilterType("makkah")}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterType === "makkah"
              ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
              : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-transparent hover:border-[#4a6b8c]/30"
          }`}
        >
          🕋 مكية ({makkahCount})
        </button>
        <button
          onClick={() => setFilterType("madinah")}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterType === "madinah"
              ? "bg-[#0f8e5d] text-white shadow-md shadow-[#0f8e5d]/20"
              : "bg-white dark:bg-[#1e293b] text-[#4a6b8c] dark:text-[#8ba7c0] border border-transparent hover:border-[#4a6b8c]/30"
          }`}
        >
          🕌 مدنية ({madinahCount})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-right">
        {filteredSurahs.length > 0 ? (
          filteredSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="bg-white dark:bg-[#1e293b] rounded-3xl p-5 shadow-sm hover:shadow-md border border-transparent hover:border-[#0f8e5d]/30 active:scale-[0.98] transition-all group flex items-center justify-between"
            >
              {/* Right: Surah Badge & Arabic Name */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 text-[#0f8e5d] dark:text-[#4ade80] flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-[#0f8e5d] group-hover:text-white transition-colors">
                  {surah.id}
                </div>
                <div>
                  <span className="block text-xl font-bold text-[#1e354d] dark:text-white group-hover:text-[#0f8e5d] dark:group-hover:text-[#4ade80] transition-colors">
                    سورة {surah.name_arabic}
                  </span>
                  <span className="block text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                    {surah.verses_count} آية • {surah.revelation_place === "makkah" ? "مكية" : "مدنية"}
                  </span>
                </div>
              </div>

              {/* Left: English & Chevron */}
              <div className="text-left flex items-center gap-2" dir="ltr">
                <span className="text-xs font-semibold text-[#4a6b8c]/70 dark:text-[#8ba7c0]/70 hidden sm:block">
                  {surah.name_simple}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-[#0f8e5d] group-hover:-translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-[#1e293b] rounded-3xl p-8 shadow-sm">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="font-bold text-lg text-[#1e354d] dark:text-white">لم يتم العثور على سورة بهذا الاسم</p>
            <p className="text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-1">جرب البحث برقم السورة أو كتابة أحرف أخرى</p>
            <button
              onClick={() => {
                setSearch("");
                setFilterType("all");
              }}
              className="mt-4 px-5 py-2 bg-[#0f8e5d] text-white rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform"
            >
              عرض جميع السور
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
