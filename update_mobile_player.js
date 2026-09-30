const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// 1. Replace the huge art container with a conditional one
const oldArt = `<div className="flex-1 flex flex-col items-center justify-center min-h-0 py-8">
            <div className="w-[280px] h-[280px] bg-[#1e354d] rounded-2xl flex items-center justify-center text-white shadow-2xl mb-8 border border-white/10 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-[#6b8ba7]/20 to-transparent"></div>
               <span className="font-quran text-7xl leading-none drop-shadow-xl z-10">{activeSurah.name_arabic.replace('سورة ', '')}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 text-center">{activeSurah.name_simple}</h1>
            <p className="text-lg text-white/70 text-center font-medium">{reciter.reciter_name}</p>
          </div>`;

// Wait, the gradient color was modified from #6b8ba7 to #4a6b8c by my previous script!
// Let's use regex instead to be safe.
const artRegex = /<div className="flex-1 flex flex-col items-center justify-center min-h-0 py-8">[\s\S]*?<p className="text-lg text-white\/70 text-center font-medium">\{reciter\.reciter_name\}<\/p>\r?\n\s*<\/div>/;

const newArt = `{showLyrics ? (
            <div className="flex-1 flex flex-col items-center justify-start min-h-0 py-4 relative w-full overflow-hidden mask-image-fade" dir="rtl">
              {verses.length > 0 ? (
                <div className="w-full h-full overflow-y-auto px-4 hide-scrollbar flex flex-col gap-10 pb-32 pt-8">
                  {verseTimings.length === 0 && (
                    <div className="text-white/50 text-sm text-center mb-4 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 mx-auto w-max">
                      المزامنة التلقائية غير متوفرة
                    </div>
                  )}
                  {verses.map((verse) => {
                    const isActive = currentActiveKey === verse.verse_key;
                    return (
                      <p 
                        key={verse.id}
                        id={\`verse-\${verse.id}\`} ref={isActive ? (activeVerseRef as any) : null} 
                        className={\`transition-all duration-500 font-quran text-center leading-[1.8] cursor-pointer w-full text-4xl md:text-5xl \${isActive ? 'text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-white/30 blur-[1px] hover:blur-none'}\`}
                      >
                        {verse.text_uthmani}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 text-xl font-medium animate-pulse">جاري التحميل...</div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-8">
              <div className="w-[280px] h-[280px] bg-[#1e354d] rounded-2xl flex items-center justify-center text-white shadow-2xl mb-8 border border-white/10 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#4a6b8c]/20 to-transparent"></div>
                 <span className="font-quran text-7xl leading-none drop-shadow-xl z-10">{activeSurah.name_arabic.replace('سورة ', '')}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3 text-center">{activeSurah.name_simple}</h1>
              <p className="text-lg text-white/70 text-center font-medium">{reciter.reciter_name}</p>
            </div>
          )}`;

player = player.replace(artRegex, newArt);

// 2. Replace the buttons layout
const buttonsRegex = /<div className="flex items-center justify-center gap-8 text-white">[\s\S]*?<\/button>\r?\n\s*<\/div>/;

const newButtons = `<div className="flex items-center justify-between w-full px-6 text-white">
              {/* Lyrics Toggle */}
              <button 
                onClick={() => setShowLyrics(!showLyrics)} 
                className={\`transition-colors relative \${showLyrics ? "text-[#4ade80]" : "text-white/70 hover:text-white"}\`} 
                title="الآيات"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
                {showLyrics && <div className="w-1 h-1 bg-[#4ade80] rounded-full mx-auto absolute -bottom-2 left-1/2 -translate-x-1/2"></div>}
              </button>

              <div className="flex items-center gap-6">
                <button onClick={playPrev} disabled={activeSurahId === 1} className="hover:text-white/70 disabled:opacity-30 transition-colors">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
                </button>
                
                <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-white text-[#0f172a] flex items-center justify-center hover:scale-105 transition-all shadow-[0_4px_30px_rgba(255,255,255,0.2)]">
                  {isPlaying ? (
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                  )}
                </button>
                
                <button onClick={playNext} disabled={activeSurahId === 114} className="hover:text-white/70 disabled:opacity-30 transition-colors">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 14.832A1 1 0 0010 14v-2.798L4.555 14.832A1 1 0 003 14V6a1 1 0 001.555-.832L10 8.798V6a1 1 0 001.555-.832l6 4a1 1 0 000 1.664l-6 4z" /></svg>
                </button>
              </div>

              {/* Repeat Toggle */}
              <button 
                onClick={toggleRepeat} 
                className={\`transition-colors relative \${isRepeating ? "text-[#4ade80]" : "text-white/70 hover:text-white"}\`} 
                title="تكرار"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
                {isRepeating && <div className="w-1 h-1 bg-[#4ade80] rounded-full mx-auto absolute -bottom-2 left-1/2 -translate-x-1/2"></div>}
              </button>
            </div>`;

player = player.replace(buttonsRegex, newButtons);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
