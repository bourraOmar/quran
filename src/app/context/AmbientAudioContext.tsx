"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type AmbientSoundType = "none" | "rain" | "birds" | "fire" | "waves" | "wind";

interface AmbientAudioContextType {
  activeSound: AmbientSoundType;
  setActiveSound: (sound: AmbientSoundType) => void;
  volume: number;
  setVolume: (vol: number) => void;
}

const AmbientAudioContext = createContext<AmbientAudioContextType | undefined>(undefined);

const SOUND_URLS: Record<Exclude<AmbientSoundType, "none">, string> = {
  rain: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/rain/light-rain.mp3",
  birds: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/animals/birds.mp3",
  fire: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/campfire.mp3",
  waves: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/waves.mp3",
  wind: "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/wind.mp3",
};

export const AmbientAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSound, setActiveSound] = useState<AmbientSoundType>("none");
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSetSound = (sound: AmbientSoundType) => {
    setActiveSound(sound);
    if (!audioRef.current) return;

    if (sound === "none") {
      audioRef.current.pause();
    } else {
      audioRef.current.src = SOUND_URLS[sound];
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => console.log("Ambient audio play blocked:", e));
    }
  };

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <AmbientAudioContext.Provider value={{ activeSound, setActiveSound: handleSetSound, volume, setVolume }}>
      {children}
      {/* Attach audio element to DOM for iOS Safari support */}
      <audio ref={audioRef} loop crossOrigin="anonymous" preload="none" />
    </AmbientAudioContext.Provider>
  );
};

export const useAmbientAudio = () => {
  const context = useContext(AmbientAudioContext);
  if (context === undefined) {
    throw new Error("useAmbientAudio must be used within an AmbientAudioProvider");
  }
  return context;
};
