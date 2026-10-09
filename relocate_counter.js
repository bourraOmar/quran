const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const oldCounterView = `        // --- COUNTER VIEW ---
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
                  className={\`px-6 py-2 rounded-full text-sm font-bold transition-all \${target === t ? 'bg-amber-400 text-amber-900 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}\`}
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
        </div>`;

const newCounterView = `        // --- COUNTER VIEW ---
        <div className="animate-fade-in flex flex-col min-h-screen bg-[#1e354d] dark:bg-[#0b1221] text-white relative pb-32">
          
          {/* Top Bar */}
          <div className="pt-10 px-6 flex items-center justify-between z-10 w-full">
            <div className="w-10"></div> {/* Spacer for centering */}
            <span className="font-bold opacity-80 text-lg">التسبيح</span>
            {/* The single back button on the right */}
            <button onClick={() => setSelectedDhikr(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition focus:outline-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Dhikr Text */}
          <div className="flex flex-col items-center justify-center mt-8 mb-10 px-6 text-center z-10">
            <h2 className="text-5xl font-amiri font-bold mb-4 leading-normal text-white">{activeDhikr?.arabic}</h2>
            <p className="opacity-70 text-lg">{activeDhikr?.transliteration}</p>
          </div>

          {/* Flat Minimal Circle Counter */}
          <div className="flex-1 flex flex-col items-center z-10 w-full">
            
            <button 
              onClick={() => handleTap(activeDhikr!.id)}
              className="relative w-64 h-64 flex items-center justify-center group focus:outline-none"
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
            <div className="mt-10 flex gap-4 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm">
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

            {/* Centered Reset Button */}
            <button 
              onClick={() => handleReset(activeDhikr!.id)} 
              className="mt-8 p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all focus:outline-none flex items-center justify-center shadow-lg"
              aria-label="تصفير العداد"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            
          </div>
          
          {/* Background Arc Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-[#4a6b8c]/20 rounded-t-[100%] z-0 pointer-events-none blur-3xl"></div>
        </div>`;


const startIndex = code.indexOf('        // --- COUNTER VIEW ---');
const endIndex = code.indexOf('        </div>\n      )}\n    </div>');

const part1 = code.substring(0, startIndex);
const part2 = code.substring(endIndex);

fs.writeFileSync('src/app/dhikr/page.tsx', part1 + newCounterView + part2);
console.log('Relocated components');
