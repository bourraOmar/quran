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
    caption: "مواقيت الصلاة الدقيقة، ساعة الاستجابة، وتطبيقاتك اليومية",
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

      {/* Artboard Studio Android Phone Mockup (Ultra-Thin Bezels & Centered Punch Hole) */}
      <div className="relative group">
        {/* Ambient Back Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#4a6b8c]/20 via-[#0f8e5d]/15 to-[#4a6b8c]/20 rounded-[54px] blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />

        {/* Android Device Outer Wrapper with Side Hardware Buttons */}
        <div className="relative mx-auto select-none">
          {/* Right-side Volume Rocker button */}
          <div className="absolute -right-[3px] top-[110px] w-[3px] h-[55px] bg-[#94a3b8] dark:bg-[#475569] rounded-r-[2px] shadow-xs pointer-events-none" />
          
          {/* Right-side Power button */}
          <div className="absolute -right-[3px] top-[180px] w-[3px] h-[36px] bg-[#94a3b8] dark:bg-[#475569] rounded-r-[2px] shadow-xs pointer-events-none" />

          {/* Left-side Antenna line */}
          <div className="absolute -left-[3px] top-[130px] w-[3px] h-[26px] bg-[#94a3b8] dark:bg-[#475569] rounded-l-[2px] shadow-xs pointer-events-none" />

          {/* Premium Metallic Outer Frame (Ultra-thin 2.5px ring) */}
          <div className="relative w-[280px] sm:w-[310px] md:w-[325px] h-[610px] sm:h-[665px] md:h-[700px] rounded-[46px] p-[2.5px] bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] dark:from-[#64748b] dark:via-[#334155] dark:to-[#1e293b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/10 dark:ring-white/10">
            
            {/* Ultra-Slim Inner Black Bezel (3.5px - 4px) */}
            <div className="relative w-full h-full rounded-[43px] p-[3.5px] bg-[#000000] flex flex-col overflow-hidden">
              
              {/* Screen Display Area */}
              <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-[#0c151f]">
                
                {/* Android Punch-Hole Camera (Centered at Top) */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#05080c] ring-1 ring-white/15 z-30 flex items-center justify-center shadow-inner pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0e1724] opacity-90" />
                </div>

                {/* Screenshot Image */}
                <Image
                  key={currentScreen.id}
                  src={currentScreen.image}
                  alt={currentScreen.alt}
                  fill
                  className="object-cover object-top transition-opacity duration-300"
                  priority
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 310px, 325px"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Floating Feature Badges (Placed gracefully with ample spacing) */}
        <div className="hidden xl:flex flex-col gap-3 absolute -right-24 top-16 z-20 animate-[float_4s_ease-in-out_infinite]">
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

        <div className="hidden xl:flex flex-col gap-3 absolute -left-24 bottom-20 z-20 animate-[float_5s_ease-in-out_infinite_1s]">
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
