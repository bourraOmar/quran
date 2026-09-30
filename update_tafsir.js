const fs = require('fs');

// 1. Update page.tsx
let page = fs.readFileSync('src/app/surah/[id]/page.tsx', 'utf8');

page = page.replace(
  /fetch\(\`https:\/\/api\.quran\.com\/api\/v4\/quran\/translations\/131\?chapter_number=\$\{id\}\`/,
  'fetch(`https://api.quran.com/api/v4/tafsirs/16/by_chapter/${id}`'
);

page = page.replace(/transJson\.translations/g, 'transJson.tafsirs');

fs.writeFileSync('src/app/surah/[id]/page.tsx', page);

// 2. Update SurahReader.tsx
let reader = fs.readFileSync('src/app/surah/[id]/SurahReader.tsx', 'utf8');

reader = reader.replace(/إخفاء الترجمة/g, 'إخفاء التفسير');
reader = reader.replace(/إظهار الترجمة/g, 'إظهار التفسير');

// Change dir="ltr" to dir="rtl" for the translation div since it's Arabic Tafsir now
reader = reader.replace(
  'dir="ltr" dangerouslySetInnerHTML={{ __html: verse.translation }}',
  'dir="rtl" dangerouslySetInnerHTML={{ __html: verse.translation }}'
);

fs.writeFileSync('src/app/surah/[id]/SurahReader.tsx', reader);
