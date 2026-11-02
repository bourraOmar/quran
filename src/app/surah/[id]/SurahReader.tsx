/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import AudioPlayer, { AudioPlayerRef } from "./AudioPlayer";
import { QURAN_CHAPTERS, QURAN_JUZS } from "@/data/quranChapters";

interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  code_v2?: string;
  line_number: number;
  page_number: number;
  text: string;
}

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  code_v2?: string;
  v2_page?: number;
  words?: Word[];
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
    const isSecondHizb = p >= juzItem.start_page + 10;
    const hizb = isSecondHizb ? juz * 2 : juz * 2 - 1;
    return { juz, hizb };
  };

  const getPageImageUrl = (p: number) => {
    const padded = String(p).padStart(3, "0");
    return `https://files.quran.app/hafs/madani/width_1260/page${padded}.png`;
  };

  // Full-Window Book Spread State (Two pages like an open book)
  const [currentSpread, setCurrentSpread] = useState<[number, number]>(() => {
    const startP = chapterMeta.start_page;
    if (startP % 2 !== 0) {
      return [startP, Math.min(604, startP + 1)];
    } else {
      return [Math.max(1, startP - 1), startP];
    }
  });

  // Sync spread with chapter when opening reading mode
  useEffect(() => {
    if (isReadingMode) {
      const startP = chapterMeta.start_page;
      if (startP % 2 !== 0) {
        setCurrentSpread([startP, Math.min(604, startP + 1)]);
      } else {
        setCurrentSpread([Math.max(1, startP - 1), startP]);
      }
    }
  }, [isReadingMode, chapterMeta.start_page]);

  // Collect all unique pages needed for King Fahad Complex V2 web fonts
  const allRequiredPages = useMemo(() => {
    const set = new Set(pages);
    if (isReadingMode) {
      set.add(currentSpread[0]);
      set.add(currentSpread[1]);
    }
    verses.forEach((v) => {
      if (v.v2_page) set.add(v.v2_page);
      v.words?.forEach((w) => {
        if (w.page_number) set.add(w.page_number);
      });
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [pages, isReadingMode, currentSpread, verses]);

  // Group words by page and line for authentic Quran.com King Fahad Complex V2 Mushaf layout
  const pagesData = useMemo(() => {
    const map: Record<number, Record<number, (Word & { verseKey: string })[]>> = {};
    verses.forEach((v) => {
      v.words?.forEach((w) => {
        const p = w.page_number;
        const l = w.line_number;
        if (!map[p]) map[p] = {};
        if (!map[p][l]) map[p][l] = [];
        map[p][l].push({ ...w, verseKey: v.verse_key });
      });
    });
    return map;
  }, [verses]);

  const flipToNextSpread = useCallback(() => {
    const [pRight] = currentSpread;
    const nextRight = pRight + 2;
    if (nextRight <= 603) {
      setCurrentSpread([nextRight, Math.min(604, nextRight + 1)]);
    }
  }, [currentSpread]);

  const flipToPrevSpread = useCallback(() => {
    const [pRight] = currentSpread;
    const prevRight = pRight - 2;
    if (prevRight >= 1) {
      setCurrentSpread([prevRight, prevRight + 1]);
    }
  }, [currentSpread]);

  // Keyboard navigation for Full-Window Book
  useEffect(() => {
    if (!isReadingMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsReadingMode(false);
      } else if (e.key === "ArrowLeft") {
        flipToNextSpread();
      } else if (e.key === "ArrowRight") {
        flipToPrevSpread();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadingMode, flipToNextSpread, flipToPrevSpread]);

  // Touch Swipe for Full-Window Book
  const touchStartXBook = useRef<number | null>(null);
  const handleBookTouchStart = (e: React.TouchEvent) => {
    touchStartXBook.current = e.touches[0].clientX;
  };
  const handleBookTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXBook.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXBook.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe right in RTL -> Prev spread
        flipToPrevSpread();
      } else {
        // Swipe left in RTL -> Next spread
        flipToNextSpread();
      }
    }
    touchStartXBook.current = null;
  };

  // Preload adjacent spreads
  useEffect(() => {
    if (typeof window === "undefined" || !isReadingMode) return;
    const [pRight, pLeft] = currentSpread;
    const toPreload = [pRight - 2, pLeft - 2, pRight + 2, pLeft + 2].filter((p) => p >= 1 && p <= 604);
    toPreload.forEach((p) => {
      const img = new window.Image();
      img.src = getPageImageUrl(p);
    });
  }, [isReadingMode, currentSpread]);

  const rightSurahMeta = QURAN_CHAPTERS.find((c) => currentSpread[0] >= c.start_page && currentSpread[0] <= c.end_page) || chapterMeta;
  const leftSurahMeta = QURAN_CHAPTERS.find((c) => currentSpread[1] >= c.start_page && currentSpread[1] <= c.end_page) || chapterMeta;
  const rightJuzHizb = getJuzAndHizb(currentSpread[0]);
  const leftJuzHizb = getJuzAndHizb(currentSpread[1]);

  const nextChapter = chapter.id < 114 ? QURAN_CHAPTERS.find((c) => c.id === chapter.id + 1) : null;
  const prevChapter = chapter.id > 1 ? QURAN_CHAPTERS.find((c) => c.id === chapter.id - 1) : null;

  // Prevent background scroll when full-window reading mode is open
  useEffect(() => {
    if (isReadingMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isReadingMode]);

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
               <li className="bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] font-bold p-3 rounded-2xl flex items-center justify-between">
                 <span>📖 مصحف مجمع الملك فهد (V2)</span>
                 <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                   افتراضي
                 </span>
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
                   {isTranslationEnabled ? "📖 إخفاء التفسير والترجمة" : "🔍 إظهار التفسير والترجمة"}
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
      <div className={`flex-1 text-right min-w-0 transition-all duration-300 ${isReadingMode ? "w-full max-w-[1550px] mx-auto" : ""}`}>
        
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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e354d] dark:text-white">
                  سورة {chapter.name_arabic}
                </h1>
                {isReadingMode && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] hidden sm:inline-block">
                    📖 وضع الكتاب (صفحتان)
                  </span>
                )}
              </div>
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
          
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              مصحف مجمع الملك فهد (V2)
            </span>

            <button 
              onClick={() => setIsReadingMode(!isReadingMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border border-black/5 dark:border-white/5 transition-all text-xs font-bold shadow-sm ${
                isReadingMode
                  ? "bg-[#0f8e5d] text-white hover:bg-[#0c734b]"
                  : "bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-white hover:border-[#0f8e5d]/30"
              }`}
            >
              {isReadingMode ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span>الوضع العادي</span>
                </>
              ) : (
                <>
                  <span>📖</span>
                  <span>عرض كتاب</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inject King Fahad Complex V2 Fonts */}
        <style
          dangerouslySetInnerHTML={{
            __html: allRequiredPages
              .map(
                (p) => `
                  @font-face {
                    font-family: 'p${p}';
                    src: url('https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${p}.woff2') format('woff2');
                    font-display: swap;
                  }
                `
              )
              .join("\n"),
          }}
        />

        {/* Translation Mode */}
        {isTranslationEnabled ? (
          <div className="text-center leading-[2.5] md:leading-[2.8] text-[#1e354d] dark:text-[#f8fafc] font-medium mb-16 bg-white dark:bg-[#1e293b] p-6 md:p-12 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
            {chapter.id !== 1 && chapter.id !== 9 && (
              <div className="pb-8 text-center border-b border-black/5 dark:border-white/5 mb-8">
                <span style={{ fontFamily: "p1" }} className="text-3xl sm:text-4xl md:text-5xl text-[#1e354d] dark:text-white inline-block">
                  ﱁ ﱂ ﱃ ﱄ
                </span>
              </div>
            )}

            <div className="flex flex-col gap-8 text-right select-none">
              {verses.map((verse) => {
                const ayahNumber = verse.verse_key.split(":")[1];
                const isActive = activeVerseKey === verse.verse_key;
                const highlightClass = isActive 
                  ? "bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20 text-[#0f8e5d] dark:text-[#4ade80] rounded-2xl p-4 -mx-4 transition-all duration-300 shadow-sm" 
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
                    <div
                      className={`text-2xl sm:text-3xl md:text-4xl font-normal leading-[2.3] md:leading-[2.5] flex flex-wrap items-center justify-start gap-x-2.5 gap-y-3.5 ${highlightClass}`}
                      dir="rtl"
                    >
                      {verse.words && verse.words.length > 0 ? (
                        verse.words.map((w) => (
                          <span
                            key={w.id}
                            style={{ fontFamily: `p${w.page_number}` }}
                            className={
                              w.char_type_name === "end"
                                ? "text-[#0f8e5d] dark:text-[#4ade80] px-1 font-bold select-none text-2xl md:text-3xl inline-block"
                                : "inline-block hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors"
                            }
                          >
                            {w.code_v2 || w.text}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontFamily: `p${verse.v2_page || 1}` }}>
                          {verse.code_v2 || verse.text_uthmani}{" "}
                          <span className="text-[#0f8e5d] dark:text-[#4ade80] mx-1 font-sans text-2xl font-bold">
                            ({ayahNumber})
                          </span>
                        </span>
                      )}
                    </div>

                    {verse.translation && (
                      <div
                        className="text-base md:text-lg text-[#4a6b8c] dark:text-[#8ba7c0] font-sans pt-3 leading-relaxed"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: verse.translation }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Official King Fahad Complex V2 Centered Mushaf Layout (Identical to Quran.com - Permanent Default) */
          <div className="flex flex-col items-center mb-16">
            {pages.map((p) => {
              const linesMap = pagesData[p] || {};
              const lineNumbers = Object.keys(linesMap).map(Number).sort((a, b) => a - b);

              return (
                <div
                  key={p}
                  id={`surah-page-${p}`}
                  className="w-full max-w-[850px] mx-auto mb-12 p-6 sm:p-10 md:p-14 rounded-3xl bg-[#121824] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between transition-all"
                >
                  {/* Surah Header Banner (For Surahs starting on this page, except Fatiha which has Bismillah as Ayah 1) */}
                  {p === chapterMeta.start_page && chapter.id !== 1 && (
                    <div className="w-full mb-8">
                      <div className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-emerald-900/70 to-emerald-950/60 border border-emerald-500/30 text-center mb-6 shadow-md">
                        <span className="font-extrabold text-2xl sm:text-3xl text-emerald-300">
                          سورة {chapter.name_arabic}
                        </span>
                      </div>
                      {chapter.id !== 9 && (
                        <div className="text-center py-4">
                          <span style={{ fontFamily: "p1" }} className="text-3xl sm:text-4xl md:text-5xl text-white inline-block">
                            ﱁ ﱂ ﱃ ﱄ
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Centered Page Lines */}
                  <div className="w-full flex flex-col items-center justify-center gap-2 sm:gap-3 my-auto py-2">
                    {lineNumbers.map((lineNum) => {
                      const lineWords = linesMap[lineNum] || [];
                      return (
                        <div
                          key={lineNum}
                          className="w-full flex flex-wrap items-center justify-center text-center gap-x-1.5 sm:gap-x-2.5 gap-y-1 transition-colors"
                          dir="rtl"
                        >
                          {lineWords.map((w) => {
                            const isWordActive = activeVerseKey === w.verseKey;
                            return (
                              <span
                                key={w.id}
                                style={{ fontFamily: `p${w.page_number}` }}
                                onClick={() => setActiveVerseKey(w.verseKey)}
                                onContextMenu={(e) => {
                                  const matchingVerse = verses.find(v => v.verse_key === w.verseKey);
                                  handleContextMenu(e, w.verseKey, matchingVerse?.translation);
                                }}
                                className={`text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] leading-[1.8] inline-block cursor-pointer transition-colors duration-200 select-none ${
                                  isWordActive
                                    ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                                    : "text-white hover:text-emerald-300"
                                }`}
                              >
                                {w.code_v2 || w.text}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Centered Page Number at Bottom */}
                  <div className="w-full text-center pt-8 pb-2 text-sm sm:text-base font-semibold text-gray-400 select-none">
                    {toArabicDigits(p)}
                  </div>
                </div>
              );
            })}

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

      {/* Full-Window 3D Book Overlay with Page Flipping */}
      {isReadingMode && (
        <div className="fixed inset-0 z-[100] bg-[#090d14] text-white flex flex-col justify-between select-none overflow-hidden animate-fade-in">
          {/* Top Bar */}
          <div className="w-full h-14 sm:h-16 px-4 sm:px-8 bg-[#0d131d]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-4 z-30 shrink-0">
            {/* Right: Surah info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl font-bold font-quran text-emerald-400 drop-shadow-sm">
                سورة {rightSurahMeta?.name_arabic}
              </span>
              <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 hidden sm:inline">
                الجزء {toArabicDigits(rightJuzHizb.juz)} • الحزب {toArabicDigits(rightJuzHizb.hizb)}
              </span>
            </div>

            {/* Center: Spread Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold bg-[#141b26] px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-inner">
              <span className="text-gray-400">صفحة</span>
              <span className="text-emerald-400 font-mono font-bold">{toArabicDigits(currentSpread[0])}</span>
              <span className="text-gray-500">-</span>
              <span className="text-emerald-400 font-mono font-bold">{toArabicDigits(currentSpread[1])}</span>
              <span className="text-gray-400">من ٦٠٤</span>
            </div>

            {/* Left: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white rounded-xl border border-white/10 text-xs font-semibold transition-all active:scale-95"
              >
                <span>⛶ ملء الشاشة</span>
              </button>

              <button
                onClick={() => setIsReadingMode(false)}
                className="flex items-center gap-1 px-3.5 sm:px-4 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <span>خروج ✕</span>
              </button>
            </div>
          </div>

          {/* Book Stage */}
          <div className="flex-1 w-full flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 relative overflow-hidden min-h-0">
            {/* Previous Spread Button (First child in RTL appears on the RIGHT) */}
            <button
              onClick={flipToPrevSpread}
              disabled={currentSpread[0] <= 1}
              className="z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#141b26]/90 hover:bg-emerald-600 hover:border-emerald-500 active:scale-90 disabled:opacity-0 disabled:pointer-events-none border border-white/15 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all shrink-0 mr-1 sm:mr-3"
              aria-label="الصفحة السابقة"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Open Book Spread */}
            <div
              onTouchStart={handleBookTouchStart}
              onTouchEnd={handleBookTouchEnd}
              className="flex-1 flex items-center justify-center h-full max-h-[94vh] w-full"
            >
              <div className="relative w-full max-w-[1600px] h-full flex items-stretch justify-center rounded-[20px] sm:rounded-[32px] bg-gradient-to-b from-[#121824] to-[#0c111a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.03)] border border-emerald-500/20 overflow-hidden">
                
                {/* Right Page (Odd Page in RTL - read first) */}
                <div
                  onClick={flipToPrevSpread}
                  className="flex-1 flex flex-col justify-between items-center px-3 sm:px-6 md:px-8 py-2 sm:py-3 cursor-pointer relative bg-gradient-to-l from-[#131b26] to-[#0e141e] hover:brightness-105 transition-all shadow-[inset_-20px_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="w-full flex items-center justify-between pb-2 text-[11px] sm:text-xs font-bold text-gray-400 border-b border-white/10 shrink-0">
                    <span className="text-emerald-400">سورة {rightSurahMeta?.name_arabic}</span>
                    <span>الجزء {toArabicDigits(rightJuzHizb.juz)} - الحزب {toArabicDigits(rightJuzHizb.hizb)}</span>
                    <span className="font-mono">صفحة {toArabicDigits(currentSpread[0])}</span>
                  </div>

                  <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                    <div className="relative w-full h-full max-h-[82vh] sm:max-h-[86vh] aspect-[1/1.62] [filter:invert(0.92)_hue-rotate(180deg)_brightness(1.05)_contrast(1.15)]">
                      <Image
                        key={`spread-right-${currentSpread[0]}`}
                        src={getPageImageUrl(currentSpread[0])}
                        alt={`المصحف الشريف صفحة ${currentSpread[0]}`}
                        fill
                        priority
                        unoptimized
                        className="object-contain select-none"
                        sizes="(max-width: 1200px) 50vw, 850px"
                      />
                    </div>
                  </div>

                  <div className="w-full text-center pt-2 text-xs font-bold text-gray-400 border-t border-white/10 shrink-0 font-mono">
                    — {toArabicDigits(currentSpread[0])} —
                  </div>
                </div>

                {/* Center Book Spine Binding Line */}
                <div className="w-[5px] sm:w-[7px] bg-gradient-to-r from-black/80 via-emerald-500/20 to-black/80 shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20 shrink-0 relative">
                  <div className="absolute inset-y-0 -left-4 w-4 bg-gradient-to-l from-black/50 to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 -right-4 w-4 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
                </div>

                {/* Left Page (Even Page in RTL - read second) */}
                <div
                  onClick={flipToNextSpread}
                  className="flex-1 flex flex-col justify-between items-center px-3 sm:px-6 md:px-8 py-2 sm:py-3 cursor-pointer relative bg-gradient-to-r from-[#131b26] to-[#0e141e] hover:brightness-105 transition-all shadow-[inset_20px_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="w-full flex items-center justify-between pb-2 text-[11px] sm:text-xs font-bold text-gray-400 border-b border-white/10 shrink-0">
                    <span className="text-emerald-400">سورة {leftSurahMeta?.name_arabic}</span>
                    <span>الجزء {toArabicDigits(leftJuzHizb.juz)} - الحزب {toArabicDigits(leftJuzHizb.hizb)}</span>
                    <span className="font-mono">صفحة {toArabicDigits(currentSpread[1])}</span>
                  </div>

                  <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                    <div className="relative w-full h-full max-h-[82vh] sm:max-h-[86vh] aspect-[1/1.62] [filter:invert(0.92)_hue-rotate(180deg)_brightness(1.05)_contrast(1.15)]">
                      <Image
                        key={`spread-left-${currentSpread[1]}`}
                        src={getPageImageUrl(currentSpread[1])}
                        alt={`المصحف الشريف صفحة ${currentSpread[1]}`}
                        fill
                        priority
                        unoptimized
                        className="object-contain select-none"
                        sizes="(max-width: 1200px) 50vw, 850px"
                      />
                    </div>
                  </div>

                  <div className="w-full text-center pt-2 text-xs font-bold text-gray-400 border-t border-white/10 shrink-0 font-mono">
                    — {toArabicDigits(currentSpread[1])} —
                  </div>
                </div>

              </div>
            </div>

            {/* Next Spread Button (Last child in RTL appears on the LEFT) */}
            <button
              onClick={flipToNextSpread}
              disabled={currentSpread[0] >= 603}
              className="z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#141b26]/90 hover:bg-emerald-600 hover:border-emerald-500 active:scale-90 disabled:opacity-0 disabled:pointer-events-none border border-white/15 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all shrink-0 ml-1 sm:ml-3"
              aria-label="الصفحة التالية"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
