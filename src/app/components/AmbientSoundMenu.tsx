"use client";

import { useState, useRef, useEffect } from "react";
import { useAmbientAudio, AmbientSoundType } from "../context/AmbientAudioContext";
import { usePathname } from "next/navigation";
import { useGlobalAudio } from "../context/GlobalAudioContext";

const SOUND_OPTIONS: { id: AmbientSoundType; label: string; icon: React.ReactNode }[] = [
  { id: "none", label: "إيقاف", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> },
  { id: "rain", label: "مطر", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19v2m4-2v2m4-2v2" /></svg> },
  { id: "birds", label: "عصافير", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
  { id: "fire", label: "نار", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg> },
  { id: "waves", label: "أمواج", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 11a9 9 0 019 9M4 15a5 5 0 015 5M4 19h1" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 5c-1.5 0-3 1-4.5 1S12.5 5 11 5s-3 1-4.5 1M20 10c-1.5 0-3 1-4.5 1s-3-1-4.5-1s-3 1-4.5 1" /></svg> },
  { id: "wind", label: "رياح", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg> },
];

export default function AmbientSoundMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeSound, setActiveSound, volume, setVolume } = useAmbientAudio();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { activeSurahId } = useGlobalAudio();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative z-50 flex items-center">
      
      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all ${activeSound !== "none" ? "bg-[#e2e8f0] dark:bg-[#1e293b] text-[#4a6b8c] dark:text-white" : "text-[#4a6b8c] dark:text-[#94a3b8] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"}`}
        aria-label="أصوات الطبيعة"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>

      {/* Menu Popup */}
      <div 
        className={`absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-[#e2e8f0] dark:border-[#334155] p-4 rounded-2xl shadow-xl w-[200px] transition-all origin-top ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"}`}
      >
        <h4 className="text-sm font-bold text-[#1e354d] dark:text-white mb-3 text-center">أصوات الطبيعة</h4>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SOUND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveSound(opt.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${activeSound === opt.id ? "bg-[#4a6b8c] text-white" : "bg-gray-100 dark:bg-[#1e293b] text-[#395675] dark:text-[#94a3b8] hover:bg-gray-200 dark:hover:bg-[#334155]"}`}
            >
              {opt.icon}
              <span className="text-[10px] mt-1 font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        {activeSound !== "none" && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-[#395675] dark:text-[#94a3b8] mb-1">
              <span>مستوى الصوت</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-[#334155] rounded-full appearance-none cursor-pointer accent-[#4a6b8c]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
