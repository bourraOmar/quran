"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingMobileMenu() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    setIsScrolled(false);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const wrapperClasses = "fixed bottom-4 left-0 w-full pointer-events-none flex z-50 md:hidden";
  const innerClasses = isScrolled
    ? "w-[calc(100%-32px)] mx-auto px-4"
    : "w-[91.666%] max-w-[400px] mx-auto px-6";

  return (
    <div className={wrapperClasses}>
      <div className={`pointer-events-auto bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl h-[64px] rounded-[32px] flex items-center justify-between shadow-2xl border border-[#e2e8f0] dark:border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${innerClasses}`}>
        
        {/* Home */}
        <Link href="/" aria-label="الرئيسية" className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${pathname === "/" ? "text-[#4a6b8c] dark:text-[#8ba7c0]" : "text-[#94a3b8] hover:text-[#4a6b8c] dark:hover:text-[#8ba7c0]"}`}>
          <svg className="w-6 h-6" fill={pathname === "/" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname === "/" ? 1.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {/* Quran (Surahs) */}
        <Link href="/surahs" aria-label="القرآن" className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${pathname.startsWith("/surah") ? "text-[#4a6b8c] dark:text-[#8ba7c0]" : "text-[#94a3b8] hover:text-[#4a6b8c] dark:hover:text-[#8ba7c0]"}`}>
          <svg className="w-6 h-6" fill={pathname.startsWith("/surah") ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith("/surah") ? 1.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </Link>

        {/* Qibla / Center Action */}
        <Link href="/qibla" aria-label="القبلة" className="p-3 -mt-6 bg-[#4a6b8c] text-white rounded-full flex flex-col items-center justify-center transition-all shadow-lg shadow-[#4a6b8c]/30 hover:scale-105 border-4 border-[#f4f7f9] dark:border-[#0f172a]">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </Link>

        {/* Reciters */}
        <Link href="/reciters" aria-label="القراء" className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${pathname.startsWith("/reciter") ? "text-[#4a6b8c] dark:text-[#8ba7c0]" : "text-[#94a3b8] hover:text-[#4a6b8c] dark:hover:text-[#8ba7c0]"}`}>
          <svg className="w-6 h-6" fill={pathname.startsWith("/reciter") ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith("/reciter") ? 1.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </Link>

        {/* Profile / Settings */}
        <Link href="/profile" aria-label="حسابي" className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${pathname === "/profile" ? "text-[#4a6b8c] dark:text-[#8ba7c0]" : "text-[#94a3b8] hover:text-[#4a6b8c] dark:hover:text-[#8ba7c0]"}`}>
          <svg className="w-6 h-6" fill={pathname === "/profile" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname === "/profile" ? 1.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>

      </div>
    </div>
  );
}
