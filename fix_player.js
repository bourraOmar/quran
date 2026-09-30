const fs = require('fs');
let code = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// Add verseTimings to destructuring
code = code.replace(/toggleShuffle\r?\n\s+\} = useGlobalAudio\(\);/, 'toggleShuffle,\n    verseTimings\n  } = useGlobalAudio();');

// Replace lyrics map to highlight current verse
const regex = /verses\.map\(\(verse\) => \([\s\S]*?<\/p>\r?\n\s+\)\)/;
const replacement = `verses.map((verse) => {
                    const timing = verseTimings.find(t => t.verse_key === \`\${activeSurahId}:\${verse.id}\`);
                    const currentTimeMs = currentTime * 1000;
                    const isActive = timing && currentTimeMs >= timing.timestamp_from && currentTimeMs <= timing.timestamp_to;
                    
                    return (
                      <p 
                        key={verse.id} 
                        className={\`transition-all duration-300 font-quran text-center leading-[1.8] cursor-pointer max-w-4xl \${isActive ? 'text-white text-5xl md:text-6xl lg:text-7xl font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105' : 'text-white/40 hover:text-white/80 text-4xl md:text-5xl lg:text-6xl blur-[0.5px] hover:blur-none'}\`}
                      >
                        {verse.text_uthmani}
                      </p>
                    );
                  })`;
code = code.replace(regex, replacement);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', code);
