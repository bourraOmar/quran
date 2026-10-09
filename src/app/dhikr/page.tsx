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
    if (navigator.vibrate) navigator.vibrate(50);
    const newCounts = { ...counts, [id]: (counts[id] || 0) + 1 };
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
                {/* Badge */}
                <div className="bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-extrabold text-sm shadow-md min-w-[70px] text-center">
                  {(counts[dhikr.id] || 0)}x
                </div>
                
                {/* Text */}
                <div className="text-left flex-1 pl-4" dir="ltr">
                  <p className="text-2xl font-amiri font-bold text-[#1e354d] dark:text-white mb-1 text-right">{dhikr.arabic}</p>
                  <p className="text-xs opacity-60 text-right">{dhikr.transliteration}</p>
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
          <div className="flex-1 flex flex-col items-center justify-center z-10 w-full mb-12">
            
            <button 
              onClick={() => handleTap(activeDhikr!.id)}
              className="relative w-72 h-72 rounded-full flex items-center justify-center group focus:outline-none"
            >
              {/* Outer track */}
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              
              {/* Inner active arc (simulated with a colored border for now, or you can use SVG for actual arc) */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-amber-400 group-active:border-amber-400 transition-all duration-300 transform -rotate-45"></div>

              {/* The Numbers */}
              <span 
                className="font-mono text-7xl font-light text-amber-400 tracking-wider group-active:scale-95 transition-transform"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {(counts[activeDhikr!.id] || 0)}
              </span>
            </button>

            {/* Bottom Flat Icons */}
            <div className="flex items-center justify-between w-full max-w-xs mt-16 px-8">
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
