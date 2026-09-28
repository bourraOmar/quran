"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  revelation_place: string;
  verses_count: number;
}

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translation?: string;
}

interface HomeAudioSectionProps {
  surahs: Chapter[];
}

export default function HomeAudioSection({ surahs }: HomeAudioSectionProps) {
  const [activeSurahId, setActiveSurahId] = useState<number>(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Verses when activeSurahId changes
  useEffect(() => {
    async function fetchVerses() {
      try {
        // Fetch Arabic text
        const arRes = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${activeSurahId}`);
        const arData = await arRes.json();
        
        // Fetch English Translation (131 = Dr. Mustafa Khattab)
        const trRes = await fetch(`https://api.quran.com/api/v4/quran/translations/131?chapter_number=${activeSurahId}`);
        const trData = await trRes.json();

        // Merge them
        const merged: Verse[] = arData.verses.map((v: any, i: number) => ({
          ...v,
          translation: trData.translations[i]?.text
        }));

        setVerses(merged);
      } catch (error) {
        console.error("Failed to fetch verses:", error);
      }
    }
    fetchVerses();
  }, [activeSurahId]);

  // Fetch Audio URL when activeSurahId changes
  useEffect(() => {
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    // Fetch reciter 2 (AbdulBaset) for the selected chapter
    fetch(`https://api.quran.com/api/v4/chapter_recitations/2/${activeSurahId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.audio_file) {
          setAudioUrl(data.audio_file.audio_url);
        }
      })
      .catch((err) => console.error(err));
  }, [activeSurahId]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const activeSurah = surahs.find(s => s.id === activeSurahId);

  return (
    <section id="audio" className="w-full bg-[#1e293b] py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* Top Row: Title & Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white text-right leading-tight">
            استمع للقرآن الكريم<br/>مع الترجمة
          </h2>
          <Link href={`/surah/${activeSurahId}`} className="bg-[#6b8ba7] text-white px-8 py-3 rounded-full font-bold hover:bg-[#537592] transition-colors shadow-lg">
            ابدأ الاستماع
          </Link>
        </div>

        {/* Bottom Row: Two Columns */}
        <div className="flex flex-col lg:flex-row gap-6">
           
           {/* Right Column: Surahs List (35%) */}
           <div className="w-full lg:w-[35%] bg-[#0f172a] rounded-3xl border border-[#334155] p-4 flex flex-col gap-2 h-[500px] overflow-y-auto custom-scrollbar">
             {surahs.map((surah) => {
               const isActive = surah.id === activeSurahId;
               return (
                 <div 
                   key={surah.id} 
                   onClick={() => setActiveSurahId(surah.id)}
                   className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-[#6b8ba7]/20 border border-[#6b8ba7]/30' : 'hover:bg-[#1e293b] border border-transparent'}`}
                 >
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center rounded ${isActive ? 'bg-[#6b8ba7] text-white' : 'bg-white dark:bg-[#1e293b] text-[#0f172a]'} font-bold text-sm shrink-0`}>
                        {surah.id.toString().padStart(2, '0')}
                      </div>
                      <div className="text-left" dir="ltr">
                        <h4 className="text-white font-bold">{surah.name_simple}</h4>
                        <p className="text-[#94a3b8] text-xs">{surah.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <h4 className={`font-serif font-bold ${isActive ? 'text-[#6b8ba7] dark:text-[#94a3b8]' : 'text-white'}`}>{surah.name_arabic}</h4>
                      <p className="text-[#94a3b8] text-xs">{surah.verses_count} آيات</p>
                   </div>
                 </div>
               )
             })}
           </div>

           {/* Left Column: Verses & Player (65%) */}
           <div className="w-full lg:w-[65%] bg-[#0f172a] rounded-3xl border border-[#334155] p-6 flex flex-col relative h-[500px]">
             
             {/* Translation Header */}
             <div className="text-[#94a3b8] text-sm mb-6 border-b border-[#334155] pb-4 text-left" dir="ltr">
               Translation by<br/>
               <span className="text-white">— Dr. Mustafa Khattab, the Clear Quran <Link href={`/surah/${activeSurahId}`} className="text-[#6b8ba7] dark:text-[#94a3b8] cursor-pointer hover:underline">(Open Full Reader)</Link></span>
             </div>

             {/* Verses List */}
             <div className="flex flex-col gap-8 flex-1 overflow-y-auto custom-scrollbar pb-24" dir="ltr">
                {verses.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[#6b8ba7] dark:text-[#94a3b8]">Loading verses...</div>
                ) : (
                  verses.map((v) => {
                    const ayahNumber = v.verse_key.split(":")[1];
                    return (
                      <div key={v.id} className="border-b border-[#334155]/50 pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[#6b8ba7] dark:text-[#94a3b8] font-bold">{v.verse_key}</span>
                          <span className="text-white font-serif text-2xl text-right leading-loose ml-4">{v.text_uthmani}</span>
                        </div>
                        {v.translation && (
                          <p className="text-[#cbd5e1] mb-4" dangerouslySetInnerHTML={{ __html: v.translation }} />
                        )}
                        <div className="flex gap-4 text-[#94a3b8]">
                          <svg className="w-5 h-5 cursor-pointer hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <Link href={`/surah/${activeSurahId}`}>
                             <svg className="w-5 h-5 cursor-pointer hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </Link>
                        </div>
                      </div>
                    )
                  })
                )}
             </div>

             {/* Sticky Player Bar */}
             <div className="absolute bottom-6 left-6 right-6 bg-[#1e293b] rounded-2xl border border-[#334155] p-4 flex items-center justify-between shadow-lg" dir="ltr">
                <span className="text-[#94a3b8] text-sm w-12">{formatTime(currentTime)}</span>
                
                <div className="flex items-center gap-6 text-white">
                  <svg className="w-5 h-5 cursor-not-allowed text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                  
                  <button onClick={togglePlay} disabled={!audioUrl} className="disabled:opacity-50 hover:scale-110 transition-transform">
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    )}
                  </button>

                  <svg className="w-5 h-5 cursor-not-allowed text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" /></svg>
                </div>

                <span className="text-[#94a3b8] text-sm w-12 text-right">{formatTime(duration)}</span>

                {/* Progress Line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[3px] bg-[#334155] rounded-t-2xl overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    if (audioRef.current && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = pos * duration;
                    }
                  }}
                >
                   <div 
                     className="h-full bg-[#6b8ba7] transition-all duration-100"
                     style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                   ></div>
                </div>
             </div>

           </div>
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={handleTimeUpdate}
          />
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </section>
  );
}
