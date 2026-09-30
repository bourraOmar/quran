const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// 1. Pull isTimingLoading from context
player = player.replace(
  'const {',
  'const {'
);
player = player.replace(
  'audioUrl,\n    currentTime,\n    duration,\n    audioRef,\n    verseTimings,\n    isRepeating,',
  'audioUrl,\n    currentTime,\n    duration,\n    audioRef,\n    verseTimings,\n    isTimingLoading,\n    isRepeating,'
);

// 2. Add the effect to auto-close and hide
const autoCloseEffect = `
  const hasTimings = verseTimings.length > 0;
  const showLyricsButton = hasTimings || isTimingLoading;

  useEffect(() => {
    if (!showLyricsButton && showLyrics) {
      setShowLyrics(false);
    }
  }, [showLyricsButton, showLyrics]);

  useEffect(() => {
    if (activeVerseRef.current && showLyrics) {`;

player = player.replace(
  /useEffect\(\(\) => \{\r?\n\s*if \(activeVerseRef\.current && showLyrics\) \{/,
  autoCloseEffect
);

// 3. Update the Lyrics button class
const oldButton = `<button 
              onClick={() => setShowLyrics(!showLyrics)}
              className={\`p-2 rounded-full transition-colors \${showLyrics ? 'text-[#1db954] hover:text-[#1ed760]' : 'text-white/60 hover:text-white'}\`}
              title="Verses"
            >`;
const newButton = `<button 
              onClick={() => setShowLyrics(!showLyrics)}
              className={\`p-2 rounded-full transition-all duration-300 \${showLyrics ? 'text-[#1db954] hover:text-[#1ed760]' : 'text-white/60 hover:text-white'} \${showLyricsButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}
              title="Verses"
            >`;
player = player.replace(oldButton, newButton);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
