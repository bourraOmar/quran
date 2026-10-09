const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

// 1. Add target state
code = code.replace(
  'const [selectedDhikr, setSelectedDhikr] = useState<number | null>(null);',
  `const [selectedDhikr, setSelectedDhikr] = useState<number | null>(null);
  const [target, setTarget] = useState<number>(33);`
);

// 2. Add Haptic feedback function on target completion (optional, handled in handleTap if we want, but let's just do standard)
code = code.replace(
  /const handleTap = \(id: number\) => \{[\s\S]*?saveCounts\(newCounts\);\n  \};/,
  `const handleTap = (id: number) => {
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
  };`
);


// 3. Replace the static circle with an SVG circular progress bar
const newCircleCounter = `          {/* Flat Minimal Circle Counter */}
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
                  className={\`px-6 py-2 rounded-full text-sm font-bold transition-all \${target === t ? 'bg-amber-400 text-amber-900 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}\`}
                >
                  {t === 0 ? 'مفتوح' : t}
                </button>
              ))}
            </div>

            {/* Bottom Flat Icons */}
            <div className="flex items-center justify-between w-full max-w-xs mt-8 px-8">`;

code = code.replace(
  /\{\/\* Flat Minimal Circle Counter \*\/\}[\s\S]*?\{\/\* Bottom Flat Icons \*\/\}\n\s*<div className="flex items-center justify-between w-full max-w-xs mt-16 px-8">/,
  newCircleCounter
);

fs.writeFileSync('src/app/dhikr/page.tsx', code);
console.log('Fixed functional circle progress');
