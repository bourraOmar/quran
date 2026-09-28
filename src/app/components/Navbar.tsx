"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
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

  return (
    <nav className="bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] py-6 px-4 md:px-12 border-b border-[#e2e8f0] dark:bg-[#0f172a] dark:border-[#1e293b] transition-colors">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Quran Logo" width={40} height={40} className="rounded-full shadow-sm" />
          <span className="text-xl font-bold tracking-tight text-[#4a6b8c] dark:text-[#8ba7c0]">Quran.co</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-[16px] font-semibold text-[#5a7b9c] dark:text-[#94a3b8]">
          <Link href="/" className="hover:text-[#1e354d] dark:hover:text-white transition-colors">الرئيسية</Link>
          <Link href="/surahs" className="hover:text-[#1e354d] dark:hover:text-white transition-colors">قراءة القرآن</Link>
          <Link href="/reciters" className="hover:text-[#1e354d] dark:hover:text-white transition-colors">استماع للقرآن</Link>
        </div>

        {/* Theme Toggle Button */}
        <div className="hidden md:flex items-center justify-end w-[120px]">
           <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-[#5a7b9c] dark:text-[#94a3b8] hover:bg-[#e2e8f0] dark:text-[#94a3b8] dark:hover:bg-[#1e293b] transition-colors"
            aria-label="Toggle Dark Mode"
           >
             {isDarkMode ? (
               // Sun icon for dark mode
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
             ) : (
               // Moon icon for light mode
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
               </svg>
             )}
           </button>
        </div>

        {/* Mobile Menu & Theme */}
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={toggleTheme} className="p-2 text-[#5a7b9c] dark:text-[#94a3b8]">
            {isDarkMode ? (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
