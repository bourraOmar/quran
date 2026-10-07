const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

// 1. Remove src prop from <audio>
code = code.replace(
  '          src={currentAudioUrl}\n          autoPlay={isPlaying}',
  '          autoPlay={isPlaying}'
);

// 2. Add useEffect to sync src imperatively
const useEffectSrc = `
  useEffect(() => {
    if (audioRef.current && currentAudioUrl) {
      // Create a temporary anchor to resolve absolute URL for comparison
      const a = document.createElement('a');
      a.href = currentAudioUrl;
      if (audioRef.current.src !== a.href) {
        audioRef.current.src = currentAudioUrl;
      }
    }
  }, [currentAudioUrl]);

  const togglePlay = () => {`;

code = code.replace(
  '  const togglePlay = () => {',
  useEffectSrc
);

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
console.log('Fixed AudioPlayer src management.');
