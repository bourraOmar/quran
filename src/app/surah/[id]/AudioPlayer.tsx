"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface AudioPlayerProps {
  chapterId: string;
  onVerseChange?: (verseKey: string | null) => void;
}

interface Reciter {
  id: number;
  translated_name: { name: string };
  style: string | null;
}

interface VerseAudio {
  verse_key: string;
  url: string;
}

export default function AudioPlayer({ chapterId, onVerseChange }: AudioPlayerProps) {
  const searchParams = useSearchParams();
  const reciterParam = searchParams.get("reciter");

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Reciter & Style State
  const [allReciters, setAllReciters] = useState<Reciter[]>([]);

  const [selectedReciterId, setSelectedReciterId] = useState<number>(reciterParam ? Number(reciterParam) : 2); // default AbdulBaset Murattal
  
  // Playback State
  const [audioMode, setAudioMode] = useState<"full" | "verse">("verse");
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  
  const [verseAudios, setVerseAudios] = useState<VerseAudio[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Fetch Reciters
  useEffect(() => {
    fetch("https://api.quran.com/api/v4/resources/recitations?language=ar")
      .then((res) => res.json())
      .then((data) => {
        if (data.recitations) {
          setAllReciters(data.recitations);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // No longer filtering by style, all reciters are available in both modes
  const availableReciters = allReciters;



  // 2. Fetch Audio (Full or Verse-by-Verse depending on style)
  useEffect(() => {
    // Reset state
    setFullAudioUrl(null);
    setVerseAudios([]);
    setCurrentVerseIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setHasStarted(false);
    if (onVerseChange) onVerseChange(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setAudioMode("verse");
    // Fetch verse-by-verse audio for highlighting
    // Note: we fetch up to 300 verses (per_page is usually capped, so we might need all if it's a long surah, but quran.com allows large per_page)
    fetch(`https://api.quran.com/api/v4/recitations/${selectedReciterId}/by_chapter/${chapterId}?per_page=300`)
      .then((res) => res.json())
      .then((data) => {
        if (data.audio_files) {
          setVerseAudios(data.audio_files);
        }
      });
  }, [chapterId, selectedReciterId, onVerseChange]);

  let currentAudioUrl = null;
  if (audioMode === "full") {
    currentAudioUrl = fullAudioUrl;
  } else if (verseAudios.length > 0 && verseAudios[currentVerseIndex]?.url) {
    const rawUrl = verseAudios[currentVerseIndex].url;
    if (rawUrl.startsWith("http") || rawUrl.startsWith("//")) {
      currentAudioUrl = rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl;
    } else {
      currentAudioUrl = `https://verses.quran.com/${rawUrl}`;
    }
  }

  // Notify parent of verse change
  useEffect(() => {
    if (audioMode === "verse" && verseAudios.length > 0 && onVerseChange) {
      if (isPlaying) {
        onVerseChange(verseAudios[currentVerseIndex].verse_key);
      } else {
        // Optional: Keep highlighted or clear it when paused? Let's keep it highlighted so they know where they are.
        onVerseChange(verseAudios[currentVerseIndex].verse_key);
      }
    } else if (audioMode === "full" && onVerseChange) {
      onVerseChange(null); // No highlighting for Mujawwad
    }
  }, [currentVerseIndex, verseAudios, audioMode, isPlaying, onVerseChange]);

  const togglePlay = () => {
    if (!audioRef.current || !currentAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasStarted(true);
      setIsPlaying(true);
      audioRef.current.play().catch(() => {
        // Silently ignore browser audio play exceptions (AbortError, NotSupportedError)
        // to prevent Next.js from throwing a full-screen error overlay.
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (audioMode === "verse") {
      if (currentVerseIndex < verseAudios.length - 1) {
        setCurrentVerseIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentVerseIndex(0);
        if (onVerseChange) onVerseChange(null);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Removed useEffect for auto-play, will rely on onCanPlay event instead

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-6 w-full">
      
      {/* Top Row: Style Toggle & Reciter Select */}
      <div className="flex flex-col items-center gap-6 w-full justify-between">
        


        {/* Reciter Dropdown */}
        <div className="text-right w-full md:w-auto flex-1 md:flex-none">
          <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] font-medium mb-1">القارئ</p>
          <div className="relative inline-block w-full md:w-64">
            <select
              className="bg-transparent text-[#1e354d] dark:text-[#f8fafc] font-bold text-lg md:text-xl outline-none cursor-pointer border-b border-[#e2e8f0] dark:border-[#334155] pb-1 pr-8 w-full hover:border-[#6b8ba7] transition-colors appearance-none text-right"
              value={selectedReciterId}
              onChange={(e) => setSelectedReciterId(Number(e.target.value))}
              disabled={availableReciters.length === 0}
              dir="rtl"
            >
              {allReciters.length === 0 && <option className="bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-[#f8fafc]">جاري التحميل...</option>}
              {availableReciters.map((r) => {
                return (
                  <option key={r.id} value={r.id} className="bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-[#f8fafc]">
                    {r.translated_name.name}
                  </option>
                );
              })}
            </select>
            {/* Dropdown arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#395675] dark:text-[#94a3b8]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="w-full flex items-center gap-2 bg-[#f4f7f9] dark:bg-[#0f172a] rounded-full p-2 px-4 border border-[#e2e8f0] dark:border-[#334155]" dir="ltr">
         <span className="text-xs font-medium text-[#4a6b8c] dark:text-[#94a3b8] shrink-0 w-8 text-center">
            {audioMode === "verse" ? `${currentVerseIndex + 1}/${verseAudios.length || 0}` : formatTime(currentTime)}
         </span>
         
         <div 
            className={`flex-1 h-2 bg-[#d8e2eb] dark:bg-[#334155] rounded-full relative overflow-hidden ${audioMode === "full" ? "cursor-pointer" : ""}`}
            onClick={(e) => {
              if (audioMode === "full" && audioRef.current && duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pos * duration;
              }
            }}
         >
            <div 
              className="absolute left-0 top-0 h-full bg-[#4a6b8c] rounded-full transition-all duration-100"
              style={{ width: audioMode === "full" ? (duration ? `${(currentTime / duration) * 100}%` : '0%') : (verseAudios.length ? `${((currentVerseIndex) / verseAudios.length) * 100}%` : '0%') }}
            ></div>
         </div>
         
         {audioMode === "full" && (
           <span className="text-xs font-medium text-[#4a6b8c] dark:text-[#94a3b8] shrink-0 w-8 text-center">
              {formatTime(duration)}
           </span>
         )}
         
         {/* Previous Verse Button (Murattal only) */}
         {audioMode === "verse" && (
           <button 
             onClick={() => {
               if (currentVerseIndex > 0) {
                 setCurrentVerseIndex(prev => prev - 1);
               }
             }}
             disabled={currentVerseIndex === 0}
             className="text-[#395675] hover:text-[#537592] disabled:opacity-30 transition-colors shrink-0"
           >
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
           </button>
         )}

         <button 
           onClick={togglePlay}
           disabled={!currentAudioUrl}
           className="w-10 h-10 bg-[#4a6b8c] rounded-full flex items-center justify-center text-white hover:bg-[#537592] transition-colors shrink-0 disabled:opacity-50 shadow-md shadow-[#6b8ba7]/20 mx-1"
         >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
            )}
         </button>

         {/* Next Verse Button (Murattal only) */}
         {audioMode === "verse" && (
           <button 
             onClick={() => {
               if (currentVerseIndex < verseAudios.length - 1) {
                 setCurrentVerseIndex(prev => prev + 1);
               }
             }}
             disabled={currentVerseIndex === verseAudios.length - 1 || verseAudios.length === 0}
             className="text-[#395675] hover:text-[#537592] disabled:opacity-30 transition-colors shrink-0"
           >
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 14.832A1 1 0 0010 14v-2.798L4.555 14.832A1 1 0 003 14V6a1 1 0 001.555-.832L10 8.798V6a1 1 0 001.555-.832l6 4a1 1 0 000 1.664l-6 4z" /></svg>
           </button>
         )}
      </div>

      {/* Hidden Audio Tag */}
      {currentAudioUrl && (
        <audio 
          ref={audioRef} 
          src={currentAudioUrl}
          autoPlay={isPlaying}
          onCanPlay={() => {
            if (isPlaying && audioRef.current) {
              audioRef.current.play().catch(() => {});
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* ===== MOBILE STICKY BOTTOM PLAYER (appears when audio started) ===== */}
      {hasStarted && (
        <div 
          className="md:hidden fixed bottom-[120px] left-1/2 -translate-x-1/2 w-11/12 max-w-[350px] bg-[#f8fafc] dark:bg-[#1e293b] backdrop-blur-xl rounded-full border border-[#e2e8f0] dark:border-white/10 shadow-lg z-[45] flex items-center gap-2 px-4 py-2 h-[50px]"
          dir="ltr"
        >
          {/* Verse Counter */}
          <span className="text-xs font-medium text-[#4a6b8c] dark:text-[#94a3b8] shrink-0 w-8 text-center">
            {currentVerseIndex + 1}/{verseAudios.length || 0}
          </span>

          {/* Progress Bar */}
          <div className="flex-1 h-2 bg-[#d8e2eb] dark:bg-[#334155] rounded-full relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-[#4a6b8c] rounded-full transition-all duration-100"
              style={{ width: verseAudios.length ? `${((currentVerseIndex) / verseAudios.length) * 100}%` : '0%' }}
            ></div>
          </div>

          {/* Previous */}
          <button 
            onClick={() => { if (currentVerseIndex > 0) setCurrentVerseIndex(prev => prev - 1); }}
            disabled={currentVerseIndex === 0}
            className="text-[#395675] dark:text-[#94a3b8] hover:text-[#537592] disabled:opacity-30 transition-colors shrink-0"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
          </button>

          {/* Play/Pause */}
          <button 
            onClick={togglePlay}
            disabled={!currentAudioUrl}
            className="w-10 h-10 bg-[#4a6b8c] rounded-full flex items-center justify-center text-white hover:bg-[#537592] transition-colors shrink-0 disabled:opacity-50 shadow-md shadow-[#6b8ba7]/20 mx-1"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
            )}
          </button>

          {/* Next */}
          <button 
            onClick={() => { if (currentVerseIndex < verseAudios.length - 1) setCurrentVerseIndex(prev => prev + 1); }}
            disabled={currentVerseIndex === verseAudios.length - 1 || verseAudios.length === 0}
            className="text-[#395675] dark:text-[#94a3b8] hover:text-[#537592] disabled:opacity-30 transition-colors shrink-0"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 14.832A1 1 0 0010 14v-2.798L4.555 14.832A1 1 0 003 14V6a1 1 0 001.555-.832L10 8.798V6a1 1 0 001.555-.832l6 4a1 1 0 000 1.664l-6 4z" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
