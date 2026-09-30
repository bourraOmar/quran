const fs = require('fs');

// 1. Update Surah page
let surahPage = fs.readFileSync('src/app/surah/[id]/page.tsx', 'utf8');

const surahMeta = `
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const chapterRes = await fetch(\`https://api.quran.com/api/v4/chapters/\${id}\`);
    const chapterJson = await chapterRes.json();
    const chapterName = chapterJson.chapter.name_arabic;
    
    return {
      title: \`سورة \${chapterName}\`,
      description: \`اقرأ واستمع إلى سورة \${chapterName} مع التفسير الميسر والمزامنة التلقائية.\`,
      openGraph: {
        title: \`سورة \${chapterName} | القرآن الكريم\`,
        description: \`اقرأ واستمع إلى سورة \${chapterName} من القرآن الكريم.\`,
      },
    };
  } catch (error) {
    return {
      title: \`سورة \${id}\`,
    };
  }
}
`;

if (!surahPage.includes('generateMetadata')) {
  surahPage = surahPage.replace('export default async function SurahPage', surahMeta + '\nexport default async function SurahPage');
  fs.writeFileSync('src/app/surah/[id]/page.tsx', surahPage);
}

// 2. Update Reciter page
let reciterPage = fs.readFileSync('src/app/reciter/[id]/page.tsx', 'utf8');

const reciterMeta = `
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const res = await fetch(\`https://www.mp3quran.net/api/v3/reciters?language=ar&reciter=\${id}\`);
    const data = await res.json();
    const reciterName = data.reciters[0].name;
    
    return {
      title: \`تلاوات \${reciterName}\`,
      description: \`استمع إلى جميع سور القرآن الكريم بصوت القارئ \${reciterName}.\`,
      openGraph: {
        title: \`القارئ \${reciterName} | القرآن الكريم\`,
        description: \`القرآن الكريم كاملاً بصوت \${reciterName}.\`,
      },
    };
  } catch (error) {
    return {
      title: \`القارئ\`,
    };
  }
}
`;

if (!reciterPage.includes('generateMetadata')) {
  reciterPage = reciterPage.replace('export default async function ReciterPage', reciterMeta + '\nexport default async function ReciterPage');
  fs.writeFileSync('src/app/reciter/[id]/page.tsx', reciterPage);
}
