/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
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
  // Use Abu Bakr Al Shatri as default (id 4 usually in MP3Quran, or index 0)
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
      const timing = timings.find(t => t.ayah === ayah);
      
      if (timing && audioRef.current) {
        audioRef.current.currentTime = timing.start_time / 1000;
        setCurrentVerseIndex(timings.indexOf(timing));
        setIsPlaying(true);
        setHasStarted(true);
        audioRef.current.play().catch(e => console.error("Mobile play blocked:", e));
      }
    }
  }));

  // 1. Fetch Reciters from MP3Quran Timing API
  useEffect(() => {
    fetch("https://mp3quran.net/api/v3/ayat_timing/reads")
      .then((res) => res.json())
      .then((data: Reciter[]) => {
        setAllReciters(data);
        // If default isn't found, pick the first one
        if (!data.find(r => r.id === selectedReciterId) && data.length > 0) {
          setSelectedReciterId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch Audio URL and Timings for selected reciter and chapter
  useEffect(() => {
    if (!selectedReciterId || allReciters.length === 0) return;

    const reciter = allReciters.find(r => r.id === selectedReciterId);
    if (!reciter) return;

    // Reset playback state for new Surah/Reciter
    setIsPlaying(false);
    setHasStarted(false);
    setCurrentVerseIndex(0);
    setCurrentTime(0);
    setDuration(0);
    if (onVerseChange) onVerseChange(null);
    if (audioRef.current) audioRef.current.pause();

    // Format chapter ID to 3 digits (e.g. 1 -> "001")
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
        // Data comes as array of objects with start_time and end_time
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

    // Find the active verse
    const activeIndex = timings.findIndex(t => timeInMs >= t.start_time && timeInMs <= t.end_time);
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
    <div className="flex flex-col items-center justify-between gap-6 w-full">
      {/* Reciter Select */}
      <div className="flex flex-col items-center gap-6 w-full justify-between">
        <div className="text-right w-full flex-1 md:flex-none">
          <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] font-medium mb-1">القارئ</p>
          <div className="relative inline-block w-full">
            <select
              className="bg-transparent text-[#1e354d] dark:text-[#f8fafc] font-bold text-lg md:text-xl outline-none cursor-pointer border-b border-[#e2e8f0] dark:border-[#334155] pb-1 pr-8 w-full hover:border-[#6b8ba7] transition-colors appearance-none text-right"
              value={selectedReciterId}
              onChange={(e) => setSelectedReciterId(Number(e.target.value))}
              disabled={allReciters.length === 0}
              dir="rtl"
            >
              {allReciters.length === 0 && <option className="bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-[#f8fafc]">جاري التحميل...</option>}
              {allReciters.map((r) => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-[#f8fafc]">
                  {r.name} - {r.rewaya}
                </option>
              ))}
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
         <span className="text-xs font-medium text-[#4a6b8c] dark:text-[#94a3b8] shrink-0 w-10 text-center">
            {formatTime(currentTime)}
         </span>
         
         {/* Progress Bar */}
         <div 
            className="flex-1 h-2 bg-[#d8e2eb] dark:bg-[#334155] rounded-full relative overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (audioRef.current && duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pos * duration;
              }
            }}
         >
            <div 
              className="absolute left-0 top-0 h-full bg-[#4a6b8c] rounded-full transition-all duration-100"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            ></div>
         </div>
         
         <span className="text-xs font-medium text-[#4a6b8c] dark:text-[#94a3b8] shrink-0 w-10 text-center">
            {formatTime(duration)}
         </span>
         
         <button 
           onClick={togglePlay}
           disabled={!currentAudioUrl}
           className="w-10 h-10 bg-[#4a6b8c] rounded-full flex items-center justify-center text-white hover:bg-[#537592] transition-colors shrink-0 disabled:opacity-50 shadow-md shadow-[#6b8ba7]/20 ml-2"
         >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
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
          className="md:hidden fixed bottom-[100px] left-1/2 -translate-x-1/2 w-11/12 max-w-[350px] bg-[#f8fafc] dark:bg-[#1e293b] backdrop-blur-xl rounded-full border border-[#e2e8f0] dark:border-white/10 shadow-lg z-[45] flex items-center gap-3 px-4 py-2 h-[50px]"
          dir="ltr"
        >
          <span className="text-xs font-medium text-[#4a6b8c] dark:text-[#94a3b8] shrink-0 w-10 text-center">
            {formatTime(currentTime)}
          </span>

          <div 
             className="flex-1 h-2 bg-[#d8e2eb] dark:bg-[#334155] rounded-full relative overflow-hidden"
             onClick={(e) => {
               if (audioRef.current && duration) {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const pos = (e.clientX - rect.left) / rect.width;
                 audioRef.current.currentTime = pos * duration;
               }
             }}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-[#4a6b8c] rounded-full transition-all duration-100"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            ></div>
          </div>

          <button 
            onClick={togglePlay}
            disabled={!currentAudioUrl}
            className="w-10 h-10 bg-[#4a6b8c] rounded-full flex items-center justify-center text-white hover:bg-[#537592] transition-colors shrink-0 disabled:opacity-50 shadow-md shadow-[#6b8ba7]/20"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

export default AudioPlayer;