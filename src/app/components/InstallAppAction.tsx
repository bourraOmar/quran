"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ApkFileIcon from "./ApkFileIcon";

// Define BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallAppAction() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already in standalone (installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handlePWAInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      // Fallback: show instructions or scroll to guide
      const guideElem = document.getElementById("install-guide");
      if (guideElem) {
        guideElem.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("لتثبيت تطبيق أُنس، اضغط على زر خيارات المتصفح (⋮) ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'.");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full max-w-lg mx-auto md:mr-0">
        {/* Primary Download APK Button */}
        <a
          href="/downloads/uns-quran.apk"
          download="uns-quran.apk"
          className="flex-1 flex items-center justify-center gap-3 bg-[#4a6b8c] hover:bg-[#395675] text-white py-3.5 px-6 rounded-2xl font-bold shadow-lg shadow-[#4a6b8c]/25 hover:shadow-xl transition-all active:scale-[0.98] group text-right"
        >
          <ApkFileIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          <div>
            <span className="block text-sm sm:text-base leading-tight font-extrabold">تحميل تطبيق أندرويد (APK)</span>
            <span className="block text-[11px] text-white/80 mt-0.5 font-normal">تنزيل مباشر وسريع • 6.0 ميجابايت</span>
          </div>
        </a>

        {/* Secondary: Install Web App / Add to Home Screen */}
        <button
          onClick={handlePWAInstall}
          type="button"
          className="flex-1 flex items-center justify-center gap-2.5 bg-white dark:bg-[#1e293b] hover:bg-[#e8edf2] dark:hover:bg-[#334155] text-[#1e354d] dark:text-[#f8fafc] border border-[#d8e2eb] dark:border-[#334155] py-3.5 px-6 rounded-2xl font-bold transition-all shadow-sm active:scale-[0.98] text-right"
        >
          <svg className="w-5 h-5 text-[#4a6b8c] dark:text-[#94a3b8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div>
            <span className="block text-sm leading-tight font-bold">
              {isInstalled ? "التطبيق مثبت لديك" : isIOS ? "تثبيت على آيفون" : "إضافة للشاشة الرئيسية"}
            </span>
            <span className="block text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5 font-normal">
              بدون تحميل ملفات (PWA)
            </span>
          </div>
        </button>
      </div>

      {/* Online Read Link fallback */}
      <div className="flex items-center gap-4 mt-4 justify-center md:justify-start text-xs font-semibold text-[#4a6b8c] dark:text-[#94a3b8]">
        <span>أو يمكنك التصفح عبر المتصفح:</span>
        <Link href="/surahs" className="text-[#395675] dark:text-[#f8fafc] hover:underline flex items-center gap-1">
          <span>قراءة المصحف</span>
          <span>←</span>
        </Link>
        <Link href="/reciters" className="text-[#395675] dark:text-[#f8fafc] hover:underline flex items-center gap-1">
          <span>استماع للقراء</span>
          <span>←</span>
        </Link>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-black/10 dark:border-white/10 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold text-[#1e354d] dark:text-white">
                تثبيت تطبيق أُنس على آيفون
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] mb-6 leading-relaxed">
              يمكنك إضافة تطبيق أُنس إلى شاشة هاتفك الرئيسية كأي تطبيق أصلي بخطوتين بسيطتين عبر متصفح سفاري (Safari):
            </p>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex items-start gap-3 bg-[#f4f7f9] dark:bg-[#0f172a] p-3.5 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-[#4a6b8c] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <div>
                  <p className="font-bold text-[#1e354d] dark:text-white">اضغط على زر المشاركة</p>
                  <p className="text-xs text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5">انقر على أيقونة المشاركة (مربع بسهم لأعلى ⎋) في شريط المتصفح أسفل الشاشة.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#f4f7f9] dark:bg-[#0f172a] p-3.5 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-[#4a6b8c] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <div>
                  <p className="font-bold text-[#1e354d] dark:text-white">اختر &quot;إضافة إلى الشاشة الرئيسية&quot;</p>
                  <p className="text-xs text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5">مرر القائمة لأسفل ثم اضغط على &quot;Add to Home Screen&quot; وستظهر أيقونة أُنس على شاشتك فوراً.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-[#4a6b8c] hover:bg-[#395675] text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
}
