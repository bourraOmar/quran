"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const dhikrList = [
  { id: 1, arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhanallah", meaning: "Glory be to Allah" },
  { id: 2, arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", meaning: "Praise be to Allah" },
  { id: 3, arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", meaning: "Allah is the Greatest" },
  { id: 4, arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", meaning: "I seek forgiveness from Allah" },
  { id: 5, arabic: "لَا إِلَهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", meaning: "There is no deity but Allah" },
  { id: 6, arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", meaning: "There is no power nor strength except by Allah" },
];

export default function DhikrApp() {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [selectedDhikr, setSelectedDhikr] = useState<number | null>(null);
  const [target, setTarget] = useState<number>(33);

  useEffect(() => {
    const saved = localStorage.getItem("dhikrCounts");
    if (saved) {
      setCounts(JSON.parse(saved));
    }
  }, []);

  const saveCounts = (newCounts: Record<number, number>) => {
    setCounts(newCounts);
    localStorage.setItem("dhikrCounts", JSON.stringify(newCounts));
  };

  const handleTap = (id: number) => {
    const current = counts[id] || 0;
    const newCount = current + 1;
    
    // Vibrate longer if target is reached
    if (navigator.vibrate) {
      if (target > 0 && newCount > 0 && newCount % target === 0) {
        navigator.vibrate([100, 50, 100]); // distinct vibration pattern on goal
      } else {
        navigator.vibrate(50);
      }
    }
    
    const newCounts = { ...counts, [id]: newCount };
    saveCounts(newCounts);
  };

  const handleReset = (id: number) => {
    if (confirm("هل تريد تصفير عداد هذا الذكر؟")) {
      const newCounts = { ...counts, [id]: 0 };
      saveCounts(newCounts);
    }
  };

  const activeDhikr = selectedDhikr ? dhikrList.find(d => d.id === selectedDhikr) : null;

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] font-sans pb-32" dir="rtl">
      
      {!selectedDhikr ? (
        // --- LIST VIEW ---
        <div className="animate-fade-in">
          {/* Header */}
          <div className="bg-[#1e354d] dark:bg-[#0b1221] text-white pt-16 pb-12 px-6 rounded-b-[50px] shadow-lg relative overflow-hidden">
            {/* Moon/Stars decoration */}
            <div className="absolute top-8 left-8">
              <svg className="w-12 h-12 text-[#8ba7c0] opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold mb-1">أذكاري</h1>
              <p className="text-sm opacity-80">هل ذكرت الله اليوم؟</p>
            </div>
          </div>

          {/* List */}
          <div className="px-5 mt-[-20px] relative z-20 space-y-4">
            {dhikrList.map((dhikr) => (
              <div 
                key={dhikr.id} 
                onClick={() => setSelectedDhikr(dhikr.id)}
                className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform border border-transparent hover:border-[#4a6b8c]/30"
              >
                {/* Text (Right Side in RTL) */}
                <div className="flex-1 pr-4">
                  <p className="text-2xl font-amiri font-bold text-[#1e354d] dark:text-white mb-1">{dhikr.arabic}</p>
                  <p className="text-xs opacity-60">{dhikr.transliteration}</p>
                </div>

                {/* Badge (Left Side in RTL) */}
                <div className="bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-extrabold text-sm shadow-md min-w-[70px] text-center">
                  {(counts[dhikr.id] || 0)}x
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- COUNTER VIEW ---
        <div className="animate-fade-in flex flex-col min-h-screen bg-[#1e354d] dark:bg-[#0b1221] text-white relative">
          
          {/* Top Bar */}
          <div className="pt-12 px-6 flex items-center justify-between z-10">
            <button onClick={() => setSelectedDhikr(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
            <span className="font-bold opacity-80">التسبيح</span>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Dhikr Text */}
          <div className="flex flex-col items-center justify-center mt-12 mb-16 px-6 text-center z-10">
            <h2 className="text-5xl font-amiri font-bold mb-4 leading-normal text-white">{activeDhikr?.arabic}</h2>
            <p className="opacity-70 text-lg">{activeDhikr?.transliteration}</p>
          </div>

                              {/* Flat Minimal Circle Counter */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 w-full mb-8">
            
            <button 
              onClick={() => handleTap(activeDhikr!.id)}
              className="relative w-72 h-72 flex items-center justify-center group focus:outline-none"
            >
              {/* SVG Circular Progress */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 288 288">
                {/* Background Track */}
                <circle 
                  cx="144" cy="144" r="130" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="none" 
                  className="text-white/10"
                />
                
                {/* Active Progress Arc */}
                <circle 
                  cx="144" cy="144" r="130" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round"
                  className="text-amber-400 transition-all duration-300 ease-out"
                  strokeDasharray="816.8" 
                  strokeDashoffset={target === 0 ? 0 : 816.8 - ((counts[activeDhikr!.id] || 0) % target || (counts[activeDhikr!.id] > 0 && (counts[activeDhikr!.id] || 0) % target === 0 ? target : 0)) / target * 816.8}
                />
              </svg>

              {/* The Numbers */}
              <span 
                className="font-mono text-7xl font-light text-amber-400 tracking-wider group-active:scale-95 transition-transform"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {(counts[activeDhikr!.id] || 0)}
              </span>
            </button>

            {/* Target Selector */}
            <div className="mt-12 flex gap-4 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm">
              {[33, 100, 0].map(t => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${target === t ? 'bg-amber-400 text-amber-900 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                  {t === 0 ? 'مفتوح' : t}
                </button>
              ))}
            </div>

            {/* Bottom Flat Icons */}
            <div className="flex items-center justify-between w-full max-w-xs mt-8 px-8">
              <button onClick={() => handleReset(activeDhikr!.id)} className="p-3 opacity-60 hover:opacity-100 transition-opacity focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              
              <button onClick={() => setSelectedDhikr(null)} className="p-3 opacity-60 hover:opacity-100 transition-opacity focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
            
          </div>          
          {/* Background Arc Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-[#4a6b8c]/20 rounded-t-[100%] z-0 pointer-events-none blur-3xl"></div>
        </div>
      )}
    </div>
  );
}
