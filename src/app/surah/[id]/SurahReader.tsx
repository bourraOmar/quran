"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import AudioPlayer from "./AudioPlayer";

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
      <div className="w-full md:w-[350px] shrink-0">
        <div className="sticky top-8 flex flex-col gap-6">
           
           {/* Menu Box */}
           <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-[#e2e8f0] dark:border-[#334155] p-6 shadow-sm">
             <h3 className="font-bold text-[#1e354d] dark:text-[#f8fafc] text-lg mb-4 text-right border-b border-[#e2e8f0] dark:border-[#334155] pb-4">فهرس السورة</h3>
             <ul className="flex flex-col gap-3 text-right">
               <li className="text-[#6b8ba7] dark:text-[#94a3b8] font-bold cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] p-2 rounded transition-colors">قراءة السورة</li>
               <li className="text-[#5a7b9c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#6b8ba7] dark:text-[#94a3b8] p-2 rounded transition-colors">استماع للسورة</li>
               <li className="text-[#5a7b9c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#6b8ba7] dark:text-[#94a3b8] p-2 rounded transition-colors">
                 <Link href={`/surah/${chapter.id}?showTranslation=${isTranslationEnabled ? 'false' : 'true'}`}>
                   {isTranslationEnabled ? "إخفاء الترجمة" : "إظهار الترجمة"}
                 </Link>
               </li>
               <li className="text-[#5a7b9c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#6b8ba7] dark:text-[#94a3b8] p-2 rounded transition-colors">
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
      <div className="flex-1 text-right min-w-0">
        {/* Header Block */}
        <div className="mb-10 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-4">
            سورة {chapter.name_arabic}
          </h1>
          <div className="text-[#5a7b9c] dark:text-[#94a3b8] text-lg mb-8 font-medium">
            {chapter.revelation_place === "makkah" ? "مكية" : "مدنية"} • رقم السورة: {chapter.id} • عدد آياتها: {chapter.verses_count}
          </div>
        </div>

        {/* Surah Text Area */}
      <div className={`text-center leading-[2.5] md:leading-[2.8] text-[#1e354d] dark:text-[#f8fafc] font-medium ${isTranslationEnabled ? "" : "text-2xl md:text-4xl"} mb-16 bg-white dark:bg-[#1e293b] p-6 md:p-12 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-sm`}>
        {chapter.id !== 1 && chapter.id !== 9 && (
          <div className="flex justify-center mb-12">
            <img src="/img/basmalah.png" alt="بسم الله الرحمن الرحيم" className="max-w-[75%] md:max-w-[50%] dark:invert opacity-80" loading="lazy" />
          </div>
        )}

        <div className={isTranslationEnabled ? "flex flex-col gap-8 text-right" : "inline-block text-center"}>
          {verses.map((verse) => {
            const ayahNumber = verse.verse_key.split(":")[1];
            const isFatihaBasmalah = chapter.id === 1 && ayahNumber === "1";
            const isActive = activeVerseKey === verse.verse_key;
            
            // Highlight styling
            const highlightClass = isActive 
              ? "text-[#6b8ba7] dark:text-[#8ba7c0] bg-[#e8edf2] dark:bg-[#334155] rounded-xl px-2 py-1 transition-all duration-300" 
              : "transition-all duration-300";

            if (isTranslationEnabled) {
              return (
                <div 
                  key={verse.id} 
                  ref={isActive ? (activeVerseRef as React.RefObject<HTMLDivElement>) : null}
                  className={`pb-8 border-b border-[#e2e8f0] dark:border-[#334155] last:border-0 last:pb-0 ${isActive ? 'bg-[#f4f7f9] dark:bg-[#0f172a] p-4 rounded-xl -mx-4' : ''}`}
                >
                  <div className={`text-2xl md:text-4xl font-quran font-normal mb-6 text-center md:text-right leading-loose flex flex-wrap items-center justify-center md:justify-start gap-4 ${highlightClass}`}>
                    {isFatihaBasmalah ? (
                      <>
                        <img src="/img/basmalah.png" alt="بسم الله الرحمن الرحيم" className="max-w-[70%] dark:invert opacity-80 inline-block" loading="lazy" />
                        <span className="text-[#6b8ba7] dark:text-[#94a3b8] mx-1 text-xl md:text-2xl">({ayahNumber})</span>
                      </>
                    ) : (
                      <>
                        {verse.text_uthmani} <span className="text-[#6b8ba7] dark:text-[#94a3b8] mx-1 font-sans text-2xl">({ayahNumber})</span>
                      </>
                    )}
                  </div>
                  {verse.translation && (
                    <div className="text-lg text-[#5a7b9c] dark:text-[#94a3b8] font-sans pt-4" dir="ltr" dangerouslySetInnerHTML={{ __html: verse.translation }} />
                  )}
                </div>
              );
            }
            return (
              <span 
                key={verse.id} 
                className={`font-quran font-normal ${highlightClass}`}
                ref={isActive ? (activeVerseRef as React.RefObject<HTMLSpanElement>) : null}
              >
                {isFatihaBasmalah ? (
                  <div className="flex items-center justify-center w-full mb-8 mt-2">
                    <img src="/img/basmalah.png" alt="بسم الله الرحمن الرحيم" className="max-w-[60%] md:max-w-[40%] dark:invert opacity-80" loading="lazy" />
                    <span className="text-[#6b8ba7] dark:text-[#94a3b8] mx-3 font-sans text-xl md:text-2xl">({ayahNumber})</span>
                  </div>
                ) : (
                  <>{verse.text_uthmani} <span className="text-[#6b8ba7] dark:text-[#94a3b8] mx-1 font-sans text-xl md:text-2xl">({ayahNumber})</span> </>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}
