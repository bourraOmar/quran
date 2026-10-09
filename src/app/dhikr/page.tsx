"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Sample Adhkar Data
const morningAdhkar = [
  { id: 1, text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...", count: 1 },
  { id: 2, text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ.", count: 3 },
  { id: 3, text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.", count: 100 },
  { id: 4, text: "حَسْبِيَ اللّهُ لا إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ العَرْشِ العَظِيمِ.", count: 7 },
  { id: 5, text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.", count: 1 },
];

export default function DhikrPage() {
  const [activeTab, setActiveTab] = useState<"free" | "morning">("free");
  
  // Free Tasbeeh State
  const [freeCount, setFreeCount] = useState(0);
  
  // Morning Adhkar State (track progress of each dhikr)
  const [adhkarProgress, setAdhkarProgress] = useState<Record<number, number>>({});
  const [showResetModal, setShowResetModal] = useState(false);

  // Load saved free count from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("freeTasbeehCount");
    if (saved) setFreeCount(parseInt(saved));
  }, []);

  const handleFreeTap = () => {
    if (navigator.vibrate) navigator.vibrate(50); // Small haptic feedback
    const newCount = freeCount + 1;
    setFreeCount(newCount);
    localStorage.setItem("freeTasbeehCount", newCount.toString());
  };

  const confirmReset = () => {
    setFreeCount(0);
    localStorage.setItem("freeTasbeehCount", "0");
    setShowResetModal(false);
  };

  const handleAdhkarTap = (id: number, target: number) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setAdhkarProgress(prev => {
      const current = prev[id] || 0;
      if (current >= target) return prev; // already done
      return { ...prev, [id]: current + 1 };
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] font-sans pb-32" dir="rtl">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#1e293b] pt-12 pb-6 px-6 rounded-b-[40px] shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Image src="/icons/dhikr.png" width={40} height={40} alt="الذكر" className="opacity-80 dark:invert object-contain w-10 h-10" />
          <div>
            <h1 className="text-2xl font-extrabold text-[#4a6b8c] dark:text-[#8ba7c0]">الذكر والتسبيح</h1>
            <p className="text-sm opacity-70">ألا بذكر الله تطمئن القلوب</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-[#f4f7f9] dark:bg-[#0f172a] p-1 rounded-full mt-6">
          <button 
            onClick={() => setActiveTab("free")}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all \${activeTab === "free" ? 'bg-[#4a6b8c] text-white shadow-md' : 'opacity-70 hover:opacity-100'}`}
          >
            مسبحة إلكترونية
          </button>
          <button 
            onClick={() => setActiveTab("morning")}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all \${activeTab === "morning" ? 'bg-[#4a6b8c] text-white shadow-md' : 'opacity-70 hover:opacity-100'}`}
          >
            أذكار الصباح
          </button>
        </div>
      </div>

      <div className="px-6 mt-8">
        
        
      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 w-full max-w-xs shadow-2xl scale-100">
            <h3 className="text-xl font-bold mb-2">تصفير العداد</h3>
            <p className="opacity-70 text-sm mb-6">هل أنت متأكد أنك تريد تصفير عداد التسبيح؟</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 py-3 rounded-full font-bold bg-[#f4f7f9] dark:bg-[#0f172a] hover:opacity-80 transition-opacity">إلغاء</button>
              <button onClick={confirmReset} className="flex-1 py-3 rounded-full font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">تصفير</button>
            </div>
          </div>
        </div>
      )}


        {/* ---------------- FREE TASBEEH ---------------- */}
        {activeTab === "free" && (
          <div className="flex flex-col items-center justify-center mt-12 animate-fade-in">
            <div 
              onClick={handleFreeTap}
              className="w-64 h-64 bg-white dark:bg-[#1e293b] rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform border-4 border-[#e2e8f0] dark:border-[#334155] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#4a6b8c]/10 to-transparent pointer-events-none"></div>
              <span className="text-7xl font-extrabold text-[#4a6b8c] dark:text-[#8ba7c0] mb-2">{freeCount}</span>
              <span className="text-sm opacity-50 font-bold">اضغط للتسبيح</span>
            </div>

            <button 
              onClick={() => setShowResetModal(true)}
              className="mt-12 bg-white dark:bg-[#1e293b] text-red-500/80 px-6 py-3 rounded-full font-bold shadow-sm border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              تصفير العداد
            </button>
          </div>
        )}

        {/* ---------------- MORNING ADHKAR ---------------- */}
        {activeTab === "morning" && (
          <div className="space-y-4 pb-12 animate-fade-in">
            {morningAdhkar.map((dhikr) => {
              const current = adhkarProgress[dhikr.id] || 0;
              const isDone = current >= dhikr.count;
              
              return (
                <div key={dhikr.id} className={`bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border \${isDone ? 'border-green-500/50' : 'border-[#e2e8f0] dark:border-[#334155]'} transition-colors relative overflow-hidden`}>
                  {isDone && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full border-b border-l border-green-500/20"></div>}
                  
                  <p className="text-xl md:text-2xl font-amiri leading-loose whitespace-pre-wrap mb-6">{dhikr.text}</p>
                  
                  <button
                    onClick={() => handleAdhkarTap(dhikr.id, dhikr.count)}
                    disabled={isDone}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 \${
                      isDone 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                      : 'bg-[#f4f7f9] dark:bg-[#0f172a] text-[#4a6b8c] dark:text-[#8ba7c0] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        اكتمل
                      </>
                    ) : (
                      <>
                        العدد: {current} / {dhikr.count}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
