"use client";

import { useState, useRef, useEffect } from "react";

interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name?: { name: string };
  server: string;
}

interface ReciterPlaylistProps {
  surahs: Chapter[];
  reciter: Reciter;
}

export default function ReciterPlaylist({ surahs, reciter }: ReciterPlaylistProps) {
  const [activeSurahId, setActiveSurahId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!activeSurahId) return;

    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    const paddedId = activeSurahId.toString().padStart(3, "0");
    setAudioUrl(`${reciter.server}${paddedId}.mp3`);
  }, [activeSurahId, reciter.server]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const playNext = () => {
    if (!activeSurahId) return;
    if (activeSurahId < 114) {
      setActiveSurahId(activeSurahId + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const playPrev = () => {
    if (!activeSurahId) return;
    if (activeSurahId > 1) {
      setActiveSurahId(activeSurahId - 1);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const activeSurah = surahs.find((s) => s.id === activeSurahId);

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
            {reciter.translated_name?.name || reciter.reciter_name}
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
            if (!activeSurahId) setActiveSurahId(1);
            else togglePlay();
          }} 
          className="w-16 h-16 rounded-full bg-[#6b8ba7] text-white flex items-center justify-center hover:bg-[#537592] hover:scale-105 transition-all shadow-xl"
        >
          {isPlaying ? (
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
                onClick={() => setActiveSurahId(surah.id)}
                className={`grid grid-cols-[40px_minmax(0,1fr)_100px_100px] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors group items-center ${
                  isActive ? "bg-[#6b8ba7]/10" : "hover:bg-black/5"
                }`}
              >
                <div className="text-center flex items-center justify-center w-6 h-6 mx-auto">
                  {isActive && isPlaying ? (
                    <svg className="w-4 h-4 text-[#6b8ba7] dark:text-[#94a3b8] animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z"/></svg>
                  ) : isActive ? (
                    <span className="text-[#6b8ba7] dark:text-[#94a3b8] font-bold">{surah.id}</span>
                  ) : (
                    <>
                      <span className="text-[#5a7b9c] dark:text-[#94a3b8] group-hover:hidden">{surah.id}</span>
                      <svg className="w-4 h-4 text-[#1e354d] dark:text-[#f8fafc] hidden group-hover:block ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                    </>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className={`font-bold text-lg ${isActive ? "text-[#6b8ba7] dark:text-[#94a3b8]" : "text-[#1e354d] dark:text-[#f8fafc]"}`}>
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

      {/* Global Fixed Player */}
      {activeSurahId && activeSurah && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-11/12 max-w-[380px] bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl md:bg-white md:dark:bg-[#1e293b] rounded-3xl md:rounded-none border border-[#e2e8f0] dark:border-white/10 md:bottom-0 md:left-0 md:translate-x-0 md:w-full md:max-w-none p-6 md:px-12 md:py-4 flex flex-col md:flex-row items-center justify-between shadow-2xl z-40 gap-6 md:gap-4" dir="ltr">
           
           {/* Mobile Album Art (Hidden on desktop) */}
           <div className="md:hidden w-32 h-32 bg-gradient-to-br from-[#6b8ba7] to-[#4a6b8c] rounded-2xl flex items-center justify-center text-white shadow-lg mb-2">
             <span className="font-quran text-5xl leading-none">{activeSurah.name_arabic.replace('سورة ', '')}</span>
           </div>

           {/* Track Info */}
           <div className="flex items-center justify-center md:justify-start gap-4 w-full md:w-auto text-center md:text-left">
             <div className="hidden md:flex w-12 h-12 bg-[#6b8ba7] rounded-lg items-center justify-center text-white font-quran font-bold text-xl shrink-0">
               {activeSurah.name_arabic.replace('سورة ', '')}
             </div>
             <div>
               <h4 className="font-bold text-[#1e354d] dark:text-[#f8fafc] text-xl md:text-lg leading-tight">{activeSurah.name_simple}</h4>
               <p className="text-sm text-[#5a7b9c] dark:text-[#94a3b8] mt-1 md:mt-0">{reciter.translated_name?.name || reciter.reciter_name}</p>
             </div>
           </div>

           {/* Progress Bar (Mobile: below title, Desktop: inline) */}
           <div className="flex-1 w-full max-w-2xl flex flex-col items-center gap-4 md:gap-2">
             
             {/* Mobile Progress */}
             <div className="flex md:hidden items-center w-full gap-3 text-xs font-medium text-[#5a7b9c] dark:text-[#94a3b8] mb-2">
               <span>{formatTime(currentTime)}</span>
               <div 
                 className="flex-1 h-2 bg-[#e2e8f0] dark:bg-[#334155] rounded-full overflow-hidden cursor-pointer relative"
                 onClick={(e) => {
                   if (audioRef.current && duration) {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pos = (e.clientX - rect.left) / rect.width;
                     audioRef.current.currentTime = pos * duration;
                   }
                 }}
               >
                 <div className="absolute top-0 left-0 h-full bg-[#6b8ba7] rounded-full" style={{ width: duration ? `${(currentTime/duration)*100}%` : '0%' }}></div>
               </div>
               <span>{formatTime(duration)}</span>
             </div>

             {/* Controls */}
             <div className="flex items-center gap-8 md:gap-6 text-[#1e354d] dark:text-[#f8fafc]">
               <button onClick={playPrev} disabled={activeSurahId === 1} className="hover:text-[#6b8ba7] dark:text-[#94a3b8] disabled:opacity-30 transition-colors">
                 <svg className="w-8 h-8 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
               </button>
               <button onClick={togglePlay} className="w-16 h-16 md:w-12 md:h-12 rounded-full bg-[#6b8ba7] text-white flex items-center justify-center hover:bg-[#537592] hover:scale-105 transition-all shadow-[0_4px_20px_rgba(107,139,167,0.4)]">
                 {isPlaying ? (
                   <svg className="w-8 h-8 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                 ) : (
                   <svg className="w-8 h-8 md:w-6 md:h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                 )}
               </button>
               <button onClick={playNext} disabled={activeSurahId === 114} className="hover:text-[#6b8ba7] dark:text-[#94a3b8] disabled:opacity-30 transition-colors">
                 <svg className="w-8 h-8 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 14.832A1 1 0 0010 14v-2.798L4.555 14.832A1 1 0 003 14V6a1 1 0 001.555-.832L10 8.798V6a1 1 0 001.555-.832l6 4a1 1 0 000 1.664l-6 4z" /></svg>
               </button>
             </div>
             
             {/* Desktop Progress */}
             <div className="hidden md:flex items-center w-full gap-4 text-xs font-medium text-[#5a7b9c] dark:text-[#94a3b8]">
               <span>{formatTime(currentTime)}</span>
               <div 
                 className="flex-1 h-1.5 bg-[#e2e8f0] dark:bg-[#334155] rounded-full overflow-hidden cursor-pointer relative"
                 onClick={(e) => {
                   if (audioRef.current && duration) {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pos = (e.clientX - rect.left) / rect.width;
                     audioRef.current.currentTime = pos * duration;
                   }
                 }}
               >
                 <div className="absolute top-0 left-0 h-full bg-[#6b8ba7] rounded-full" style={{ width: duration ? `${(currentTime/duration)*100}%` : '0%' }}></div>
               </div>
               <span>{formatTime(duration)}</span>
             </div>
           </div>

           {/* Close Button Mobile (top right absolute) and Desktop (flex inline) */}
           <div className="absolute top-4 right-4 md:static">
             <button onClick={() => setActiveSurahId(null)} className="text-[#5a7b9c] dark:text-[#94a3b8] hover:text-[#1e354d] dark:text-[#f8fafc] transition-colors p-2 bg-[#f4f7f9] dark:bg-[#334155] md:bg-transparent rounded-full">
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
           </div>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={playNext}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
