const fs = require('fs');
let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

const oldImperative = `  useImperativeHandle(ref, () => ({
    playVerse: (verseKey: string) => {
      const index = verseAudios.findIndex(v => v.verse_key === verseKey);
      if (index !== -1) {
        setCurrentVerseIndex(index);
        setAudioMode("verse");
        setIsPlaying(true);
        setHasStarted(true);
        if (audioRef.current && verseAudios[index].url) {
           const rawUrl = verseAudios[index].url;
           audioRef.current.src = rawUrl.startsWith("http") || rawUrl.startsWith("//") ? (rawUrl.startsWith("//") ? \`https:\${rawUrl}\` : rawUrl) : \`https://verses.quran.com/\${rawUrl}\`;
           audioRef.current.play().catch(() => {});
        }
      }
    }
  }));`;

const newImperative = `  useImperativeHandle(ref, () => ({
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

code = code.replace(oldImperative, newImperative);
fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
console.log('Fixed playVerse logic.');
