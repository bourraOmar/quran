const fs = require('fs');

// 1. Fix SurahReader.tsx (text selection)
let surahReaderCode = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

// The verses are rendered inside <div className={isTranslationEnabled ? "flex flex-col gap-8 text-right" : "inline-block text-center"}>
// We can just add 'select-none' to the parent container, or directly to the verses.
surahReaderCode = surahReaderCode.replace(
  'className={isTranslationEnabled ? "flex flex-col gap-8 text-right" : "inline-block text-center"}',
  'className={isTranslationEnabled ? "flex flex-col gap-8 text-right select-none" : "inline-block text-center select-none"}'
);

fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', surahReaderCode);
console.log('SurahReader select-none applied.');

// 2. Fix AudioPlayer.tsx (play button logic)
let audioPlayerCode = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

const oldImperative = `  useImperativeHandle(ref, () => ({
    playVerse: (verseKey: string) => {
      const index = verseAudios.findIndex(v => v.verse_key === verseKey);
      if (index !== -1) {
        // Just update state. React will re-render, change the <audio src> 
        // and the onCanPlay handler will automatically call .play()
        setCurrentVerseIndex(index);
        setAudioMode("verse");
        setIsPlaying(true);
        setHasStarted(true);
        
        // Force a pause on the current track so the browser doesn't block the next play
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
  }));`;

const newImperative = `  useImperativeHandle(ref, () => ({
    playVerse: (verseKey: string) => {
      const index = verseAudios.findIndex(v => v.verse_key === verseKey);
      if (index !== -1) {
        setCurrentVerseIndex(index);
        setAudioMode("verse");
        setIsPlaying(true);
        setHasStarted(true);
        
        // On mobile devices, .play() MUST be called synchronously inside the onClick handler.
        // If we wait for React to re-render and trigger onCanPlay, iOS Safari will block it.
        if (audioRef.current && verseAudios[index].url) {
          const rawUrl = verseAudios[index].url;
          const newSrc = rawUrl.startsWith("http") || rawUrl.startsWith("//") 
            ? (rawUrl.startsWith("//") ? \`https:\${rawUrl}\` : rawUrl) 
            : \`https://verses.quran.com/\${rawUrl}\`;
          
          if (audioRef.current.src !== newSrc) {
            audioRef.current.src = newSrc;
            audioRef.current.load();
          }
          audioRef.current.play().catch(e => console.error("Mobile play blocked:", e));
        }
      }
    }
  }));`;

audioPlayerCode = audioPlayerCode.replace(oldImperative, newImperative);
fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', audioPlayerCode);
console.log('AudioPlayer playVerse fixed.');
