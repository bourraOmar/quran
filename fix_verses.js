const fs = require('fs');
let code = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// Fix verses state type
code = code.replace(
  'const [verses, setVerses] = useState<{ id: number; text_uthmani: string }[]>([]);',
  'const [verses, setVerses] = useState<{ id: number; verse_key: string; text_uthmani: string }[]>([]);'
);

// Fix the timing check in auto-scroll effect
code = code.replace(
  'const timing = verseTimings.find(t => t.verse_key === `${activeSurahId}:${verse.id}`);',
  'const timing = verseTimings.find(t => t.verse_key === verse.verse_key);'
);

// Fix the timing check in the render map
code = code.replace(
  'const timing = verseTimings.find(t => t.verse_key === `${activeSurahId}:${verse.id}`);',
  'const timing = verseTimings.find(t => t.verse_key === verse.verse_key);'
);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', code);
