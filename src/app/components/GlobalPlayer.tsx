"use client";

import React, { useState, useEffect } from "react";
import { useGlobalAudio } from "../context/GlobalAudioContext";

export default function GlobalPlayer() {
  const {
    activeSurahId,
    activeSurah,
    reciter,
    isPlaying,
    audioUrl,
    currentTime,
    duration,
    audioRef,
    closePlayer,
    togglePlay,
    playNext,
    playPrev,
    handleTimeUpdate,
    handleEnded,
    setIsPlaying,
    isRepeating,
    isShuffling,
    toggleRepeat,
    toggleShuffle,
    verseTimings,
    isTimingLoading
  } = useGlobalAudio();

  const [isMaximized, setIsMaximized] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [verses, setVerses] = useState<{ id: number; verse_key: string; text_uthmani: string }[]>([]);
  const lastActiveVerseId = React.useRef<number | null>(null);
  const activeVerseRef = React.useRef<any>(null);

  
  

  useEffect(() => {
    if (activeVerseRef.current && showLyrics) {
      activeVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, showLyrics]);

  // Auto-scroll logic
  useEffect(() => {
    if (!showLyrics || verses.length === 0 || verseTimings.length === 0) return;
    
    const currentTimeMs = currentTime * 1000;
    const activeVerse = verses.find(verse => {
      const timing = verseTimings.find(t => t.verse_key === verse.verse_key);
      const index = verseTimings.findIndex(t => t.verse_key === verse.verse_key);
      const nextTiming = verseTimings[index + 1];
      
      if (!timing) return false;
      
      // Active if current time is past this verse's start, AND (there is no next verse, or current time is before next verse's start)
      return currentTimeMs >= timing.timestamp_from && (!nextTiming || currentTimeMs < nextTiming.timestamp_from);
    });

    if (activeVerse && activeVerse.id !== lastActiveVerseId.current) {
      lastActiveVerseId.current = activeVerse.id;
      // Slight delay to allow CSS class to apply before calculating scroll position
      const el = document.getElementById(`verse-${activeVerse.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, showLyrics, verses, verseTimings, activeSurahId]);

  useEffect(() => {
    if (showLyrics && activeSurahId && verses.length === 0) {
      fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${activeSurahId}`)
        .then(res => res.json())
        .then(data => setVerses(data.verses || []))
        .catch(err => console.error("Failed to fetch verses", err));
    }
  }, [showLyrics, activeSurahId]);

  // Reset verses and states if surah changes or player closes
  useEffect(() => {
    setVerses([]);
    if (!activeSurahId) {
      setIsMaximized(false);
      setShowLyrics(false);
    }
  }, [activeSurahId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted, audioUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMaximized) {
        setIsMaximized(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Prevent scrolling on the body when the player is maximized
    if (isMaximized) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMaximized]);

  const toggleFullscreen = () => {
    setIsMaximized(!isMaximized);
  };

  if (!activeSurahId || !activeSurah || !reciter) {
    return null;
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    
    // Support RTL by flipping the position if document is RTL
    if (document.documentElement.dir === "rtl") {
      pos = 1 - pos;
    }
    
    const newVol = Math.max(0, Math.min(1, pos));
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVol === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  const progressPercent = duration ? `${(currentTime / duration) * 100}%` : "0%";

  
  let currentActiveKey = null;
  if (showLyrics && verses.length > 0 && verseTimings.length > 0) {
    const currentTimeMs = currentTime * 1000;
    for (let i = 0; i < verseTimings.length; i++) {
      const current = verseTimings[i];
      const next = verseTimings[i+1];
      if (currentTimeMs >= current.timestamp_from && (!next || currentTimeMs < next.timestamp_from)) {
        currentActiveKey = current.verse_key;
        break;
      }
    }
  }

  return (
    <>
      {/* ---------------------------------------------------------------------- */}
      {/* 1. MOBILE MAXIMIZED FULLSCREEN (Takes whole screen, huge controls) */}
      {/* ---------------------------------------------------------------------- */}
      {isMaximized && (
        <div className="md:hidden fixed inset-0 w-full h-full bg-gradient-to-b from-[#4a6b8c] to-[#0f172a] z-[100] flex flex-col p-6 animate-in fade-in duration-300" dir="ltr">
          {/* Top Bar */}
          <div className="flex justify-between items-center w-full mb-auto text-white/80">
            {showLyrics ? (
              <div className="flex flex-col">
                <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">تلاوة سورة</span>
                <span className="font-bold text-white text-lg">{activeSurah.name_simple}</span>
              </div>
            ) : (
              <div></div>
            )}
            <button onClick={toggleFullscreen} className="hover:text-white transition flex items-center gap-2 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="text-sm">تصغير</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          {/* Center huge art */}
          {showLyrics ? (
            <div className="flex-1 flex flex-col items-center justify-start min-h-0 py-4 relative w-full overflow-hidden mask-image-fade" dir="rtl">
              {verses.length > 0 ? (
                <div className="w-full h-full overflow-y-auto px-4 hide-scrollbar flex flex-col gap-10 pb-32 pt-8">
                  {verseTimings.length === 0 && (
                    <div className="text-white/50 text-sm text-center mb-4 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 mx-auto w-max">
                      المزامنة التلقائية غير متوفرة
                    </div>
                  )}
                  {verses.map((verse) => {
                    const isActive = currentActiveKey === verse.verse_key;
                    return (
                      <p 
                        key={verse.id}
                        id={`verse-${verse.id}`} ref={isActive ? (activeVerseRef as any) : null} 
                        className={`transition-all duration-500 font-quran text-center leading-[1.8] cursor-pointer w-full text-4xl md:text-5xl ${isActive ? 'text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-white/30 blur-[1px] hover:blur-none'}`}
                      >
                        {verse.text_uthmani}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 text-xl font-medium animate-pulse">جاري التحميل...</div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-8">
              <div className="w-[280px] h-[280px] bg-[#1e354d] rounded-2xl flex items-center justify-center text-white shadow-2xl mb-8 border border-white/10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#4a6b8c]/20 to-transparent"></div>
                 <span className="font-quran text-7xl leading-none drop-shadow-xl z-10">{activeSurah.name_arabic.replace('سورة ', '')}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3 text-center">{activeSurah.name_simple}</h1>
              <p className="text-lg text-white/70 text-center font-medium">{reciter.reciter_name}</p>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="w-full mx-auto flex flex-col gap-8 pb-4">
            {/* Progress */}
            <div className="flex items-center w-full gap-4 text-sm font-medium text-white/60">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative group" onClick={handleSeek}>
                <div className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-[#8ba7c0] transition-colors" style={{ width: progressPercent }}></div>
              </div>
              <span className="w-10 text-left">{formatTime(duration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between w-full px-6 text-white">
              {/* Lyrics Toggle */}
              <button 
                onClick={() => setShowLyrics(!showLyrics)} 
                className={`transition-colors relative ${showLyrics ? "text-[#4ade80]" : "text-white/70 hover:text-white"}`} 
                title="الآيات"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
                {showLyrics && <div className="w-1 h-1 bg-[#4ade80] rounded-full mx-auto absolute -bottom-2 left-1/2 -translate-x-1/2"></div>}
              </button>

              <div className="flex items-center gap-6">
                <button onClick={playPrev} disabled={activeSurahId === 1} className="hover:text-white/70 disabled:opacity-30 transition-colors">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
                </button>
                
                <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-white text-[#0f172a] flex items-center justify-center hover:scale-105 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.2)]">
                  {isPlaying ? (
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                  )}
                </button>
                
                <button onClick={playNext} disabled={activeSurahId === 114} className="hover:text-white/70 disabled:opacity-30 transition-colors">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 14.832A1 1 0 0010 14v-2.798L4.555 14.832A1 1 0 003 14V6a1 1 0 001.555-.832L10 8.798V6a1 1 0 001.555-.832l6 4a1 1 0 000 1.664l-6 4z" /></svg>
                </button>
              </div>

              {/* Repeat Toggle */}
              <button 
                onClick={toggleRepeat} 
                className={`transition-colors relative ${isRepeating ? "text-[#4ade80]" : "text-white/70 hover:text-white"}`} 
                title="تكرار"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
                {isRepeating && <div className="w-1 h-1 bg-[#4ade80] rounded-full mx-auto absolute -bottom-2 left-1/2 -translate-x-1/2"></div>}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------------------- */}
      {/* 2. DESKTOP MAXIMIZED OVERLAY (Spotify "Now Playing" view)             */}
      {/* Sits right above the bottom player (bottom-[90px])                     */}
      {/* ---------------------------------------------------------------------- */}
      {isMaximized && (
        <div className="hidden md:flex fixed inset-0 bottom-[90px] w-full bg-gradient-to-b from-[#6b8ba7] to-[#1e354d] dark:from-[#33506b] dark:to-[#0f172a] z-[30] flex-col p-6 px-8 animate-in fade-in duration-300" dir="ltr">
          {/* Top Bar (Title on left, Minimize on right) */}
          <div className="flex justify-between items-center w-full">
            <h2 className="text-white font-bold text-[16px] drop-shadow-sm">{activeSurah.name_simple}</h2>
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/30 p-2 rounded-full" title="Réduire la vue">
              {/* Down-right arrow / Minimize icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>
            </button>
          </div>

          {/* Huge Album Art OR Verses View */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative w-full max-w-[90%] mx-auto overflow-hidden">
            {showLyrics ? (
              <div 
                className="w-full h-full overflow-y-auto px-4 py-8 flex flex-col gap-12 hide-scrollbar items-center mask-image-fade"
                dir="rtl"
              >
                {verses.length > 0 ? (
                  <>
                    {verseTimings.length === 0 && (
                      <div className="text-white/50 text-sm text-center mb-8 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 mx-auto w-max">
                        المزامنة التلقائية غير متوفرة لهذا القارئ
                      </div>
                    )}
                    {verses.map((verse) => {
                    const isActive = currentActiveKey === verse.verse_key;
                    
                    return (
                      <p 
                        key={verse.id}
                        id={`verse-${verse.id}`} ref={isActive ? (activeVerseRef as any) : null} 
                        className={`transition-all duration-500 font-quran text-center leading-[1.8] cursor-pointer w-full text-5xl md:text-6xl lg:text-7xl ${isActive ? 'text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-white/30 hover:text-white/60 blur-[1px] hover:blur-none'}`}
                      >
                        {verse.text_uthmani}
                      </p>
                    );
                  })}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50 text-xl font-medium animate-pulse">
                    جاري التحميل...
                  </div>
                )}
              </div>
            ) : (
              <div className="w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] bg-gradient-to-br from-[#1e354d] to-[#0f172a] rounded-xl flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                 {/* Glowing ring mimicking the art in screenshot */}
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#6b8ba7]/30 via-transparent to-transparent opacity-50 blur-xl"></div>
                 
                 <span className="font-quran text-[100px] lg:text-[140px] xl:text-[160px] leading-none drop-shadow-2xl z-10 text-white">
                   {activeSurah.name_arabic.replace('سورة ', '')}
                 </span>
                 <span className="font-bold text-3xl mt-4 tracking-wider text-[#f8fafc] z-10 drop-shadow-lg uppercase">
                   {activeSurah.name_simple}
                 </span>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------------------- */}
      {/* ---------------------------------------------------------------------- */}
      {/* 3. ALWAYS-VISIBLE BOTTOM PLAYER BAR (Spotify standard player)         */}
      {/* ---------------------------------------------------------------------- */}
      <div 
        className={`fixed bottom-[90px] md:bottom-0 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-11/12 md:w-full max-w-[350px] md:max-w-none 
          bg-[#f8fafc] dark:bg-[#1e293b] md:dark:bg-[#0f172a] 
          rounded-xl md:rounded-none border border-[#e2e8f0] dark:border-white/10 md:border-t md:border-x-0 md:border-b-0
          shadow-lg md:shadow-none z-40 
          h-[65px] md:h-[90px]
          flex items-center px-3 md:px-6 py-2 md:py-3
          md:grid md:grid-cols-[1fr_2fr_1fr] md:gap-4
          ${isMaximized ? 'hidden md:grid' : 'flex'}
        `} 
        dir="ltr"
        onClick={(e) => {
          // Only trigger maximize on mobile if they click the container, not the buttons
          if (window.innerWidth < 768 && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'path' && (e.target as HTMLElement).tagName !== 'svg') {
            toggleFullscreen();
          }
        }}
      >
         
         {/* 3.1. Track Info (Left Side on Desktop, Left on Mobile) */}
         <div className="flex items-center gap-3 w-full md:w-auto text-left cursor-pointer overflow-hidden">
           {/* Mini Album Art */}
           <div 
             className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-[#4a6b8c] to-[#0f172a] rounded flex items-center justify-center text-white font-quran font-bold text-lg md:text-2xl shrink-0 shadow-sm relative overflow-hidden group" 
           >
             <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/60 rounded-full p-0.5 transition-opacity hidden md:block">
               <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
             </div>
             {activeSurah.name_arabic.replace('سورة ', '')}
           </div>
           
           {/* Title & Artist */}
           <div className="flex flex-col justify-center truncate">
             <h4 className="font-bold text-[#1e354d] dark:text-white text-[14px] leading-tight truncate md:group-hover:underline">{activeSurah.name_simple}</h4>
             <p className="text-[11px] text-[#4a6b8c] dark:text-[#a1a1aa] truncate mt-0.5 md:group-hover:underline md:group-hover:text-white transition-colors">{reciter.reciter_name}</p>
           </div>
         </div>

         {/* MOBILE ONLY: Play & Close Buttons (Right side of mini player) */}
         <div className="md:hidden flex items-center gap-5 ml-auto shrink-0 text-[#1e354d] dark:text-white">
           <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity">
             {isPlaying ? (
               <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
             ) : (
               <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
             )}
           </button>
           <button onClick={(e) => { e.stopPropagation(); closePlayer(); }} className="w-8 h-8 flex items-center justify-center text-[#4a6b8c] dark:text-[#a1a1aa] hover:opacity-70 transition-opacity">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         </div>

         {/* MOBILE ONLY: Progress Bar (Bottom edge of mini player) */}
         <div className="md:hidden absolute bottom-0 left-2 right-2 h-0.5 bg-[#e2e8f0] dark:bg-[#334155] rounded-full overflow-hidden">
           <div className="h-full bg-[#1e354d] dark:bg-white" style={{ width: progressPercent }}></div>
         </div>

         {/* 3.2. Progress Bar & Controls (Center on Desktop) - HIDDEN ON MOBILE */}
         <div className="hidden md:flex w-full max-w-2xl mx-auto flex-col items-center gap-1.5 justify-self-center">
           
           {/* Controls Row */}
           <div className="flex items-center gap-6 text-[#1e354d] dark:text-white">
             {/* Shuffle Button */}
             <button onClick={toggleShuffle} className={`transition-colors ${isShuffling ? "text-[#4ade80]" : "text-[#4a6b8c] dark:text-[#a1a1aa] hover:text-[#1e354d] dark:hover:text-white"}`} title="تبديل عشوائي">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
               {isShuffling && <div className="w-1 h-1 bg-[#4ade80] rounded-full mx-auto mt-1 absolute left-1/2 -translate-x-1/2"></div>}
             </button>

             {/* Previous */}
             <button onClick={playPrev} disabled={activeSurahId === 1} className="text-[#4a6b8c] dark:text-[#a1a1aa] hover:text-[#1e354d] dark:hover:text-white disabled:opacity-30 transition-colors">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
             </button>

             {/* Play/Pause */}
             <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-[#1e354d] dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 transition-transform shadow-md">
               {isPlaying ? (
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
               ) : (
                 <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
               )}
             </button>

             {/* Next */}
             <button onClick={playNext} disabled={activeSurahId === 114} className="text-[#4a6b8c] dark:text-[#a1a1aa] hover:text-[#1e354d] dark:hover:text-white disabled:opacity-30 transition-colors">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 14.832A1 1 0 0010 14v-2.798L4.555 14.832A1 1 0 003 14V6a1 1 0 001.555-.832L10 8.798V6a1 1 0 001.555-.832l6 4a1 1 0 000 1.664l-6 4z" /></svg>
             </button>
             
             {/* Repeat Button */}
             <button onClick={toggleRepeat} className={`transition-colors relative ${isRepeating ? "text-[#4ade80]" : "text-[#4a6b8c] dark:text-[#a1a1aa] hover:text-[#1e354d] dark:hover:text-white"}`} title="تكرار">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
               {isRepeating && <div className="w-1 h-1 bg-[#4ade80] rounded-full mx-auto mt-1 absolute left-1/2 -translate-x-1/2"></div>}
             </button>
           </div>
           
           {/* Progress Line */}
           <div className="flex items-center w-full gap-2 text-[11px] font-medium text-[#4a6b8c] dark:text-[#a1a1aa]">
             <span className="w-8 text-right">{formatTime(currentTime)}</span>
             <div className="flex-1 h-1 bg-[#e2e8f0] dark:bg-[#3f3f46] rounded-full overflow-hidden cursor-pointer relative group" onClick={handleSeek}>
               <div className="absolute top-0 left-0 h-full bg-[#1e354d] dark:bg-white group-hover:bg-[#4ade80] transition-colors" style={{ width: progressPercent }}></div>
             </div>
             <span className="w-8 text-left">{formatTime(duration)}</span>
           </div>
         </div>

         {/* 3.3. Right Side Actions (Maximize & Close) - DESKTOP ONLY */}
         <div className="hidden md:flex justify-self-end items-center justify-end gap-3 text-[#4a6b8c] dark:text-[#a1a1aa]">
           
           {/* Volume Control */}
           <div className="flex items-center gap-2 mr-2">
             <button 
               onClick={() => {
                 setIsMuted(!isMuted);
                 if (isMuted && volume === 0) setVolume(1);
               }} 
               className="hover:text-[#1e354d] dark:hover:text-white transition-colors"
               title={isMuted || volume === 0 ? "إلغاء كتم الصوت" : "كتم الصوت"}
             >
               {isMuted || volume === 0 ? (
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
               ) : volume < 0.5 ? (
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
               ) : (
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/></svg>
               )}
             </button>
             
             {/* Volume Slider */}
             <div className="w-20 h-1 bg-[#e2e8f0] dark:bg-[#3f3f46] rounded-full overflow-hidden cursor-pointer relative group" onClick={handleVolumeChange}>
               <div 
                 className="absolute top-0 left-0 h-full bg-[#1e354d] dark:bg-white group-hover:bg-[#4ade80] transition-colors" 
                 style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
               ></div>
             </div>
           </div>
           
           {/* Lyrics Toggle */}
           <button 
             onClick={() => {
               setShowLyrics(!showLyrics);
               if (!isMaximized) setIsMaximized(true);
             }} 
             className={`flex transition-colors relative ${showLyrics ? "text-[#4ade80]" : "hover:text-[#1e354d] dark:hover:text-white"}`} 
             title="الآيات"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
             {showLyrics && <div className="w-1 h-1 bg-[#4ade80] rounded-full mx-auto mt-1 absolute left-1/2 -translate-x-1/2 top-4"></div>}
           </button>
           
           {/* Maximize Toggle */}
           <button onClick={toggleFullscreen} className="flex hover:text-[#1e354d] dark:hover:text-white transition-colors" title={isMaximized ? "تصغير" : "تكبير"}>
             {isMaximized ? (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>
             ) : (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
             )}
           </button>
           
           {/* Close Button */}
           <button onClick={closePlayer} className="hover:text-[#1e354d] dark:hover:text-white transition-colors ml-2 rounded-full" title="إغلاق">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </>
  );
}
