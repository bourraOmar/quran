const fs = require('fs');

let ctx = fs.readFileSync('src/app/context/GlobalAudioContext.tsx', 'utf8');

// 1. Add state
ctx = ctx.replace(
  'const [verseTimings, setVerseTimings] = useState<{ verse_key: string; timestamp_from: number; timestamp_to: number; duration: number }[]>([]);',
  'const [verseTimings, setVerseTimings] = useState<{ verse_key: string; timestamp_from: number; timestamp_to: number; duration: number }[]>([]);\n  const [isTimingLoading, setIsTimingLoading] = useState(false);'
);

// 2. Add to interface
ctx = ctx.replace(
  'verseTimings: { verse_key: string; timestamp_from: number; timestamp_to: number; duration: number }[];',
  'verseTimings: { verse_key: string; timestamp_from: number; timestamp_to: number; duration: number }[];\n  isTimingLoading: boolean;'
);

// 3. Add to Provider value
ctx = ctx.replace(
  'verseTimings,\n      isRepeating',
  'verseTimings, isTimingLoading,\n      isRepeating'
);
ctx = ctx.replace(
  'verseTimings, isRepeating',
  'verseTimings, isTimingLoading, isRepeating'
);
// wait, the provider looks like: `activeSurahId, activeSurah, reciter, isPlaying, audioUrl, currentTime, duration, audioRef, verseTimings,`
ctx = ctx.replace(
  'audioRef, verseTimings,',
  'audioRef, verseTimings, isTimingLoading,'
);

// 4. Update fetch logic
const fetchRegex = /\/\/ Fetch mp3quran timing[\s\S]*?\.catch\(err => console\.error\("Failed to fetch timing:", err\)\);/;
const newFetch = `// Fetch mp3quran timing
    setIsTimingLoading(true);
    fetch(\`https://www.mp3quran.net/api/v3/ayat_timing?read=\${reciter.id}&surah=\${activeSurahId}\`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedTimings = data.map((t: any) => ({
            verse_key: \`\${activeSurahId}:\${t.ayah}\`,
            timestamp_from: t.start_time,
            timestamp_to: t.end_time,
            duration: t.end_time - t.start_time
          }));
          setVerseTimings(mappedTimings);
        }
      })
      .catch(err => console.error("Failed to fetch timing:", err))
      .finally(() => setIsTimingLoading(false));`;
ctx = ctx.replace(fetchRegex, newFetch);

fs.writeFileSync('src/app/context/GlobalAudioContext.tsx', ctx);
