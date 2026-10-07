const fs = require('fs');
let code = fs.readFileSync('src/app/surah/[id]/AudioPlayer.tsx', 'utf8');

code = code.replace(
  'import { useState, useRef, useEffect } from "react";',
  'import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";'
);

code = code.replace(
  'interface AudioPlayerProps {',
  'export interface AudioPlayerRef {\n  playVerse: (verseKey: string) => void;\n}\n\ninterface AudioPlayerProps {'
);

code = code.replace(
  'export default function AudioPlayer({ chapterId, onVerseChange }: AudioPlayerProps) {',
  'const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ chapterId, onVerseChange }, ref) => {'
);

code = code.replace(/}\s*$/, '});\n\nexport default AudioPlayer;');

const imperativeBlock = `
  useImperativeHandle(ref, () => ({
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
  }));
`;

code = code.replace(
  'const [duration, setDuration] = useState(0);',
  'const [duration, setDuration] = useState(0);\n' + imperativeBlock
);

fs.writeFileSync('src/app/surah/[id]/AudioPlayer.tsx', code);
console.log('AudioPlayer modified successfully.');
