const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const newImportsAndData = `"use client";

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

const morningAdhkarList = [
  { id: 'm1', text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ...", count: 1 },
  { id: 'm2', text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ.", count: 3 },
  { id: 'm3', text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
  { id: 'm4', text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.", count: 1 },
  { id: 'm5', text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.", count: 100 }
];

const eveningAdhkarList = [
  { id: 'e1', text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ...", count: 1 },
  { id: 'e2', text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ.", count: 3 },
  { id: 'e3', text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
  { id: 'e4', text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ.", count: 1 },
  { id: 'e5', text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.", count: 100 }
];
`;

code = code.replace(/"use client";[\s\S]*?\];/m, newImportsAndData);

// State replacement
code = code.replace(
  'const [target, setTarget] = useState<number>(33);',
  `const [target, setTarget] = useState<number>(33);
  const [activeTab, setActiveTab] = useState<"tasbeeh" | "morning" | "evening">("tasbeeh");
  const [trackerProgress, setTrackerProgress] = useState<Record<string, number>>({});`
);

// handleTrackerTap
const newFunctions = `
  const handleTrackerTap = (id: string, target: number) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setTrackerProgress(prev => {
      const current = prev[id] || 0;
      if (current >= target) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };
`;

code = code.replace(
  'const activeDhikr = selectedDhikr ? dhikrList.find(d => d.id === selectedDhikr) : null;',
  `${newFunctions}\n  const activeDhikr = selectedDhikr ? dhikrList.find(d => d.id === selectedDhikr) : null;`
);


// Replace the Header to include tabs
const oldHeader = `          {/* Header */}
          <div className="bg-[#1e354d] dark:bg-[#0b1221] text-white pt-16 pb-12 px-6 rounded-b-[50px] shadow-lg relative overflow-hidden">
            {/* Moon/Stars decoration */}
            <div className="absolute top-8 left-8">
              <svg className="w-12 h-12 text-[#8ba7c0] opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold mb-1">أذكاري</h1>
              <p className="text-sm opacity-80">هل ذكرت الله اليوم؟</p>
            </div>
          </div>`;

const newHeader = `          {/* Header */}
          <div className="bg-[#1e354d] dark:bg-[#0b1221] text-white pt-16 pb-8 px-6 rounded-b-[50px] shadow-lg relative overflow-hidden">
            {/* Moon/Stars decoration */}
            <div className="absolute top-8 left-8">
              <svg className="w-12 h-12 text-[#8ba7c0] opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </div>
            <div className="relative z-10 mb-6">
              <h1 className="text-3xl font-extrabold mb-1">أذكاري</h1>
              <p className="text-sm opacity-80">ألا بذكر الله تطمئن القلوب</p>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-black/20 p-1 rounded-full relative z-10">
              <button onClick={() => setActiveTab("tasbeeh")} className={\`flex-1 py-3 rounded-full text-sm font-bold transition-all \${activeTab === "tasbeeh" ? 'bg-amber-400 text-amber-900 shadow-md' : 'text-white/70 hover:text-white'}\`}>التسبيح</button>
              <button onClick={() => setActiveTab("morning")} className={\`flex-1 py-3 rounded-full text-sm font-bold transition-all \${activeTab === "morning" ? 'bg-amber-400 text-amber-900 shadow-md' : 'text-white/70 hover:text-white'}\`}>الصباح</button>
              <button onClick={() => setActiveTab("evening")} className={\`flex-1 py-3 rounded-full text-sm font-bold transition-all \${activeTab === "evening" ? 'bg-amber-400 text-amber-900 shadow-md' : 'text-white/70 hover:text-white'}\`}>المساء</button>
            </div>
          </div>`;

code = code.replace(oldHeader, newHeader);


// Render the correct content based on tabs
const trackerCode = `
          {/* Tracker List */}
          {(activeTab === "morning" || activeTab === "evening") && (
            <div className="px-5 mt-8 relative z-20 space-y-4">
              {(activeTab === "morning" ? morningAdhkarList : eveningAdhkarList).map((dhikr) => {
                const current = trackerProgress[dhikr.id] || 0;
                const isDone = current >= dhikr.count;
                return (
                  <div key={dhikr.id} className={\`bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-sm border \${isDone ? 'border-amber-400/50' : 'border-transparent'} transition-colors relative overflow-hidden\`}>
                    {isDone && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-bl-full border-b border-l border-amber-400/20"></div>}
                    
                    <p className="text-xl md:text-2xl font-amiri leading-loose whitespace-pre-wrap mb-6">{dhikr.text}</p>
                    
                    <button
                      onClick={() => handleTrackerTap(dhikr.id, dhikr.count)}
                      disabled={isDone}
                      className={\`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 \${
                        isDone 
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' 
                        : 'bg-[#f4f7f9] dark:bg-[#0f172a] text-[#4a6b8c] dark:text-[#8ba7c0] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]'
                      }\`}
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
`;

code = code.replace(
  '{/* List */}\n          <div className="px-5 mt-[-20px] relative z-20 space-y-4">',
  `{activeTab === "tasbeeh" && (\n            <div className="px-5 mt-[-20px] relative z-20 space-y-4">`
);

code = code.replace(
  '              </div>\n            ))}\n          </div>\n        </div>',
  `              </div>\n            ))}\n          </div>\n          )}\n${trackerCode}\n        </div>`
);

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Added Morning and Evening tabs');
