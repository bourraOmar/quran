/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useSearchParams } from "next/navigation";

export interface AudioPlayerRef {
  playVerse: (verseKey: string) => void;
}

interface AudioPlayerProps {
  chapterId: string;
  onVerseChange?: (verseKey: string | null) => void;
}

interface Reciter {
  id: number;
  name: string;
  rewaya: string;
  folder_url: string;
  soar_count: number;
}

interface AyahTiming {
  ayah: number;
  start_time: number;
  end_time: number;
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ chapterId, onVerseChange }, ref) => {
  const searchParams = useSearchParams();
  const reciterParam = searchParams.get("reciter");

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Reciter & Timing State
  const [allReciters, setAllReciters] = useState<Reciter[]>([]);
  // Abu Bakr Al Shatri or first reciter
  const [selectedReciterId, setSelectedReciterId] = useState<number>(reciterParam ? Number(reciterParam) : 4);
  
  const [timings, setTimings] = useState<AyahTiming[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Expose playVerse method
  useImperativeHandle(ref, () => ({
    playVerse: (verseKey: string) => {
      const ayah = parseInt(verseKey.split(":")[1]);
      const timing = timings.find((t) => t.ayah === ayah);
      
      if (timing && audioRef.current) {
        audioRef.current.currentTime = timing.start_time / 1000;
        setCurrentVerseIndex(timings.indexOf(timing));
        setIsPlaying(true);
        setHasStarted(true);
        audioRef.current.play().catch((e) => console.error("Mobile play blocked:", e));
      }
    }
  }));

  // 1. Fetch Reciters from MP3Quran Timing API
  useEffect(() => {
    fetch("https://mp3quran.net/api/v3/ayat_timing/reads")
      .then((res) => res.json())
      .then((data: Reciter[]) => {
        setAllReciters(data);
        if (!data.find((r) => r.id === selectedReciterId) && data.length > 0) {
          setSelectedReciterId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch Audio URL and Timings for selected reciter and chapter
  useEffect(() => {
    if (!selectedReciterId || allReciters.length === 0) return;

    const reciter = allReciters.find((r) => r.id === selectedReciterId);
    if (!reciter) return;

    // Reset playback state for new Surah/Reciter
    setIsPlaying(false);
    setHasStarted(false);
    setCurrentVerseIndex(0);
    setCurrentTime(0);
    setDuration(0);
    if (onVerseChange) onVerseChange(null);
    if (audioRef.current) audioRef.current.pause();

    const formattedChapter = chapterId.toString().padStart(3, "0");
    const audioUrl = `${reciter.folder_url}${formattedChapter}.mp3`;
    setCurrentAudioUrl(audioUrl);

    if (audioRef.current) {
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
    }

    // Fetch timings
    fetch(`https://mp3quran.net/api/v3/ayat_timing?read=${selectedReciterId}&sura=${chapterId}`)
      .then((res) => res.json())
      .then((data: AyahTiming[]) => {
        setTimings(data);
      })
      .catch((err) => console.error("Failed to load timings", err));
  }, [chapterId, selectedReciterId, allReciters]);

  // Sync highlighting as audio plays
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const timeInMs = audioRef.current.currentTime * 1000;
    
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);

    const activeIndex = timings.findIndex((t) => timeInMs >= t.start_time && timeInMs <= t.end_time);
    if (activeIndex !== -1 && activeIndex !== currentVerseIndex) {
      setCurrentVerseIndex(activeIndex);
      if (onVerseChange) {
        onVerseChange(`${chapterId}:${timings[activeIndex].ayah}`);
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setHasStarted(true);
      setIsPlaying(true);
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentVerseIndex(0);
    if (onVerseChange) onVerseChange(null);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-5 w-full">
      {/* Reciter Select Card */}
      <div className="w-full">
        <label className="text-xs font-bold text-[#4a6b8c] dark:text-[#8ba7c0] mb-2 block text-right">
          القارئ الحالي
        </label>
        <div className="relative bg-[#f4f7f9] dark:bg-[#0f172a] rounded-2xl p-3 border border-black/5 dark:border-white/5 hover:border-[#0f8e5d]/30 transition-all">
          <select
            className="bg-transparent text-[#1e354d] dark:text-white font-bold text-sm md:text-base outline-none cursor-pointer w-full text-right appearance-none pr-7 pl-2"
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(Number(e.target.value))}
            disabled={allReciters.length === 0}
            dir="rtl"
          >
            {allReciters.length === 0 && (
              <option className="bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white">جاري التحميل...</option>
            )}
            {allReciters.map((r) => (
              <option key={r.id} value={r.id} className="bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white">
                {r.name} - {r.rewaya}
              </option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#0f8e5d] dark:text-[#4ade80]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="w-full flex items-center gap-2 bg-[#f4f7f9] dark:bg-[#0f172a] rounded-2xl p-2 px-3 border border-black/5 dark:border-white/5" dir="ltr">
        <span className="text-xs font-semibold text-[#4a6b8c] dark:text-[#8ba7c0] shrink-0 w-9 text-center">
          {formatTime(currentTime)}
        </span>
        
        {/* Progress Bar */}
        <div 
          className="flex-1 h-2 bg-black/5 dark:bg-white/10 rounded-full relative overflow-hidden cursor-pointer"
          onClick={(e) => {
            if (audioRef.current && duration) {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pos * duration;
            }
          }}
        >
          <div 
            className="absolute left-0 top-0 h-full bg-[#0f8e5d] dark:bg-[#4ade80] rounded-full transition-all duration-100"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          ></div>
        </div>
        
        <span className="text-xs font-semibold text-[#4a6b8c] dark:text-[#8ba7c0] shrink-0 w-9 text-center">
          {formatTime(duration)}
        </span>
        
        <button 
          onClick={togglePlay}
          disabled={!currentAudioUrl}
          className="w-10 h-10 bg-[#0f8e5d] hover:bg-[#0c734b] rounded-full flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-50 shadow-md shadow-[#0f8e5d]/30 active:scale-95 ml-1"
          title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4l12 6-12 6z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hidden Audio Tag */}
      <audio 
        ref={audioRef}
        autoPlay={isPlaying}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* ===== MOBILE STICKY BOTTOM PLAYER ===== */}
      {hasStarted && (
        <div 
          className="md:hidden fixed bottom-[95px] left-1/2 -translate-x-1/2 w-11/12 max-w-[350px] bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 shadow-xl z-[45] flex items-center gap-3 px-4 py-2 h-[52px]"
          dir="ltr"
        >
          <span className="text-xs font-semibold text-[#4a6b8c] dark:text-[#8ba7c0] shrink-0 w-8 text-center">
            {formatTime(currentTime)}
          </span>

          <div 
            className="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full relative overflow-hidden"
            onClick={(e) => {
              if (audioRef.current && duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pos * duration;
              }
            }}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-[#0f8e5d] dark:bg-[#4ade80] rounded-full transition-all duration-100"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            ></div>
          </div>

          <button 
            onClick={togglePlay}
            disabled={!currentAudioUrl}
            className="w-9 h-9 bg-[#0f8e5d] rounded-full flex items-center justify-center text-white hover:bg-[#0c734b] transition-all shrink-0 disabled:opacity-50 shadow-md shadow-[#0f8e5d]/30"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4l12 6-12 6z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

export default AudioPlayer;