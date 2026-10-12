/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AmbientSoundMenu from "./AmbientSoundMenu";

export default function Navbar() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const navLinks = [
    { href: "/", label: "الرئيسية", exact: true },
    { href: "/surahs", label: "قراءة القرآن", exact: false },
    { href: "/reciters", label: "استماع للقرآن", exact: false },
    { href: "/dhikr", label: "الأذكار والسبحة", exact: false },
    { href: "/dua", label: "الأدعية", exact: false },
  ];

  return (
    <nav className="bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] py-5 px-4 md:px-12 border-b border-black/5 dark:border-white/10 transition-colors relative z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo.jpg" alt="Quran Logo" width={42} height={42} className="rounded-full shadow-sm group-hover:scale-105 transition-transform" priority />
          <span className="text-3xl font-bold tracking-tight text-[#1e354d] dark:text-white" style={{ fontFamily: 'var(--font-aref-ruqaa)' }}>أُنس</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-[15px] font-semibold text-[#4a6b8c] dark:text-[#94a3b8]">
          {navLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1.5 px-3.5 rounded-full ${
                  isActive
                    ? "text-[#0f8e5d] dark:text-[#4ade80] font-bold bg-[#0f8e5d]/10 dark:bg-[#0f8e5d]/20"
                    : "hover:text-[#0f8e5d] dark:hover:text-[#4ade80]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions: APK Download, Ambient Sound, Theme Toggle */}
        <div className="hidden md:flex items-center justify-end gap-2.5">
           <Link
             href="/download"
             className="flex items-center gap-2 bg-[#0f8e5d]/10 hover:bg-[#0f8e5d] text-[#0f8e5d] hover:text-white dark:bg-[#4ade80]/10 dark:hover:bg-[#4ade80] dark:text-[#4ade80] dark:hover:text-[#0b2915] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border border-[#0f8e5d]/20 dark:border-[#4ade80]/20 shadow-xs active:scale-95"
             title="تحميل تطبيق أندرويد APK"
           >
             <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
               <path d="M17.523 15.3414C17.523 17.5028 15.654 19.349 13.414 19.349C11.173 19.349 9.305 17.503 9.305 15.3414C9.305 13.18 11.174 11.334 13.414 11.334C15.654 11.334 17.523 13.18 17.523 15.3414ZM12.981 12.0163C12.981 12.0163 12.544 11.4552 11.895 11.4552C10.603 11.4552 9.544 12.5492 9.544 13.8863C9.544 15.2234 10.603 16.3174 11.895 16.3174C13.187 16.3174 14.246 15.2234 14.246 13.8863C14.246 13.3364 14.053 12.8341 13.731 12.4332L12.981 12.0163Z" />
             </svg>
             <span>تحميل APK</span>
           </Link>
           <AmbientSoundMenu />
           <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-full text-[#4a6b8c] dark:text-[#94a3b8] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b] hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors"
            aria-label="Toggle Dark Mode"
           >
             {isDarkMode ? (
               <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
             ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
               </svg>
             )}
           </button>
        </div>

        {/* Mobile Menu & Theme & APK Download */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <Link
            href="/download"
            className="p-2 rounded-full text-[#0f8e5d] dark:text-[#4ade80] hover:bg-[#0f8e5d]/10 transition-colors"
            title="تحميل التطبيق APK"
            aria-label="تحميل التطبيق APK"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414C17.523 17.5028 15.654 19.349 13.414 19.349C11.173 19.349 9.305 17.503 9.305 15.3414C9.305 13.18 11.174 11.334 13.414 11.334C15.654 11.334 17.523 13.18 17.523 15.3414ZM12.981 12.0163C12.981 12.0163 12.544 11.4552 11.895 11.4552C10.603 11.4552 9.544 12.5492 9.544 13.8863C9.544 15.2234 10.603 16.3174 11.895 16.3174C13.187 16.3174 14.246 15.2234 14.246 13.8863C14.246 13.3364 14.053 12.8341 13.731 12.4332L12.981 12.0163Z" />
            </svg>
          </Link>
          <AmbientSoundMenu />
          <button onClick={toggleTheme} className="p-2 text-[#4a6b8c] dark:text-[#94a3b8]" aria-label="Toggle Dark Mode Mobile">
            {isDarkMode ? (
               <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
             ) : (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
               </svg>
             )}
          </button>
        </div>
      </div>
    </nav>
  );
}
