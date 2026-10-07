const fs = require('fs');

let code = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

// Use regex to catch arbitrary whitespace
code = code.replace(
  /<AudioPlayer\s+chapterId={chapter\.id\.toString\(\)}\s+onVerseChange={handleVerseChange}\s*\/>/,
  '<AudioPlayer \n                ref={playerRef}\n                chapterId={chapter.id.toString()} \n                onVerseChange={handleVerseChange} \n              />'
);

fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', code);
console.log('Injected ref={playerRef}');
