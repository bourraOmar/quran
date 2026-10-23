"use client";

import { useState } from "react";
import Image from "next/image";

interface ScreenTab {
  id: string;
  title: string;
  icon: string;
  image: string;
  alt: string;
  caption: string;
}

const screens: ScreenTab[] = [
  {
    id: "home",
    title: "الرئيسية",
    icon: "🏠",
    image: "/images/app-screen-home.png",
    alt: "تطبيق أُنس - الشاشة الرئيسية",
    caption: "مواقيت الصلاة الدقيقة، ساعة الاستجابة، والأذكار في واجهة واحدة",
  },
  {
    id: "quran",
    title: "المصحف",
    icon: "📖",
    image: "/images/app-screen-quran.png",
    alt: "تطبيق أُنس - تصفح المصحف الشريف",
    caption: "تصفح سور القرآن بالرسم العثماني وأرقام الزخارف الإسلامية",
  },
  {
    id: "reciters",
    title: "القُرّاء",
    icon: "🎙️",
    image: "/images/app-screen-reciters.png",
    alt: "تطبيق أُنس - قائمة القراء والتلاوات",
    caption: "استماع لكبار القراء مع استمرار الصوت في الخلفية وعند قفل الشاشة",
  },
  {
    id: "adhkar",
    title: "الأذكار",
    icon: "📿",
    image: "/images/app-screen-adhkar.png",
    alt: "تطبيق أُنس - الأذكار والأدعية",
    caption: "أذكار الصباح والمساء، الرقية الشرعية، المسبحة، وأدعية القرآن والسنة",
  },
];

export default function InteractiveMockup() {
  const [activeTab, setActiveTab] = useState(screens[0].id);
  const currentScreen = screens.find((s) => s.id === activeTab) || screens[0];

  return (
    <div className="relative flex flex-col items-center">
      {/* Tab Switchers */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-[#e8edf2] dark:bg-[#1e293b] rounded-full mb-6 border border-[#d8e2eb] dark:border-[#334155] shadow-xs max-w-full">
        {screens.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#4a6b8c] text-white shadow-sm"
                  : "text-[#395675] dark:text-[#94a3b8] hover:text-[#1e354d] dark:hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Phone Mockup Frame */}
      <div className="relative group">
        {/* Ambient Back Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#4a6b8c]/20 to-[#0f8e5d]/20 rounded-[52px] blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />

        {/* Smartphone Shell */}
        <div className="relative w-[280px] sm:w-[310px] md:w-[330px] h-[580px] sm:h-[630px] md:h-[680px] bg-[#0c151f] rounded-[48px] p-2.5 sm:p-3 shadow-2xl border-[6px] border-[#223547] dark:border-[#33485d] flex flex-col overflow-hidden">
          {/* Dynamic Island / Speaker Pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-[#080d14] rounded-full z-30 flex items-center justify-end px-3">
            <div className="w-2 h-2 rounded-full bg-[#1b2b3a] border border-white/10"></div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-[#0c151f] flex flex-col">
            <Image
              key={currentScreen.id}
              src={currentScreen.image}
              alt={currentScreen.alt}
              fill
              className="object-cover object-top transition-opacity duration-300"
              priority
              sizes="(max-width: 640px) 280px, (max-width: 768px) 310px, 330px"
            />
          </div>

          {/* Home indicator bar at bottom */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-30 pointer-events-none"></div>
        </div>

        {/* Floating Feature Badges */}
        <div className="hidden lg:flex flex-col gap-3 absolute -right-20 top-20 z-20 animate-[float_4s_ease-in-out_infinite]">
          <div className="bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-3 text-right">
            <div className="w-9 h-9 rounded-xl bg-[#0f8e5d]/10 text-[#0f8e5d] flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-[#1e354d] dark:text-white">بدون إعلانات</p>
              <p className="text-[10px] text-[#4a6b8c] dark:text-[#94a3b8]">تجربة إيمانية نقية 100%</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-3 absolute -left-20 bottom-24 z-20 animate-[float_5s_ease-in-out_infinite_1s]">
          <div className="bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-3 text-right">
            <div className="w-9 h-9 rounded-xl bg-[#4a6b8c]/10 text-[#4a6b8c] dark:text-[#94a3b8] flex items-center justify-center font-bold text-lg">
              🎧
            </div>
            <div>
              <p className="text-xs font-bold text-[#1e354d] dark:text-white">استماع في الخلفية</p>
              <p className="text-[10px] text-[#4a6b8c] dark:text-[#94a3b8]">يعمل والشاشة مغلقة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Caption */}
      <p className="text-xs text-[#4a6b8c] dark:text-[#94a3b8] mt-4 font-medium text-center max-w-[300px]">
        {currentScreen.caption}
      </p>
    </div>
  );
}
