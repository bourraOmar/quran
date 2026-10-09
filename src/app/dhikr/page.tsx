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

          {/* Realistic Counter Device */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div className="relative w-72 h-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[60px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-gray-700 flex flex-col items-center p-6 pb-10">
              
              {/* LCD Screen */}
              <div className="w-full h-24 bg-[#e2c673] rounded-xl shadow-inner border-4 border-gray-800 flex items-center justify-end px-4 overflow-hidden relative">
                {/* LCD Shadow */}
                <div className="absolute inset-0 shadow-[inset_0_5px_15px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                <span className="font-mono text-5xl font-bold text-gray-800 tracking-widest z-10" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  {(counts[activeDhikr!.id] || 0).toString().padStart(5, '0')}
                </span>
                {/* LCD Background Numbers (Faded) */}
                <span className="font-mono text-5xl font-bold text-gray-800/10 tracking-widest absolute right-4 z-0" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  88888
                </span>
              </div>

              {/* Reset Button */}
              <div className="w-full flex justify-end mt-6 pr-4">
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={() => handleReset(activeDhikr!.id)}
                    className="w-6 h-6 bg-amber-400 rounded-full shadow-[0_3px_0_#b45309] active:shadow-none active:translate-y-[3px] transition-all border border-amber-600"
                  ></button>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reset</span>
                </div>
              </div>

              {/* Giant Count Button */}
              <button 
                onClick={() => handleTap(activeDhikr!.id)}
                className="w-32 h-32 bg-amber-400 rounded-full shadow-[0_8px_0_#b45309] active:shadow-[0_2px_0_#b45309] active:translate-y-[6px] transition-all border-4 border-amber-600 mt-auto flex items-center justify-center group"
              >
                <div className="w-24 h-24 rounded-full bg-amber-500 shadow-inner flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity"></div>
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
