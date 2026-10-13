/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

  const wrapperClasses = "fixed bottom-5 left-0 w-full pointer-events-none flex z-50 justify-center";
  const innerClasses = isScrolled
    ? "w-[calc(100%-24px)] max-w-[440px] mx-auto px-3"
    : "w-[94%] max-w-[440px] mx-auto px-4";

  return (
    <div className={wrapperClasses}>
      <div className={`pointer-events-auto bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl h-[66px] rounded-[33px] flex items-center justify-around shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 transition-all duration-300 ${innerClasses}`}>

        {/* 1. Home */}
        <Link href="/" aria-label="الرئيسية" className="p-2 flex-1 flex flex-col items-center justify-center transition-all">
          <div className={`p-1.5 rounded-full transition-all ${pathname === "/" ? "bg-[#0f8e5d]/15 dark:bg-[#0f8e5d]/25 text-[#0f8e5d]" : "text-[#4a6b8c] dark:text-[#8ba7c0]"}`}>
            <Image src="/icons/home.png" width={22} height={22} alt="الرئيسية" className={`w-5 h-5 object-contain dark:invert transition-all ${pathname === "/" ? "opacity-100 scale-110" : "opacity-60"}`} />
          </div>
        </Link>

        {/* 2. Quran / Surahs */}
        <Link href="/surahs" aria-label="القرآن" className="p-2 flex-1 flex flex-col items-center justify-center transition-all">
          <div className={`p-1.5 rounded-full transition-all ${pathname.startsWith("/surah") ? "bg-[#0f8e5d]/15 dark:bg-[#0f8e5d]/25 text-[#0f8e5d]" : "text-[#4a6b8c] dark:text-[#8ba7c0]"}`}>
            <Image src="/icons/quran.png" width={22} height={22} alt="القرآن" className={`w-5 h-5 object-contain dark:invert transition-all ${pathname.startsWith("/surah") ? "opacity-100 scale-110" : "opacity-60"}`} />
          </div>
        </Link>

        {/* 3. Reciters */}
        <Link href="/reciters" aria-label="القراء" className="p-2 flex-1 flex flex-col items-center justify-center transition-all">
          <div className={`p-1.5 rounded-full transition-all ${pathname.startsWith("/reciter") ? "bg-[#0f8e5d]/15 dark:bg-[#0f8e5d]/25 text-[#0f8e5d]" : "text-[#4a6b8c] dark:text-[#8ba7c0]"}`}>
            <Image src="/icons/reciters.png" width={22} height={22} alt="القراء" className={`w-5 h-5 object-contain dark:invert transition-all ${pathname.startsWith("/reciter") ? "opacity-100 scale-110" : "opacity-60"}`} />
          </div>
        </Link>

        {/* 4. Dhikr */}
        <Link href="/dhikr" aria-label="الأذكار" className="p-2 flex-1 flex flex-col items-center justify-center transition-all">
          <div className={`p-1.5 rounded-full transition-all ${pathname === "/dhikr" ? "bg-[#0f8e5d]/15 dark:bg-[#0f8e5d]/25 text-[#0f8e5d]" : "text-[#4a6b8c] dark:text-[#8ba7c0]"}`}>
            <Image src="/icons/dhikr.png" width={24} height={24} alt="الأذكار" className={`w-6 h-6 object-contain dark:invert transition-all ${pathname === "/dhikr" ? "opacity-100 scale-110" : "opacity-60"}`} />
          </div>
        </Link>

        {/* 5. Dua */}
        <Link href="/dua" aria-label="الأدعية" className="p-2 flex-1 flex flex-col items-center justify-center transition-all">
          <div className={`p-1.5 rounded-full transition-all ${pathname === "/dua" ? "bg-[#0f8e5d]/15 dark:bg-[#0f8e5d]/25 text-[#0f8e5d]" : "text-[#4a6b8c] dark:text-[#8ba7c0]"}`}>
            <Image src="/icons/dua.png" width={22} height={22} alt="الأدعية" className={`w-5 h-5 object-contain dark:invert transition-all ${pathname === "/dua" ? "opacity-100 scale-110" : "opacity-60"}`} />
          </div>
        </Link>

      </div>
    </div>
  );
}
