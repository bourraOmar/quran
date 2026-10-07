"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import AudioPlayer, { AudioPlayerRef } from "./AudioPlayer";

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
  translated_name: {
    name: string;
  };
  bismillah_pre: boolean;
}

export default function SurahReader({ 
  chapter, 
  verses,
  isTranslationEnabled
}: { 
  chapter: Chapter, 
  verses: Verse[],
  isTranslationEnabled: boolean
}) {
  
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const playerRef = useRef<AudioPlayerRef>(null);

  const [popupMenu, setPopupMenu] = useState<{ x: number; y: number; verseKey: string; translation?: string } | null>(null);
  const [showTranslationModal, setShowTranslationModal] = useState<{ verseKey: string; translation: string } | null>(null);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent, verseKey: string, translation?: string) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      setPopupMenu({ x: touch.clientX, y: touch.clientY, verseKey, translation });
    }, 500); // 500ms long press
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
    window.addEventListener('click', closePopup);
    window.addEventListener('scroll', closePopup);
    return () => {
      window.removeEventListener('click', closePopup);
      window.removeEventListener('scroll', closePopup);
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
    <div className="flex flex-col md:flex-row gap-12 w-full">
      
      {/* Right Sidebar - Sticky */}
      <div className={`w-full md:w-[350px] shrink-0 ${isReadingMode ? "hidden" : "block"}`}>
        <div className="sticky top-8 flex flex-col gap-6">
           
           {/* Menu Box */}
           <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-[#e2e8f0] dark:border-[#334155] p-6 shadow-sm">
             <h3 className="font-bold text-[#1e354d] dark:text-[#f8fafc] text-lg mb-4 text-right border-b border-[#e2e8f0] dark:border-[#334155] pb-4">فهرس السورة</h3>
             <ul className="flex flex-col gap-3 text-right">
               <li className="text-[#395675] dark:text-[#94a3b8] font-bold cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] p-2 rounded transition-colors">قراءة السورة</li>
               <li className="text-[#4a6b8c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#395675] dark:text-[#94a3b8] p-2 rounded transition-colors">استماع للسورة</li>
               <li className="text-[#4a6b8c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#395675] dark:text-[#94a3b8] p-2 rounded transition-colors">
                 <Link href={`/surah/${chapter.id}?showTranslation=${isTranslationEnabled ? 'false' : 'true'}`}>
                   {isTranslationEnabled ? "إخفاء التفسير" : "إظهار التفسير"}
                 </Link>
               </li>
               <li className="text-[#4a6b8c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#395675] dark:text-[#94a3b8] p-2 rounded transition-colors">
                 <Link href="/">العودة للفهرس</Link>
               </li>
             </ul>
           </div>
           
           {/* Player Box */}
           <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-[#e2e8f0] dark:border-[#334155] p-6 shadow-sm">
              <AudioPlayer 
                chapterId={chapter.id.toString()} 
                onVerseChange={handleVerseChange} 
              />
           </div>

        </div>
      </div>

      {/* Main Content - Left Side (Scrolling) */}
      <div className={`flex-1 text-right min-w-0 transition-all duration-300 ${isReadingMode ? "max-w-4xl mx-auto" : ""}`}>
        {/* Header Block */}
        <div className="mb-10 text-center md:text-right flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-4">
              سورة {chapter.name_arabic}
            </h1>
            <div className="text-[#4a6b8c] dark:text-[#94a3b8] text-lg font-medium">
              {chapter.revelation_place === "makkah" ? "مكية" : "مدنية"} • رقم السورة: {chapter.id} • عدد آياتها: {chapter.verses_count}
            </div>
          </div>
          
          <button 
            onClick={() => setIsReadingMode(!isReadingMode)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-xl text-[#395675] dark:text-[#94a3b8] hover:bg-[#f4f7f9] dark:hover:bg-[#334155] transition-colors"
          >
            {isReadingMode ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                <span className="text-sm font-bold">الوضع العادي</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                <span className="text-sm font-bold">وضع القراءة</span>
              </>
            )}
          </button>
        </div>

        {/* Surah Text Area */}
      <div className={`text-center leading-[2.5] md:leading-[2.8] text-[#1e354d] dark:text-[#f8fafc] font-medium ${isTranslationEnabled ? "" : "text-2xl md:text-4xl"} mb-16 bg-white dark:bg-[#1e293b] p-6 md:p-12 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-sm`}>
        {chapter.id !== 1 && chapter.id !== 9 && (
          <div className="flex justify-center mb-12">
            <img src="/img/basmalah.png" alt="بسم الله الرحمن الرحيم" className="max-w-[75%] md:max-w-[50%] dark:invert opacity-80" loading="lazy" />
          </div>
        )}

        <div className={isTranslationEnabled ? "flex flex-col gap-8 text-right select-none" : "inline-block text-center select-none"}>
          {verses.map((verse) => {
            const ayahNumber = verse.verse_key.split(":")[1];
            const isFatihaBasmalah = chapter.id === 1 && ayahNumber === "1";
            const isActive = activeVerseKey === verse.verse_key;
            
            // Highlight styling
            const highlightClass = isActive 
              ? "text-[#395675] dark:text-[#8ba7c0] bg-[#e8edf2] dark:bg-[#334155] rounded-xl px-2 py-1 transition-all duration-300" 
              : "transition-all duration-300";

            if (isTranslationEnabled) {
              return (
                <div 
                  key={verse.id} 
                  ref={isActive ? (activeVerseRef as React.RefObject<HTMLDivElement>) : null}
                  className={`pb-8 border-b border-[#e2e8f0] dark:border-[#334155] last:border-0 last:pb-0 ${isActive ? 'bg-[#f4f7f9] dark:bg-[#0f172a] p-4 rounded-xl -mx-4' : ''}`}
                  onContextMenu={(e) => handleContextMenu(e, verse.verse_key, verse.translation)}
                  onTouchStart={(e) => handleTouchStart(e, verse.verse_key, verse.translation)}
                  onTouchEnd={handleTouchEndOrMove}
                  onTouchMove={handleTouchEndOrMove}
                >
                  <div className={`text-2xl md:text-4xl font-quran font-normal mb-6 text-center md:text-right leading-loose flex flex-wrap items-center justify-center md:justify-start gap-4 ${highlightClass}`}>
                    {isFatihaBasmalah ? (
                      <>
                        <img src="/img/basmalah.png" alt="بسم الله الرحمن الرحيم" className="max-w-[70%] dark:invert opacity-80 inline-block" loading="lazy" />
                        <span className="text-[#395675] dark:text-[#94a3b8] mx-1 text-xl md:text-2xl">({ayahNumber})</span>
                      </>
                    ) : (
                      <>
                        {verse.text_uthmani} <span className="text-[#395675] dark:text-[#94a3b8] mx-1 font-sans text-2xl">({ayahNumber})</span>
                      </>
                    )}
                  </div>
                  {verse.translation && (
                    <div className="text-lg text-[#4a6b8c] dark:text-[#94a3b8] font-sans pt-4" dir="rtl" dangerouslySetInnerHTML={{ __html: verse.translation }} />
                  )}
                </div>
              );
            }
            if (isFatihaBasmalah) {
              return (
                <div 
                  key={verse.id}
                  className={`flex flex-col items-center justify-center w-full mb-8 mt-2 py-4 ${highlightClass}`}
                  ref={isActive ? (activeVerseRef as React.RefObject<HTMLDivElement>) : null}
                >
                  <div className="flex items-center justify-center w-full">
                    <img src="/img/basmalah.png" alt="بسم الله الرحمن الرحيم" className="max-w-[60%] md:max-w-[40%] dark:invert opacity-80" loading="lazy" />
                    <span className="text-[#395675] dark:text-[#94a3b8] mx-3 font-sans text-xl md:text-2xl">({ayahNumber})</span>
                  </div>
                </div>
              );
            }

            return (
              <span 
                key={verse.id} 
                
                ref={isActive ? (activeVerseRef as React.RefObject<HTMLSpanElement>) : null}
                onContextMenu={(e) => handleContextMenu(e, verse.verse_key, verse.translation)}
                onTouchStart={(e) => handleTouchStart(e, verse.verse_key, verse.translation)}
                onTouchEnd={handleTouchEndOrMove}
                onTouchMove={handleTouchEndOrMove}
                className={`font-quran font-normal leading-[2.5] md:leading-[2.8] cursor-pointer hover:text-[#395675] dark:hover:text-[#94a3b8] ${highlightClass}`}
              >
                {verse.text_uthmani} <span className="text-[#395675] dark:text-[#94a3b8] mx-1 font-sans text-xl md:text-2xl">({ayahNumber})</span>{' '}
              </span>
            );
          })}
        </div>
      </div>

      {/* Long Press Popup Menu */}
      {popupMenu && (
        <div 
          className="fixed z-50 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#e2e8f0] dark:border-[#334155] p-2 flex gap-3 items-center transform -translate-x-1/2 -translate-y-[120%]"
          style={{ top: popupMenu.y, left: popupMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
           <button 
             onClick={() => {
               console.log("Listen clicked. verseKey:", popupMenu.verseKey);
               console.log("playerRef current:", playerRef.current);
               if (playerRef.current) {
                 playerRef.current.playVerse(popupMenu.verseKey);
               } else {
                 alert("Player reference is missing!");
               }
               setPopupMenu(null);
             }}
             className="p-3 bg-[#f4f7f9] dark:bg-[#0f172a] hover:bg-[#e8edf2] dark:hover:bg-[#334155] rounded-xl text-[#395675] dark:text-[#94a3b8] transition-colors shadow-sm"
             aria-label="Listen to Verse"
           >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
           </button>

           {popupMenu.translation && (
             <button 
               onClick={() => {
                 setShowTranslationModal({ verseKey: popupMenu.verseKey, translation: popupMenu.translation! });
                 setPopupMenu(null);
               }}
               className="py-3 px-4 bg-[#f4f7f9] dark:bg-[#0f172a] hover:bg-[#e8edf2] dark:hover:bg-[#334155] rounded-xl text-[#395675] dark:text-[#94a3b8] transition-colors flex items-center gap-2 shadow-sm"
             >
               <span className="font-bold text-sm">تفسير الآية المحددة</span>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
           )}
        </div>
      )}

      {/* Translation Modal */}
      {showTranslationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowTranslationModal(null)}>
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-8 max-w-2xl w-full text-right shadow-2xl relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-[#1e293b] pb-4 border-b border-[#e2e8f0] dark:border-[#334155]">
              <button onClick={() => setShowTranslationModal(null)} className="text-[#4a6b8c] hover:text-red-500 transition-colors bg-[#f4f7f9] dark:bg-[#0f172a] p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="font-bold text-xl md:text-2xl text-[#1e354d] dark:text-[#f8fafc]">تفسير الآية ({showTranslationModal.verseKey.split(':')[1]})</h3>
            </div>
            <div className="text-lg md:text-xl text-[#395675] dark:text-[#94a3b8] leading-loose font-sans" dangerouslySetInnerHTML={{ __html: showTranslationModal.translation }} />
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
