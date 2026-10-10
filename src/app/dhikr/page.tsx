"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import Image from "next/link"; // We won't use next/image to keep it simple, just SVGs

const dhikrCategories = [
  { id: 'tasbeeh', title: 'المسبحة الإلكترونية', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { id: 'morning', title: 'أذكار الصباح', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
  { id: 'evening', title: 'أذكار المساء', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
  )},
  { id: 'prayer', title: 'أذكار الصلاة', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  )},
];

const dhikrList = [
  { id: 1, arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhanallah" },
  { id: 2, arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah" },
  { id: 3, arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar" },
  { id: 4, arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah" },
  { id: 5, arabic: "لَا إِلَهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah" },
  { id: 6, arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah" },
];

const morningAdhkarList = [
  { id: 'm1', text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ...", count: 1 },
  { id: 'm2', text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ.", count: 3 },
  { id: 'm3', text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ * مِن شَرِّ مَا خَلَقَ * وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ * وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ * وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.", count: 3 },
  { id: 'm4', text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
  { id: 'm5', text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.", count: 100 }
];

const eveningAdhkarList = [
  { id: 'e1', text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ...", count: 1 },
  { id: 'e2', text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ.", count: 3 },
  { id: 'e3', text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
  { id: 'e4', text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ.", count: 1 },
  { id: 'e5', text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.", count: 100 }
];

const prayerAdhkarList = [
  { id: 'p1', text: "أَسْتَغْفِرُ اللَّهَ (ثَلاثاً) اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.", count: 1 },
  { id: 'p2', text: "سُبْحَانَ اللهِ (33)، والْحَمْدُ للهِ (33)، واللهُ أَكْبَرُ (33)، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ...", count: 1 }
];

export default function DhikrApp() {
  const [view, setView] = useState<"categories" | "tasbeeh_list" | "tasbeeh_counter" | "reading">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeDhikrId, setActiveDhikrId] = useState<number | null>(null); // For tasbeeh
  
  // States for Tasbeeh
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [target, setTarget] = useState<number>(33);
  
  // States for Reading Mode
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardProgress, setCardProgress] = useState(0);
  const [fontSize, setFontSize] = useState<"small"|"medium"|"large">("medium");
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [trackerProgress, setTrackerProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem("dhikrCounts");
    if (saved) setCounts(JSON.parse(saved));
  }, []);

  const saveCounts = (newCounts: Record<number, number>) => {
    setCounts(newCounts);
    localStorage.setItem("dhikrCounts", JSON.stringify(newCounts));
  };

  const handleTasbeehTap = (id: number) => {
    const current = counts[id] || 0;
    const newCount = current + 1;
    if (navigator.vibrate) {
      if (target > 0 && newCount > 0 && newCount % target === 0) navigator.vibrate([100, 50, 100]);
      else navigator.vibrate(50);
    }
    saveCounts({ ...counts, [id]: newCount });
  };

  const handleTasbeehReset = (id: number) => {
    if (confirm("هل تريد تصفير عداد هذا الذكر؟")) {
      saveCounts({ ...counts, [id]: 0 });
    }
  };

  const handleCategoryClick = (id: string) => {
    if (id === 'tasbeeh') {
      setView("tasbeeh_list");
    } else {
      setSelectedCategory(id);
      setCurrentCardIndex(0);
      setCardProgress(0);
      setView("reading");
    }
  };

  // Reading Mode Data
  let readingData = morningAdhkarList;
  let readingTitle = "أذكار الصباح";
  if (selectedCategory === 'evening') { readingData = eveningAdhkarList; readingTitle = "أذكار المساء"; }
  if (selectedCategory === 'prayer') { readingData = prayerAdhkarList; readingTitle = "أذكار الصلاة"; }

  const handleReadingTap = (id: string, targetCount: number) => {
    if (navigator.vibrate) navigator.vibrate(50);
    
    const current = trackerProgress[id] || 0;
    if (current >= targetCount) {
       // Already done
       return;
    }
    
    const nextProgress = current + 1;
    setTrackerProgress(prev => ({ ...prev, [id]: nextProgress }));
    
    if (nextProgress === targetCount) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      // Auto transition to next card after a small delay
      setTimeout(() => {
        setSwiperInstance((swiper: any) => {
          if (swiper && !swiper.isEnd) {
            swiper.slideNext();
          } else if (swiper && swiper.isEnd) {
            setView("categories");
          }
          return swiper;
        });
      }, 400);
    }
  };


  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] font-sans pb-24" dir="rtl">
      
      {/* 1. CATEGORIES VIEW */}
      {view === "categories" && (
        <div className="animate-fade-in px-6 pt-16">
          <h1 className="text-3xl font-extrabold mb-8 text-[#1e354d] dark:text-white">قسم الأذكار</h1>
          
          <div className="space-y-4">
            {dhikrCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full bg-white dark:bg-[#1e293b] p-5 rounded-3xl shadow-sm flex items-center justify-between transition-transform active:scale-95 border border-transparent hover:border-[#4a6b8c]/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center text-[#4a6b8c] dark:text-[#8ba7c0]">
                    {cat.icon}
                  </div>
                  <span className="text-xl font-bold">{cat.title}</span>
                </div>
                <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. TASBEEH LIST VIEW */}
      {view === "tasbeeh_list" && (
        <div className="animate-fade-in px-6 pt-16">
          <div className="flex items-center mb-8 gap-4">
            <button onClick={() => setView("categories")} className="p-2 bg-white/10 dark:bg-black/20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
            <h1 className="text-3xl font-extrabold text-[#1e354d] dark:text-white">المسبحة</h1>
          </div>
          
          <div className="space-y-4">
            {dhikrList.map(dhikr => (
              <div 
                key={dhikr.id} 
                onClick={() => { setActiveDhikrId(dhikr.id); setView("tasbeeh_counter"); }}
                className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
              >
                <div className="flex-1 pr-4">
                  <p className="text-2xl font-amiri font-bold text-[#1e354d] dark:text-white mb-1">{dhikr.arabic}</p>
                  <p className="text-xs opacity-60">{dhikr.transliteration}</p>
                </div>
                <div className="bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-extrabold text-sm shadow-md min-w-[70px] text-center">
                  {(counts[dhikr.id] || 0)}x
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TASBEEH COUNTER VIEW */}
      {view === "tasbeeh_counter" && (
        <div className="animate-fade-in flex flex-col min-h-screen bg-[#1e354d] dark:bg-[#0b1221] text-white relative pb-32">
          <div className="pt-10 px-6 flex items-center justify-between z-10 w-full">
            <div className="w-10"></div>
            <span className="font-bold opacity-80 text-lg">التسبيح</span>
            <button onClick={() => setView("tasbeeh_list")} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center mt-8 mb-10 px-6 text-center z-10">
            <h2 className="text-5xl font-amiri font-bold mb-4 leading-normal text-white">{dhikrList.find(d => d.id === activeDhikrId)?.arabic}</h2>
          </div>

          <div className="flex-1 flex flex-col items-center z-10 w-full">
            <button 
              onClick={() => handleTasbeehTap(activeDhikrId!)}
              className="relative w-64 h-64 flex items-center justify-center group focus:outline-none"
            >
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 288 288">
                <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/10" />
                <circle 
                  cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"
                  className="text-amber-400 transition-all duration-300 ease-out"
                  strokeDasharray="816.8" 
                  strokeDashoffset={target === 0 ? 0 : 816.8 - ((counts[activeDhikrId!] || 0) % target || (counts[activeDhikrId!] > 0 && (counts[activeDhikrId!] || 0) % target === 0 ? target : 0)) / target * 816.8}
                />
              </svg>
              <span className="font-mono text-7xl font-light text-amber-400 tracking-wider group-active:scale-95 transition-transform">
                {(counts[activeDhikrId!] || 0)}
              </span>
            </button>

            <div className="mt-10 flex gap-4 bg-white/5 p-1 rounded-full border border-white/10">
              {[33, 100, 0].map(t => (
                <button key={t} onClick={() => setTarget(t)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${target === t ? 'bg-amber-400 text-amber-900 shadow-md' : 'text-white/60 hover:text-white'}`}>
                  {t === 0 ? 'مفتوح' : t}
                </button>
              ))}
            </div>

            <button onClick={() => handleTasbeehReset(activeDhikrId!)} className="mt-8 p-4 bg-white/5 border border-white/10 rounded-full text-white/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>
      )}

            {/* 4. READING VIEW (Stacked Cards UI) */}
      {view === "reading" && (
        <div className="animate-fade-in flex flex-col min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] relative pb-28">
          
          {/* Top Navigation */}
          <div className="pt-12 px-6 flex items-center justify-between w-full mb-10 relative z-20">
            {/* Right side in RTL (Chevron Back) */}
            <button onClick={() => setView("categories")} className="w-10 h-10 bg-white/10 dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
            
            <h1 className="text-2xl font-extrabold text-[#1e354d] dark:text-white">{readingTitle}</h1>
            
            {/* Left side in RTL (Bookmark) */}
            <button className="w-10 h-10 bg-white/10 dark:bg-[#1e293b] shadow-sm rounded-full flex items-center justify-center opacity-60 hover:opacity-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
          </div>

          {/* Stacked Cards Container */}
          <div className="flex-1 flex flex-col items-center px-6 relative w-full mt-4 max-w-md mx-auto">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards]}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper: any) => setCurrentCardIndex(swiper.activeIndex)}
              className="w-full h-[60vh] pb-10"
              direction="horizontal"
              dir="rtl"
            >
              {readingData.map((dhikr, index) => {
                const currentProg = trackerProgress[dhikr.id] || 0;
                const isDone = currentProg >= dhikr.count;
                
                return (
                  <SwiperSlide key={dhikr.id} className="w-full h-full flex">
                    <div className={`w-full bg-[#1e354d] dark:bg-[#1e293b] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 flex flex-col h-full border transition-colors duration-300 ${isDone ? 'border-[#0f8e5d]' : 'border-[#2a4563] dark:border-[#2d3b4e]'} relative`}>
                      
                      {/* Badge */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-[#0f8e5d] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
                          {index + 1}/{readingData.length}
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 flex items-center justify-center overflow-y-auto">
                        <p className={`text-center font-amiri text-white leading-relaxed whitespace-pre-wrap transition-all duration-300 ${fontSize === 'small' ? 'text-xl' : fontSize === 'large' ? 'text-4xl' : 'text-2xl'}`}>
                          {dhikr.text.split('\\n').map((line, i) => (
                            <span key={i}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </div>

                      {/* Counter Button */}
                      <div className="flex justify-center mt-6 mb-2 w-full shrink-0">
                        <button 
                          onClick={() => handleReadingTap(dhikr.id, dhikr.count)}
                          className="relative overflow-hidden bg-transparent border-2 border-[#0f8e5d] text-white w-2/3 max-w-[200px] h-14 rounded-full text-lg font-bold group"
                        >
                          <span className="relative z-10">{currentProg} من {dhikr.count} مرات</span>
                          {/* Progress Fill */}
                          <div 
                            className="absolute top-0 right-0 bottom-0 bg-[#0f8e5d] transition-all duration-300 ease-out z-0"
                            style={{ width: `${(currentProg / dhikr.count) * 100}%` }}
                          ></div>
                        </button>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

        </div>
      )}

    </div>
  );
}
