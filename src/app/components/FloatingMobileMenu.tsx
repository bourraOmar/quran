"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingMobileMenu() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-md px-6 py-3 rounded-full flex items-center justify-between shadow-2xl border border-[#e2e8f0] dark:border-white/10 z-50 md:hidden w-11/12 max-w-[350px]">
      
      {/* Home */}
      <Link href="/" aria-label="الرئيسية" className={`p-2 rounded-full flex items-center justify-center transition-all ${pathname === "/" ? "bg-[#4a6b8c] text-white" : "text-[#395675] hover:text-[#1e354d] dark:text-[#94a3b8] dark:hover:text-white"}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>

      {/* Read (Surahs) */}
      <Link href="/surahs" aria-label="قراءة القرآن" className={`p-2 rounded-full flex items-center justify-center transition-all ${pathname.startsWith("/surah") ? "bg-[#4a6b8c] text-white" : "text-[#395675] hover:text-[#1e354d] dark:text-[#94a3b8] dark:hover:text-white"}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </Link>

      {/* Listen (Reciters) */}
      <Link href="/reciters" aria-label="استماع للقرآن" className={`p-2 rounded-full flex items-center justify-center transition-all ${pathname.startsWith("/reciter") ? "bg-[#4a6b8c] text-white" : "text-[#395675] hover:text-[#1e354d] dark:text-[#94a3b8] dark:hover:text-white"}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </Link>

    </div>
  );
}
