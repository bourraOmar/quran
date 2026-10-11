/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useGlobalAudio } from "../../context/GlobalAudioContext";

interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

interface Reciter {
  id: number;
  reciter_id: number;
  reciter_name: string;
  style: string;
  server: string;
  surah_list: string;
}

interface ReciterPlaylistProps {
  surahs: Chapter[];
  reciter: Reciter;
}

export default function ReciterPlaylist({ surahs, reciter }: ReciterPlaylistProps) {
  const { activeSurahId, isPlaying, playSurah, togglePlay } = useGlobalAudio();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const query = searchQuery.trim().toLowerCase();
    return surahs.filter(
      (s) =>
        s.name_arabic.includes(query) ||
        s.name_simple.toLowerCase().includes(query) ||
        s.id.toString() === query
    );
  }, [surahs, searchQuery]);

  return (
    <div className="w-full pb-20 min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-white transition-colors">
      
      {/* Top Header & Back Button */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/reciters"
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-transparent hover:border-[#0f8e5d]/30 active:scale-95 transition-all"
            title="الرجوع للقراء"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80]">
            تلاوات القرآن الكريم
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#0f8e5d]/10 to-transparent rounded-bl-full pointer-events-none"></div>

          {/* Reciter Icon Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-[#f4f7f9] dark:bg-[#0f172a] border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 shadow-sm relative group">
            <svg className="w-16 h-16 md:w-20 md:h-20 text-[#0f8e5d] dark:text-[#4ade80] transition-transform group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>

          {/* Details */}
          <div className="text-center md:text-right flex-1">
            <span className="text-xs font-bold text-[#0f8e5d] dark:text-[#4ade80] uppercase tracking-wider block mb-1">
              القارئ
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#1e354d] dark:text-white mb-3">
              {reciter.reciter_name}
            </h1>
            <p className="text-sm md:text-base text-[#4a6b8c] dark:text-[#8ba7c0] font-medium flex items-center justify-center md:justify-start gap-2">
              <span>برواية {reciter.style || "حفص عن عاصم"}</span>
              <span>•</span>
              <span>{surahs.length} سورة متاحة</span>
            </p>
          </div>

          {/* Play All Button */}
          <div className="shrink-0 mt-4 md:mt-0">
            <button
              onClick={() => {
                if (!activeSurahId || (activeSurahId && !surahs.find((s) => s.id === activeSurahId))) {
                  playSurah(surahs[0], reciter, surahs);
                } else {
                  togglePlay();
                }
              }}
              className="w-16 h-16 rounded-full bg-[#0f8e5d] text-white flex items-center justify-center hover:bg-[#0c734b] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#0f8e5d]/30"
              title={isPlaying && activeSurahId ? "إيقاف مؤقت" : "تشغيل الكل"}
            >
              {isPlaying && activeSurahId && surahs.find((s) => s.id === activeSurahId) ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4l12 6-12 6z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content & Table */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن سورة بالاسم أو الرقم..."
            className="w-full bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white pl-10 pr-11 py-3.5 rounded-3xl text-sm border border-transparent hover:border-[#0f8e5d]/30 focus:border-[#0f8e5d] focus:outline-none shadow-sm transition-all placeholder:text-[#4a6b8c]/60 dark:placeholder:text-[#8ba7c0]/60"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6b8c] dark:text-[#8ba7c0] pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tracks List Card */}
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-4 md:p-6 border border-black/5 dark:border-white/5 shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_minmax(0,1fr)_100px_100px] gap-4 px-4 py-3 text-[#4a6b8c] dark:text-[#8ba7c0] text-xs font-bold uppercase tracking-wider border-b border-black/5 dark:border-white/5 mb-2">
            <div className="text-center">#</div>
            <div>السورة</div>
            <div className="text-left" dir="ltr">النزول</div>
            <div className="text-left" dir="ltr">الآيات</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col gap-1">
            {filteredSurahs.map((surah) => {
              const isActive = surah.id === activeSurahId;
              return (
                <div
                  key={surah.id}
                  onClick={() => playSurah(surah, reciter, surahs)}
                  className={`grid grid-cols-[50px_minmax(0,1fr)_100px_100px] gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all group items-center border ${
                    isActive
                      ? "bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 border-[#0f8e5d]/30 shadow-sm"
                      : "hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] border-transparent"
                  }`}
                >
                  {/* Number / Playing Indicator */}
                  <div className="text-center flex items-center justify-center w-8 h-8 mx-auto">
                    {isActive && isPlaying ? (
                      <div className="flex items-center justify-center gap-0.5 text-[#0f8e5d] dark:text-[#4ade80]">
                        <span className="w-1 h-4 bg-current rounded-full animate-bounce"></span>
                        <span className="w-1 h-3 bg-current rounded-full animate-bounce delay-75"></span>
                        <span className="w-1 h-5 bg-current rounded-full animate-bounce delay-150"></span>
                      </div>
                    ) : isActive ? (
                      <span className="text-[#0f8e5d] dark:text-[#4ade80] font-bold text-sm">
                        {surah.id}
                      </span>
                    ) : (
                      <>
                        <span className="text-[#4a6b8c] dark:text-[#8ba7c0] text-sm font-semibold group-hover:hidden">
                          {surah.id}
                        </span>
                        <svg className="w-4 h-4 text-[#0f8e5d] dark:text-[#4ade80] hidden group-hover:block ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4l12 6-12 6z" />
                        </svg>
                      </>
                    )}
                  </div>

                  {/* Names */}
                  <div className="flex flex-col">
                    <span className={`font-bold text-base md:text-lg transition-colors ${
                      isActive ? "text-[#0f8e5d] dark:text-[#4ade80]" : "text-[#1e354d] dark:text-white group-hover:text-[#0f8e5d] dark:group-hover:text-[#4ade80]"
                    }`}>
                      {surah.name_arabic}
                    </span>
                    <span className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0]">{surah.name_simple}</span>
                  </div>

                  {/* Revelation Place */}
                  <div className="text-left text-xs md:text-sm text-[#4a6b8c] dark:text-[#8ba7c0] capitalize" dir="ltr">
                    <span className="px-2.5 py-1 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] text-[11px] font-medium">
                      {surah.revelation_place === "makkah" ? "مكية" : "مدنية"}
                    </span>
                  </div>

                  {/* Verses Count */}
                  <div className="text-left text-xs md:text-sm font-semibold text-[#4a6b8c] dark:text-[#8ba7c0]" dir="ltr">
                    {surah.verses_count} آية
                  </div>
                </div>
              );
            })}

            {filteredSurahs.length === 0 && (
              <div className="text-center py-12 text-[#4a6b8c] dark:text-[#8ba7c0]">
                لا توجد سور مطابقة لبحثك
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
