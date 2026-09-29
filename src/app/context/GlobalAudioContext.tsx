"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

export interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

export interface Reciter {
  id: number;
  name: string;
  style: { name: string } | null;
  translated_name?: { name: string };
}

interface GlobalAudioContextType {
  activeSurahId: number | null;
  activeSurah: Chapter | null;
  reciter: Reciter | null;
  isPlaying: boolean;
  audioUrl: string | null;
  currentTime: number;
  duration: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  verseTimings: { verse_key: string; timestamp_from: number; timestamp_to: number; duration: number }[];
  
  isRepeating: boolean;
  isShuffling: boolean;
  toggleRepeat: () => void;
  toggleShuffle: () => void;

  playSurah: (surah: Chapter, reciter: Reciter, surahs: Chapter[]) => void;
  closePlayer: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  handleTimeUpdate: () => void;
  handleEnded: () => void;
  setIsPlaying: (playing: boolean) => void;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const [activeSurahId, setActiveSurahId] = useState<number | null>(null);
  const [activeSurah, setActiveSurah] = useState<Chapter | null>(null);
  const [reciter, setReciter] = useState<Reciter | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [verseTimings, setVerseTimings] = useState<{ verse_key: string; timestamp_from: number; timestamp_to: number; duration: number }[]>([]);

  useEffect(() => {
    if (!activeSurahId || !reciter) return;

    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setVerseTimings([]);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${reciter.id}/audio_files?chapter=${activeSurahId}&segments=true`)
      .then(res => res.json())
      .then(data => {
        if (data.audio_files && data.audio_files.length > 0) {
          const file = data.audio_files[0];
          setAudioUrl(file.audio_url);
          setVerseTimings(file.verse_timings || []);
        }
      })
      .catch(err => console.error("Failed to fetch audio info:", err));
  }, [activeSurahId, reciter]);

  const [surahs, setSurahs] = useState<Chapter[]>([]);

  const playSurah = (surah: Chapter, r: Reciter, sList: Chapter[]) => {
    setActiveSurahId(surah.id);
    setActiveSurah(surah);
    setReciter(r);
    setSurahs(sList);
  };

  const closePlayer = () => {
    setActiveSurahId(null);
    setActiveSurah(null);
    setReciter(null);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const toggleRepeat = () => setIsRepeating(!isRepeating);
  const toggleShuffle = () => setIsShuffling(!isShuffling);

  const playNext = () => {
    if (activeSurahId === null || !reciter || surahs.length === 0) return;
    
    if (isShuffling) {
      const remainingSurahs = surahs.filter(s => s.id !== activeSurahId);
      if (remainingSurahs.length > 0) {
        const randomSurah = remainingSurahs[Math.floor(Math.random() * remainingSurahs.length)];
        playSurah(randomSurah, reciter, surahs);
      }
      return;
    }

    if (activeSurahId >= 114) return;
    const nextSurah = surahs.find(s => s.id === activeSurahId + 1);
    if (nextSurah) {
      playSurah(nextSurah, reciter, surahs);
    }
  };

  const playPrev = () => {
    if (activeSurahId === null || activeSurahId <= 1) return;
    
    // If we've played more than 3 seconds, previous button just restarts track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevSurah = surahs.find(s => s.id === activeSurahId - 1);
    if (prevSurah && reciter) {
      playSurah(prevSurah, reciter, surahs);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    if (isRepeating) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      playNext();
    }
  };

  return (
    <GlobalAudioContext.Provider value={{
      activeSurahId, activeSurah, reciter, isPlaying, audioUrl, currentTime, duration, audioRef, verseTimings,
      isRepeating, isShuffling, toggleRepeat, toggleShuffle,
      playSurah, closePlayer, togglePlay, playNext, playPrev, handleTimeUpdate, handleEnded, setIsPlaying
    }}>
      {children}
    </GlobalAudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext);
  if (context === undefined) {
    throw new Error("useGlobalAudio must be used within a GlobalAudioProvider");
  }
  return context;
}
