const fs = require('fs');

let code = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

const oldRealisticCounter = `          {/* Realistic Counter Device */}
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
          </div>`;

const newFlatCounter = `          {/* Flat Minimal Circle Counter */}
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
            
          </div>`;

if (code.includes('Realistic Counter Device')) {
  // It's using exact string replacement
  const startIndex = code.indexOf('{/* Realistic Counter Device */}');
  const endIndex = code.indexOf('</div>\n          </div>', startIndex) + 24;
  
  const part1 = code.substring(0, startIndex);
  const part2 = code.substring(endIndex);
  
  fs.writeFileSync('src/app/dhikr/page.tsx', part1 + newFlatCounter + part2);
  console.log('Replaced Realistic Counter with Flat Counter');
} else {
  console.log('Could not find Realistic Counter block');
}
