/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import AudioPlayer, { AudioPlayerRef } from "./AudioPlayer";
import { QURAN_CHAPTERS, QURAN_JUZS } from "@/data/quranChapters";

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translation?: string;
}

interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  revelation_place: string;
  verses_count: number;
  translated_name?: {
    name: string;
  };
  bismillah_pre?: boolean;
}

function toArabicDigits(num: number | string): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => digits[+d]);
}

export default function SurahReader({ 
  chapter, 
  verses,
  isTranslationEnabled
}: { 
  chapter: Chapter; 
  verses: Verse[];
  isTranslationEnabled: boolean;
}) {
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const playerRef = useRef<AudioPlayerRef>(null);

  const [popupMenu, setPopupMenu] = useState<{ x: number; y: number; verseKey: string; translation?: string } | null>(null);
  const [showTranslationModal, setShowTranslationModal] = useState<{ verseKey: string; translation: string } | null>(null);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Chapter and Page metadata
  const chapterMeta = useMemo(() => {
    return QURAN_CHAPTERS.find((ch) => ch.id === chapter.id) || {
      id: chapter.id,
      name_arabic: chapter.name_arabic,
      name_simple: chapter.name_simple,
      verses_count: chapter.verses_count,
      revelation_place: chapter.revelation_place,
      bismillah_pre: chapter.bismillah_pre,
      start_page: 1,
      end_page: 1,
    };
  }, [chapter.id, chapter.name_arabic, chapter.name_simple, chapter.verses_count, chapter.revelation_place, chapter.bismillah_pre]);

  // Generate list of all pages in this surah
  const pages = useMemo(() => {
    const count = chapterMeta.end_page - chapterMeta.start_page + 1;
    return Array.from({ length: count }, (_, i) => chapterMeta.start_page + i);
  }, [chapterMeta.start_page, chapterMeta.end_page]);

  const [activePageOnScroll, setActivePageOnScroll] = useState<number>(chapterMeta.start_page);

  // Track active page as user scrolls down
  useEffect(() => {
    if (typeof window === "undefined" || pages.length <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageId = entry.target.id;
            const pNum = Number(pageId.replace("surah-page-", ""));
            if (!isNaN(pNum)) {
              setActivePageOnScroll(pNum);
            }
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    pages.forEach((p) => {
      const el = document.getElementById(`surah-page-${p}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages]);

  const scrollToPage = (p: number) => {
    const el = document.getElementById(`surah-page-${p}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getJuzAndHizb = (p: number) => {
    const juzItem = [...QURAN_JUZS].reverse().find((j) => p >= j.start_page) || QURAN_JUZS[0];
    const juz = juzItem.juz;
    const hizb = Math.ceil(juzItem.juz * 2);
    return { juz, hizb };
  };

  const getPageImageUrl = (p: number) => {
    const padded = String(p).padStart(3, "0");
    if (p === 1 || p === 2) {
      return `/images/mushaf/page${padded}.png`;
    }
    return `https://files.quran.app/hafs/madani/width_1260/page${padded}.png`;
  };

  const nextChapter = chapter.id < 114 ? QURAN_CHAPTERS.find((c) => c.id === chapter.id + 1) : null;
  const prevChapter = chapter.id > 1 ? QURAN_CHAPTERS.find((c) => c.id === chapter.id - 1) : null;

  const handleTouchStart = (e: React.TouchEvent, verseKey: string, translation?: string) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setPopupMenu({ x: touch.clientX, y: touch.clientY, verseKey, translation });
    }, 500);
  };

  const handleTouchEndOrMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleContextMenu = (e: React.MouseEvent, verseKey: string, translation?: string) => {
    e.preventDefault();
    setPopupMenu({ x: e.clientX, y: e.clientY, verseKey, translation });
  };

  useEffect(() => {
    const closePopup = () => setPopupMenu(null);
    window.addEventListener("click", closePopup);
    window.addEventListener("scroll", closePopup);
    return () => {
      window.removeEventListener("click", closePopup);
      window.removeEventListener("scroll", closePopup);
    };
  }, []);

  const handleVerseChange = useCallback((verseKey: string | null) => {
    setActiveVerseKey(verseKey);
  }, []);

  // Auto-scroll to active verse
  const activeVerseRef = useRef<HTMLDivElement | HTMLSpanElement>(null);
  
  useEffect(() => {
    if (activeVerseRef.current) {
      activeVerseRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeVerseKey]);

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full text-[#1e354d] dark:text-white">
      
      {/* Right Sidebar - Sticky */}
      <div className={`w-full md:w-[340px] shrink-0 ${isReadingMode ? "hidden" : "block"}`}>
        <div className="sticky top-24 flex flex-col gap-6">
           
           {/* Menu Box */}
           <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-sm">
             <h3 className="font-bold text-[#1e354d] dark:text-white text-base mb-4 text-right border-b border-black/5 dark:border-white/5 pb-3">
               فهرس السورة
             </h3>
             <ul className="flex flex-col gap-2 text-right">
               <li className="bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] font-bold p-3 rounded-2xl transition-colors">
                 قراءة السورة (المصحف الشريف)
               </li>
               {pages.length > 1 && (
                 <li className="p-3 bg-[#f4f7f9] dark:bg-[#0f172a] rounded-2xl">
                   <label className="block text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0] mb-2">
                     الانتقال السريع للصفحة:
                   </label>
                   <select
                     value={activePageOnScroll}
                     onChange={(e) => scrollToPage(Number(e.target.value))}
                     className="w-full bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 font-bold outline-none cursor-pointer text-xs"
                   >
                     {pages.map((p) => (
                       <option key={p} value={p}>
                         صفحة {toArabicDigits(p)} (صفحة {toArabicDigits(p - chapterMeta.start_page + 1)} بالسورة)
                       </option>
                     ))}
                   </select>
                 </li>
               )}
               <li>
                 <Link 
                   href={`/surah/${chapter.id}?showTranslation=${isTranslationEnabled ? "false" : "true"}`}
                   className="block text-[#4a6b8c] dark:text-[#8ba7c0] hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] hover:text-[#0f8e5d] dark:hover:text-[#4ade80] p-3 rounded-2xl font-medium transition-colors"
                 >
                   {isTranslationEnabled ? "📖 عرض المصحف الشريف" : "🔍 إظهار التفسير والترجمة"}
                 </Link>
               </li>
               <li>
                 <Link 
                   href="/surahs"
                   className="block text-[#4a6b8c] dark:text-[#8ba7c0] hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] hover:text-[#0f8e5d] dark:hover:text-[#4ade80] p-3 rounded-2xl font-medium transition-colors"
                 >
                   العودة لفهرس السور
                 </Link>
               </li>
             </ul>
           </div>
           
           {/* Audio Player Box */}
           <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-sm">
              <AudioPlayer 
                ref={playerRef}
                chapterId={chapter.id.toString()} 
                onVerseChange={handleVerseChange} 
              />
           </div>

        </div>
      </div>

      {/* Main Content - Left Side (Scrolling) */}
      <div className={`flex-1 text-right min-w-0 transition-all duration-300 ${isReadingMode ? "max-w-4xl mx-auto" : ""}`}>
        
        {/* Header Block */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/surahs"
              className="w-10 h-10 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-transparent hover:border-[#0f8e5d]/30 active:scale-95 transition-all"
              title="الرجوع للفهرس"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e354d] dark:text-white">
                سورة {chapter.name_arabic}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80]">
                  {chapter.revelation_place === "makkah" ? "مكية" : "مدنية"}
                </span>
                <span className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] font-medium">
                  رقم {chapter.id} • {chapter.verses_count} آية
                  {chapterMeta.start_page === chapterMeta.end_page ? (
                    <> • صفحة {toArabicDigits(chapterMeta.start_page)}</>
                  ) : (
                    <> • صفحة {toArabicDigits(chapterMeta.start_page)} إلى {toArabicDigits(chapterMeta.end_page)}</>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsReadingMode(!isReadingMode)}
            className="flex items-center gap-2 px-4 py-2 bg-[#f4f7f9] dark:bg-[#0f172a] border border-black/5 dark:border-white/5 rounded-full text-[#1e354d] dark:text-white hover:border-[#0f8e5d]/30 transition-all text-xs md:text-sm font-bold shadow-sm"
          >
            {isReadingMode ? (
              <>
                <svg className="w-4 h-4 text-[#0f8e5d] dark:text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>الوضع العادي</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-[#0f8e5d] dark:text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>وضع القراءة</span>
              </>
            )}
          </button>
        </div>

        {/* Translation Mode */}
        {isTranslationEnabled ? (
          <div className="text-center leading-[2.5] md:leading-[2.8] text-[#1e354d] dark:text-[#f8fafc] font-medium mb-16 bg-white dark:bg-[#1e293b] p-6 md:p-12 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
            <div className="flex flex-col gap-8 text-right select-none">
              {verses.map((verse) => {
                const ayahNumber = verse.verse_key.split(":")[1];
                const isFatihaBasmalah = chapter.id === 1 && ayahNumber === "1";
                const isActive = activeVerseKey === verse.verse_key;
                const highlightClass = isActive 
                  ? "bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 text-[#0f8e5d] dark:text-[#4ade80] rounded-2xl px-2 py-1 transition-all duration-300 shadow-sm" 
                  : "transition-all duration-300";

                return (
                  <div 
                    key={verse.id} 
                    ref={isActive ? (activeVerseRef as React.RefObject<HTMLDivElement>) : null}
                    className={`pb-8 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0 ${
                      isActive ? "bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 p-4 rounded-2xl -mx-4" : ""
                    }`}
                    onContextMenu={(e) => handleContextMenu(e, verse.verse_key, verse.translation)}
                    onTouchStart={(e) => handleTouchStart(e, verse.verse_key, verse.translation)}
                    onTouchEnd={handleTouchEndOrMove}
                    onTouchMove={handleTouchEndOrMove}
                  >
                    <div className={`text-2xl md:text-4xl font-quran font-normal mb-6 text-center md:text-right leading-loose flex flex-wrap items-center justify-center md:justify-start gap-4 ${highlightClass}`}>
                      {isFatihaBasmalah ? (
                        <>
                          <img src="/img/basmalah.png" alt="بسم الله الرحمن الرحيم" className="max-w-[70%] dark:invert opacity-85 inline-block" loading="lazy" />
                          <span className="text-[#0f8e5d] dark:text-[#4ade80] mx-1 text-xl md:text-2xl font-bold">({ayahNumber})</span>
                        </>
                      ) : (
                        <>
                          {verse.text_uthmani} <span className="text-[#0f8e5d] dark:text-[#4ade80] mx-1 font-sans text-2xl font-bold">({ayahNumber})</span>
                        </>
                      )}
                    </div>
                    {verse.translation && (
                      <div className="text-base md:text-lg text-[#4a6b8c] dark:text-[#8ba7c0] font-sans pt-2 leading-relaxed" dir="rtl" dangerouslySetInnerHTML={{ __html: verse.translation }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Continuous Scroll Madani Mushaf View (Matching Site Theme) */
          <div className="flex flex-col mb-16">
            {/* Continuous Vertical Feed of Pages */}
            <div className="flex flex-col gap-8 mb-12">
              {pages.map((p, idx) => {
                const meta = getJuzAndHizb(p);
                const isShort = p === 1 || p === 2;

                return (
                  <div
                    key={p}
                    id={`surah-page-${p}`}
                    className={`relative rounded-3xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white transition-all duration-300 flex flex-col justify-between items-center p-3 sm:p-5 md:p-6 ${
                      isShort ? "min-h-[580px] sm:min-h-[680px] md:min-h-[740px]" : ""
                    }`}
                  >
                    {/* Header info bar */}
                    <div className="w-full flex items-center justify-between px-2 sm:px-4 pb-3 text-[11px] sm:text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0] border-b border-black/5 dark:border-white/5">
                      <span>سورة {chapter.name_arabic}</span>
                      <span>الجزء {toArabicDigits(meta.juz)} - الحزب {toArabicDigits(meta.hizb)}</span>
                      <span>صفحة {toArabicDigits(p)}</span>
                    </div>

                    {/* High-Resolution 15-Line Mushaf Image */}
                    <div className={`w-full flex items-center justify-center ${isShort ? "my-auto py-4 sm:py-8" : "py-3"}`}>
                      <div
                        className={`relative w-full max-w-[720px] transition-all duration-300 ${
                          isShort ? "aspect-[1260/1010]" : "aspect-[1/1.62]"
                        } dark:[filter:invert(0.92)_hue-rotate(180deg)_brightness(1.05)_contrast(1.15)]`}
                      >
                        <Image
                          src={getPageImageUrl(p)}
                          alt={`سورة ${chapter.name_arabic} - صفحة ${p}`}
                          fill
                          loading={idx < 2 ? "eager" : "lazy"}
                          priority={idx === 0}
                          unoptimized
                          className="object-contain select-none"
                          sizes="(max-width: 768px) 100vw, 760px"
                        />
                      </div>
                    </div>

                    {/* Footer page number */}
                    <div className="w-full text-center pt-3 pb-1 text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0] border-t border-black/5 dark:border-white/5">
                      — {toArabicDigits(p)} —
                    </div>
                  </div>
                );
              })}
            </div>

            {/* End of Surah Completion Card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-black/5 dark:border-white/5 p-6 sm:p-8 text-center shadow-sm mb-16 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#1e354d] dark:text-white">
                  تمت بحمد الله قراءة سورة {chapter.name_arabic}
                </h3>
                <p className="text-xs sm:text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-1">
                  عدد الآيات: {toArabicDigits(chapter.verses_count)} • عدد الصفحات: {toArabicDigits(pages.length)}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                {nextChapter && (
                  <Link
                    href={`/surah/${nextChapter.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0f8e5d] hover:bg-[#0c734b] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    <span>السورة التالية: سورة {nextChapter.name_arabic}</span>
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                )}
                {prevChapter && (
                  <Link
                    href={`/surah/${prevChapter.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-white hover:border-[#0f8e5d]/30 font-bold text-sm transition-all"
                  >
                    <span>سورة {prevChapter.name_arabic}</span>
                  </Link>
                )}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="px-4 py-2.5 rounded-2xl bg-[#f4f7f9] dark:bg-[#0f172a] text-[#4a6b8c] dark:text-[#8ba7c0] hover:text-[#1e354d] dark:hover:text-white font-bold text-sm transition-all"
                >
                  الرجوع لأعلى السورة ↑
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Long Press / Context Menu Popup */}
        {popupMenu && (
          <div 
            className="fixed z-50 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-2 flex gap-2 items-center transform -translate-x-1/2 -translate-y-[120%]"
            style={{ top: popupMenu.y, left: popupMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
             <button 
               onClick={() => {
                 if (playerRef.current) {
                   playerRef.current.playVerse(popupMenu.verseKey);
                 }
                 setPopupMenu(null);
               }}
               className="p-3 bg-[#0f8e5d] hover:bg-[#0c734b] rounded-xl text-white transition-all shadow-md shadow-[#0f8e5d]/30"
               aria-label="استماع للآية"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
               </svg>
             </button>

             {popupMenu.translation && (
               <button 
                 onClick={() => {
                   setShowTranslationModal({ verseKey: popupMenu.verseKey, translation: popupMenu.translation! });
                   setPopupMenu(null);
                 }}
                 className="py-2.5 px-4 bg-[#f4f7f9] dark:bg-[#0f172a] hover:bg-[#0f8e5d]/10 hover:text-[#0f8e5d] dark:hover:text-[#4ade80] rounded-xl text-[#1e354d] dark:text-white transition-all flex items-center gap-2 font-bold text-xs md:text-sm"
               >
                 <span>تفسير الآية</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                 </svg>
               </button>
             )}
          </div>
        )}

        {/* Translation Modal */}
        {showTranslationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowTranslationModal(null)}>
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-8 max-w-2xl w-full text-right shadow-2xl relative max-h-[80vh] overflow-y-auto border border-black/5 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-[#1e293b] pb-4 border-b border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setShowTranslationModal(null)} 
                  className="w-10 h-10 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] hover:text-[#1e354d] dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="font-bold text-xl md:text-2xl text-[#1e354d] dark:text-white">
                  تفسير الآية ({showTranslationModal.verseKey.split(':')[1]})
                </h3>
              </div>
              <div className="text-base md:text-lg text-[#395675] dark:text-[#cbd5e1] leading-loose font-sans" dangerouslySetInnerHTML={{ __html: showTranslationModal.translation }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
