/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import AudioPlayer, { AudioPlayerRef } from "./AudioPlayer";
import { QURAN_CHAPTERS } from "@/data/quranChapters";

interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  line_number: number;
  page_number: number;
  code_v1?: string;
  code_v2?: string;
  text?: string;
  text_uthmani?: string;
}

interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_imlaei?: string;
  translation?: string;
  code_v1?: string;
  v1_page?: number;
  v2_page?: number;
  words?: Word[];
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

// Specific lines in the Madinah Mushaf that are center-aligned (endings of Surahs or special layouts)
const CENTER_ALIGNED_PAGES = [1, 2];
const CENTER_ALIGNED_PAGE_LINES: Record<number, number[]> = {
  255: [2],
  528: [9],
  534: [6],
  545: [6],
  586: [1],
  593: [2],
  594: [5],
  600: [10],
  602: [5, 15],
  603: [10, 15],
  604: [4, 9, 14, 15],
};

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
    return QURAN_CHAPTERS.find((ch: any) => ch.id === chapter.id) || {
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

  // Collect all unique pages needed for King Fahad Complex web fonts
  const allRequiredPages = useMemo(() => {
    // Always include page 1 so the Bismillah calligraphy font 'p1' is loaded on every surah
    const set = new Set([1, ...pages]);
    verses.forEach((v) => {
      if (v.v1_page) set.add(v.v1_page);
      if (v.v2_page) set.add(v.v2_page);
      v.words?.forEach((w) => {
        if (w.page_number) set.add(w.page_number);
      });
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [pages, verses]);

  // Group words by page and line for authentic King Fahad Complex Mushaf layout
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

  // Keyboard navigation for reading mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isReadingMode) {
        setIsReadingMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadingMode]);

  // Audio sync with Verse / Page scrolling
  const handleVerseChange = (verseKey: string | null) => {
    if (!verseKey) {
      setActiveVerseKey(null);
      return;
    }
    setActiveVerseKey(verseKey);
    const element = document.getElementById(`verse-${verseKey}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      if (popupMenu) setPopupMenu(null);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [popupMenu]);

  // Context Menu / Long Press Handlers
  const handleContextMenu = (e: React.MouseEvent, verseKey: string, translation?: string) => {
    e.preventDefault();
    setPopupMenu({
      x: e.clientX,
      y: e.clientY,
      verseKey,
      translation,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, verseKey: string, translation?: string) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setPopupMenu({
        x: touch.clientX,
        y: touch.clientY,
        verseKey,
        translation,
      });
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Next and Previous chapter helpers
  const prevChapter = useMemo(() => {
    if (chapter.id <= 1) return null;
    return QURAN_CHAPTERS.find((c: any) => c.id === chapter.id - 1);
  }, [chapter.id]);

  const nextChapter = useMemo(() => {
    if (chapter.id >= 114) return null;
    return QURAN_CHAPTERS.find((c: any) => c.id === chapter.id + 1);
  }, [chapter.id]);

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full text-[#1e354d] dark:text-white">
      
      {/* Right Sidebar - Sticky (Hidden in reading mode) */}
      <div className={`w-full md:w-[340px] shrink-0 ${isReadingMode ? "hidden" : "block"}`}>
        <div className="sticky top-24 flex flex-col gap-6">
           
           {/* Menu Box */}
           <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-sm">
             <h3 className="font-bold text-[#1e354d] dark:text-white text-base mb-4 text-right border-b border-black/5 dark:border-white/5 pb-3">
               فهرس السورة
             </h3>
             <ul className="flex flex-col gap-2 text-right">
               <li className="bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] font-bold p-3 rounded-2xl flex items-center justify-between">
                 <span className="flex items-center gap-2">
                   <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                   </svg>
                   <span>مصحف مجمع الملك فهد</span>
                 </span>
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
                   className="flex items-center gap-2 text-[#4a6b8c] dark:text-[#8ba7c0] hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] hover:text-[#0f8e5d] dark:hover:text-[#4ade80] p-3 rounded-2xl font-medium transition-colors"
                 >
                   <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                   </svg>
                   <span>{isTranslationEnabled ? "إخفاء التفسير والترجمة" : "إظهار التفسير والترجمة"}</span>
                 </Link>
               </li>
               <li>
                 <Link 
                   href="/surahs"
                   className="flex items-center gap-2 text-[#4a6b8c] dark:text-[#8ba7c0] hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] hover:text-[#0f8e5d] dark:hover:text-[#4ade80] p-3 rounded-2xl font-medium transition-colors"
                 >
                   <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                   </svg>
                   <span>العودة لفهرس السور</span>
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

      {/* Main Content - Left Side (Continuous Scroll) */}
      <div className={`flex-1 text-right min-w-0 transition-all duration-300 ${isReadingMode ? "w-full max-w-[620px] mx-auto" : ""}`}>
        
        {/* Sticky Reading Mode Header */}
        {isReadingMode ? (
          <div className="sticky top-4 z-40 mb-6 w-full max-w-[620px] mx-auto px-4 sm:px-6 py-3 bg-white/95 dark:bg-[#121824]/95 backdrop-blur-md rounded-2xl border border-[#e2e8f0] dark:border-white/10 shadow-sm dark:shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-[#1e354d] dark:text-white">
                سورة {chapter.name_arabic}
              </h2>
              <span className="text-xs text-[#64748b] dark:text-gray-400 bg-[#f4f7f9] dark:bg-white/5 px-2.5 py-1 rounded-lg border border-[#e2e8f0] dark:border-white/5 hidden sm:inline">
                {chapter.revelation_place === "makkah" ? "مكية" : "مدنية"} • صفحة {toArabicDigits(activePageOnScroll)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f7f9] hover:bg-[#e8edf2] dark:bg-white/5 dark:hover:bg-white/10 text-[#334155] hover:text-[#0f172a] dark:text-gray-200 dark:hover:text-white rounded-xl border border-[#e2e8f0] dark:border-white/10 text-xs font-semibold transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="hidden sm:inline">ملء الشاشة</span>
              </button>

              <button
                onClick={() => setIsReadingMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f8e5d]/10 hover:bg-[#0f8e5d]/20 text-[#0f8e5d] dark:bg-white/10 dark:hover:bg-white/15 dark:text-white rounded-xl border border-[#0f8e5d]/30 dark:border-white/10 text-xs font-bold transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>الوضع العادي</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Header Block */
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm max-w-[620px] mx-auto w-full">
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
                مصحف مجمع الملك فهد
              </span>

              <button 
                onClick={() => setIsReadingMode(!isReadingMode)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-black/5 dark:border-white/5 transition-all text-xs font-bold shadow-sm bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-white hover:border-[#0f8e5d]/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>وضع القراءة</span>
              </button>
            </div>
          </div>
        )}

        {/* Preload King Fahad Complex V2 fonts for initial pages */}
        {allRequiredPages.slice(0, 5).map((p) => (
          <link
            key={`preload-p${p}`}
            rel="preload"
            href={`https://verses.quran.foundation/fonts/quran/hafs/v1/woff2/p${p}.woff2`}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}

        {/* Inject King Fahad Complex V2 and Surah Names Calligraphy Fonts */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'surahnames';
                src: url('https://verses.quran.foundation/fonts/quran/surah-names/v1/sura_names.woff2') format('woff2');
                font-display: swap;
              }
            ` + allRequiredPages
              .map(
                (p) => `
                  @font-face {
                    font-family: 'p${p}';
                    src: url('https://verses.quran.foundation/fonts/quran/hafs/v1/woff2/p${p}.woff2') format('woff2');
                    font-display: block;
                  }
                `
              )
              .join(" ")
          }}
        />

        {/* Translation Mode Layout */}
        {isTranslationEnabled ? (
          <div className="flex flex-col gap-6 mb-16">
            <div className="text-center leading-[2.5] md:leading-[2.8] text-[#1e354d] dark:text-[#f8fafc] font-medium mb-16 bg-white dark:bg-[#1e293b] p-6 md:p-12 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
              {chapter.id !== 1 && chapter.id !== 9 && (
                <div className="pb-8 text-center border-b border-black/5 dark:border-white/5 mb-8">
                  <span style={{ fontFamily: "p1" }} className="text-[clamp(16px,2.2vw,28px)] leading-[2] text-[#1e354d] dark:text-white inline-block">
                    ﭑ ﭒ ﭓ ﭔ
                  </span>
                </div>
              )}

              {verses.map((v) => {
                const isActive = activeVerseKey === v.verse_key;
                return (
                  <div 
                    key={v.id} 
                    id={`verse-${v.verse_key}`}
                    className={`p-4 sm:p-6 rounded-2xl mb-4 border transition-all text-right ${
                      isActive 
                        ? "bg-[#0f8e5d]/10 border-[#0f8e5d]/40 shadow-sm" 
                        : "bg-[#f4f7f9]/50 dark:bg-[#0f172a]/50 border-black/5 dark:border-white/5 hover:border-black/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1e354d]/5 dark:bg-white/5 text-[#4a6b8c] dark:text-[#8ba7c0]">
                        الآية {toArabicDigits(v.verse_number)}
                      </span>
                      <button 
                        onClick={() => {
                          if (playerRef.current) {
                            playerRef.current.playVerse(v.verse_key);
                          }
                        }}
                        className="text-xs font-bold text-[#0f8e5d] dark:text-[#4ade80] hover:underline flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>استماع</span>
                      </button>
                    </div>

                    <p 
                      style={{ fontFamily: (v.v1_page || v.v2_page) ? `p${v.v1_page || v.v2_page}` : "var(--font-quran, serif)" }} 
                      className="text-2xl sm:text-3xl leading-[2.2] sm:leading-[2.4] text-[#1e354d] dark:text-white mb-4 select-none"
                    >
                      {v.words && v.words.length > 0 ? (
                        v.words.map((w) => (
                          <span 
                            key={w.id} 
                            style={{ fontFamily: `p${w.page_number}` }}
                            className="inline-block mx-0.5"
                          >
                            {w.code_v1 || w.code_v2 || w.text || w.text_uthmani}
                          </span>
                        ))
                      ) : (
                        v.text_uthmani
                      )}
                    </p>

                    {v.translation && (
                      <div 
                        className="text-sm sm:text-base text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed pt-3 border-t border-black/5 dark:border-white/5"
                        dangerouslySetInnerHTML={{ __html: v.translation }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Official King Fahad Complex Centered Mushaf Layout (Identical to Quran.com - Continuous Scroll) */
          <div className="flex flex-col items-center mb-16">
            {pages.map((p) => {
              const linesMap = pagesData[p] || {};
              const lineNumbers = Object.keys(linesMap).map(Number).sort((a, b) => a - b);

              return (
                <div
                  key={p}
                  id={`surah-page-${p}`}
                  className="w-full max-w-[650px] mx-auto py-6 sm:py-8 flex flex-col items-center justify-between transition-all"
                >
                  {/* Bismillah Header (Identical word-by-word layout and spacing as Fatiha) */}
                  {p === chapterMeta.start_page && chapter.id !== 1 && chapter.id !== 9 && (
                    <div
                      className="w-full flex flex-nowrap items-center justify-center gap-0.5 sm:gap-1 pt-1 pb-3 select-none"
                      dir="rtl"
                    >
                      {["ﭑ", "ﭒ", "ﭓ", "ﭔ"].map((glyph, idx) => (
                        <span
                          key={idx}
                          style={{ fontFamily: "p1" }}
                          className="text-[clamp(17px,2.2vw,22px)] sm:text-[clamp(19px,2.1vw,23.5px)] md:text-[23.5px] leading-[2.15] text-[#1e354d] dark:text-white inline-block select-none"
                        >
                          {glyph}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mushaf Page Lines - Natural Arabic Calligraphy (Identical on all pages including 1 & 2) */}
                  <div className="w-full flex flex-col items-center justify-center gap-0.5 sm:gap-1 my-auto py-1">
                    {lineNumbers.map((lineNum) => {
                      const lineWords = linesMap[lineNum] || [];
                      const isOpeningPage = CENTER_ALIGNED_PAGES.includes(p);
                      const isCenterAlignedLine = Boolean(CENTER_ALIGNED_PAGE_LINES[p]?.includes(lineNum));
                      const isShortLine = lineWords.length <= 4;
                      const isCentered = isOpeningPage || isCenterAlignedLine || isShortLine;

                      return (
                        <div
                          key={lineNum}
                          className="w-full flex flex-nowrap whitespace-nowrap items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 py-0 sm:py-0.5 transition-colors select-none"
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
                                onTouchStart={(e) => {
                                  const matchingVerse = verses.find(v => v.verse_key === w.verseKey);
                                  handleTouchStart(e, w.verseKey, matchingVerse?.translation);
                                }}
                                onTouchEnd={handleTouchEnd}
                                className={`text-[clamp(18px,2.4vw,24px)] sm:text-[23px] md:text-[25px] leading-[1.75] sm:leading-[1.85] md:leading-[1.95] inline-block cursor-pointer transition-colors duration-200 select-none ${
                                  isWordActive
                                    ? "text-[#0f8e5d] dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(15,142,93,0.35)] dark:drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] font-semibold"
                                    : "text-[#1e293b] dark:text-white hover:text-[#0f8e5d] dark:hover:text-emerald-300"
                                }`}
                              >
                                {w.code_v1 || w.code_v2 || w.text || w.text_uthmani}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Centered Page Number at Bottom */}
                  <div className="w-full text-center pt-8 pb-2 text-sm sm:text-base font-semibold text-[#64748b] dark:text-gray-400 select-none">
                    {toArabicDigits(p)}
                  </div>
                </div>
              );
            })}

            {/* End of Surah Completion Card (Same width and styling as Mushaf page container) */}
            <div className="w-full max-w-[620px] mx-auto bg-white dark:bg-[#121824] rounded-3xl border border-[#e2e8f0] dark:border-white/10 p-6 sm:p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] mb-16 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#1e354d] dark:text-white">
                  تمت بحمد الله قراءة سورة {chapter.name_arabic}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748b] dark:text-gray-400 mt-1">
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f4f7f9] hover:bg-[#e8edf2] dark:bg-white/5 dark:hover:bg-white/10 border border-[#e2e8f0] dark:border-white/10 text-[#334155] hover:text-[#0f172a] dark:text-gray-200 dark:hover:text-white font-bold text-sm transition-all"
                  >
                    <span>سورة {prevChapter.name_arabic}</span>
                  </Link>
                )}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#f4f7f9] hover:bg-[#e8edf2] dark:bg-white/5 dark:hover:bg-white/10 border border-[#e2e8f0] dark:border-white/10 text-[#334155] hover:text-[#0f172a] dark:text-gray-300 dark:hover:text-white font-bold text-sm transition-all"
                >
                  <span>الرجوع لأعلى السورة</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
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
               className="p-2 hover:bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] rounded-xl text-xs font-bold flex items-center gap-1"
               title="تشغيل التلاوة"
             >
               <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                 <path d="M8 5v14l11-7z"/>
               </svg>
               <span>تشغيل</span>
             </button>
             {popupMenu.translation && (
               <button 
                 onClick={() => {
                   setShowTranslationModal({
                     verseKey: popupMenu.verseKey,
                     translation: popupMenu.translation!,
                   });
                   setPopupMenu(null);
                 }}
                 className="p-2 hover:bg-[#1e354d]/5 dark:hover:bg-white/5 text-[#1e354d] dark:text-white rounded-xl text-xs font-bold flex items-center gap-1 border-r border-black/5 dark:border-white/10 pr-2"
                 title="عرض التفسير"
               >
                 <span>تفسير</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
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
