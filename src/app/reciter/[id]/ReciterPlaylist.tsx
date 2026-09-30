"use client";

import { useState, useRef, useEffect } from "react";
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

  return (
    <div className="w-full pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#8ba7c0] to-[#f4f7f9] dark:from-[#0f172a] dark:to-[#1e293b] pt-24 pb-8 px-8 md:px-12 flex flex-col md:flex-row items-end gap-6 shadow-sm">
        <div className="w-48 h-48 rounded-2xl bg-white dark:bg-[#1e293b]/30 backdrop-blur-md border border-white/50 flex items-center justify-center shrink-0 shadow-2xl overflow-hidden relative">
          <svg className="w-24 h-24 text-[#1e354d] dark:text-[#f8fafc]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </div>
        <div className="text-right flex-1">
          <p className="uppercase text-sm font-bold text-[#1e354d] dark:text-[#f8fafc]/80 mb-2">قائمة التشغيل</p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-4 drop-shadow-sm leading-tight">
            {reciter.reciter_name}
          </h1>
          <p className="text-[#1e354d] dark:text-[#f8fafc]/80 text-lg font-medium">
            برواية {reciter.style || 'حفص عن عاصم'} • {surahs.length} سورة
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 md:px-12 py-8 flex items-center gap-6 border-b border-[#e2e8f0] dark:border-[#334155]/50 mb-4">
        <button 
          onClick={() => {
            if (!activeSurahId || (activeSurahId && !surahs.find(s => s.id === activeSurahId))) {
              playSurah(surahs[0], reciter, surahs);
            } else {
              togglePlay();
            }
          }} 
          className="w-16 h-16 rounded-full bg-[#4a6b8c] text-white flex items-center justify-center hover:bg-[#537592] hover:scale-105 transition-all shadow-xl"
        >
          {isPlaying && activeSurahId && surahs.find(s => s.id === activeSurahId) ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
          )}
        </button>
      </div>

      {/* Tracks Table */}
      <div className="px-4 md:px-8 max-w-[1200px] mx-auto mb-32">
        <div className="grid grid-cols-[40px_minmax(0,1fr)_100px_100px] gap-4 px-4 py-3 text-[#5a7b9c] dark:text-[#94a3b8] text-sm uppercase tracking-wider border-b border-[#e2e8f0] dark:border-[#334155] mb-2 font-semibold">
          <div className="text-center">#</div>
          <div>السورة</div>
          <div className="text-left" dir="ltr">Revelation</div>
          <div className="text-left" dir="ltr">Verses</div>
        </div>

        <div className="flex flex-col">
          {surahs.map((surah) => {
            const isActive = surah.id === activeSurahId;
            return (
              <div
                key={surah.id}
                onClick={() => playSurah(surah, reciter, surahs)}
                className={`grid grid-cols-[40px_minmax(0,1fr)_100px_100px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors group items-center ${
                  isActive ? "bg-[#4a6b8c]/10" : "hover:bg-black/5"
                }`}
              >
                <div className="text-center flex items-center justify-center w-6 h-6 mx-auto">
                  {isActive && isPlaying ? (
                    <svg className="w-4 h-4 text-[#4a6b8c] dark:text-[#94a3b8] animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z"/></svg>
                  ) : isActive ? (
                    <span className="text-[#4a6b8c] dark:text-[#94a3b8] font-bold">{surah.id}</span>
                  ) : (
                    <>
                      <span className="text-[#5a7b9c] dark:text-[#94a3b8] group-hover:hidden">{surah.id}</span>
                      <svg className="w-4 h-4 text-[#1e354d] dark:text-[#f8fafc] hidden group-hover:block ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                    </>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className={`font-bold text-lg ${isActive ? "text-[#4a6b8c] dark:text-[#94a3b8]" : "text-[#1e354d] dark:text-[#f8fafc]"}`}>
                    {surah.name_arabic}
                  </span>
                  <span className="text-sm text-[#5a7b9c] dark:text-[#94a3b8]">{surah.name_simple}</span>
                </div>
                
                <div className="text-left text-sm text-[#5a7b9c] dark:text-[#94a3b8] capitalize" dir="ltr">
                  {surah.revelation_place}
                </div>
                
                <div className="text-left text-sm text-[#5a7b9c] dark:text-[#94a3b8]" dir="ltr">
                  {surah.verses_count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
