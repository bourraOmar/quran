"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGlobalAudio } from "../context/GlobalAudioContext";

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();
  const { activeSurahId } = useGlobalAudio();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    // Hide initially when route changes
    setShowScrollTop(false);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPlayerActive = activeSurahId !== null;
  const bottomClass = isPlayerActive 
    ? "bottom-[320px] md:bottom-[110px]" 
    : "bottom-24 md:bottom-8";

  return (
    <button 
      onClick={scrollToTop}
      className={`fixed left-8 w-14 h-14 bg-[#1e354d] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#4a6b8c] hover:scale-110 transition-all z-50 ${bottomClass} ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      aria-label="العودة للأعلى"
    >
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
    </button>
  );
}
