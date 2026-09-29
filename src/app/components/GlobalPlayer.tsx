"use client";

import React from "react";
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
    setIsPlaying
  } = useGlobalAudio();

  if (!activeSurahId || !activeSurah || !reciter) {
    return null;
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-11/12 max-w-[380px] bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl md:bg-white md:dark:bg-[#1e293b] rounded-3xl md:rounded-none border border-[#e2e8f0] dark:border-white/10 md:bottom-0 md:left-0 md:translate-x-0 md:w-full md:max-w-none p-6 md:px-12 md:py-4 flex flex-col md:grid md:grid-cols-[1fr_2fr_1fr] items-center shadow-2xl z-40 gap-6 md:gap-4" dir="ltr">
         
         {/* Mobile Album Art (Hidden on desktop) */}
         <div className="md:hidden w-32 h-32 bg-gradient-to-br from-[#6b8ba7] to-[#4a6b8c] rounded-2xl flex items-center justify-center text-white shadow-lg mb-2">
           <span className="font-quran text-5xl leading-none">{activeSurah.name_arabic.replace('سورة ', '')}</span>
         </div>

         {/* Track Info */}
         <div className="flex items-center justify-center md:justify-self-start gap-4 w-full md:w-auto text-center md:text-left">
           <div className="hidden md:flex w-12 h-12 bg-[#6b8ba7] rounded-lg items-center justify-center text-white font-quran font-bold text-xl shrink-0">
             {activeSurah.name_arabic.replace('سورة ', '')}
           </div>
           <div>
             <h4 className="font-bold text-[#1e354d] dark:text-[#f8fafc] text-xl md:text-lg leading-tight">{activeSurah.name_simple}</h4>
             <p className="text-sm text-[#5a7b9c] dark:text-[#94a3b8] mt-1 md:mt-0">{reciter.translated_name?.name || reciter.reciter_name}</p>
           </div>
         </div>

         {/* Progress Bar (Mobile: below title, Desktop: inline) */}
         <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 md:gap-2 md:justify-self-center">
           
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
         <div className="absolute top-4 right-4 md:static md:justify-self-end">
           <button onClick={closePlayer} className="text-[#5a7b9c] dark:text-[#94a3b8] hover:text-[#1e354d] dark:text-[#f8fafc] transition-colors p-2 bg-[#f4f7f9] dark:bg-[#334155] md:bg-transparent rounded-full">
             <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          autoPlay
        />
      )}
    </>
  );
}
