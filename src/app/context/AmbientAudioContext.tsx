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
  rain: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Rain_on_a_Tin_Roof.ogg",
  birds: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Bird_song_in_the_morning.ogg",
  fire: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Campfire_sound.ogg",
  waves: "https://upload.wikimedia.org/wikipedia/commons/2/25/Ocean_waves.ogg",
  wind: "https://upload.wikimedia.org/wikipedia/commons/8/87/Wind_in_trees.ogg",
};

export const AmbientAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSound, setActiveSound] = useState<AmbientSoundType>("none");
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle sound change
  useEffect(() => {
    if (!audioRef.current) return;

    if (activeSound === "none") {
      audioRef.current.pause();
    } else {
      audioRef.current.src = SOUND_URLS[activeSound];
      audioRef.current.volume = volume;
      audioRef.current.play().catch(e => console.log("Ambient audio play blocked:", e));
    }
  }, [activeSound]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <AmbientAudioContext.Provider value={{ activeSound, setActiveSound, volume, setVolume }}>
      {children}
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
