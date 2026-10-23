"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ApkFileIcon from "./ApkFileIcon";

export default function MobileInstallBar() {
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // If already running as installed PWA, don't show prompt
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }
    const isDismissed = sessionStorage.getItem("uns_install_banner_dismissed");
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (dismissed || isStandalone) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("uns_install_banner_dismissed", "1");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-[#e2e8f0] dark:border-[#1e293b] px-3 py-2 flex items-center justify-between shadow-xs md:hidden transition-transform animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm p-1 -mr-1"
          aria-label="إغلاق التنبيه"
        >
          ✕
        </button>
        <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shrink-0 border border-black/10 dark:border-white/10">
          <Image src="/logo.jpg" alt="أُنس" width={36} height={36} className="w-full h-full object-cover" />
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#1e354d] dark:text-white leading-tight">تطبيق أُنس</p>
          <p className="text-[10px] text-[#4a6b8c] dark:text-[#94a3b8]">بدون إعلانات • خفيف وسريع</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <a
          href="/downloads/uns-quran.apk"
          download="uns-quran.apk"
          className="bg-[#4a6b8c] hover:bg-[#395675] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <ApkFileIcon className="w-3.5 h-3.5" />
          <span>تثبيت APK</span>
        </a>
      </div>
    </div>
  );
}
