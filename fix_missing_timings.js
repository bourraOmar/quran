const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

const mappingRegex = /return verses\.map\(\(verse\) => \{[\s\S]*?className=\{\`transition-all duration-500 font-quran text-center leading-\[1\.8\] cursor-pointer w-full text-5xl md:text-6xl lg:text-7xl \$\{isActive \? 'text-white font-bold drop-shadow-\[0_0_15px_rgba\(255,255,255,0\.4\)\]' : 'text-white\/30 hover:text-white\/60 blur-\[1px\] hover:blur-none'\}\`\}/;

const mappingReplacement = `return verses.map((verse) => {
                    const isActive = currentActiveKey === verse.verse_key;
                    
                    // If no timings available, show normal text. If available, show highlighting/blurring.
                    const textStyles = verseTimings.length > 0 
                      ? (isActive ? 'text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-white/30 hover:text-white/60 blur-[1px] hover:blur-none')
                      : 'text-white/80 hover:text-white';

                    return (
                      <p 
                        key={verse.id}
                        id={\`verse-\${verse.id}\`} 
                        ref={isActive ? (activeVerseRef as any) : null}
                        className={\`transition-all duration-500 font-quran text-center leading-[1.8] cursor-pointer w-full text-5xl md:text-6xl lg:text-7xl \${textStyles}\`}
`;

player = player.replace(mappingRegex, mappingReplacement);

// Add a notice if verses exist but timings don't
const versesCheckRegex = /\{verses\.length > 0 \? \(\r?\n\s*verses\.map\(\(verse\) => \{/;
const versesCheckReplacement = `{verses.length > 0 ? (
                  <>
                    {verseTimings.length === 0 && (
                      <div className="text-white/50 text-sm text-center mb-8 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 mx-auto w-max">
                        المزامنة التلقائية غير متوفرة لهذا القارئ
                      </div>
                    )}
                    {verses.map((verse) => {`;

player = player.replace(versesCheckRegex, versesCheckReplacement);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
