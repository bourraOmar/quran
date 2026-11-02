export const dynamic = 'force-dynamic';
import SurahReader from "./SurahReader";

interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  code_v2?: string;
  line_number: number;
  page_number: number;
  text: string;
}

interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  code_v2?: string;
  v2_page?: number;
  words?: Word[];
  translations?: {
    id: number;
    text: string;
  }[];
}

interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

async function getSurahData(id: string) {
  const chapterRes = await fetch(`https://api.quran.com/api/v4/chapters/${id}`);
  if (!chapterRes.ok) throw new Error("Failed to fetch chapter");
  const chapterJson = await chapterRes.json();
  const chapter: Chapter = chapterJson.chapter;

  const versesRes = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${id}?language=ar&words=true&translations=16&per_page=300&fields=text_uthmani,code_v2,v2_page&word_fields=code_v2,line_number,page_number&mushaf=1`
  );
  if (!versesRes.ok) throw new Error("Failed to fetch verses");
  const versesJson = await versesRes.json();
  const verses: Verse[] = versesJson.verses;

  return { chapter, verses };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const chapterRes = await fetch(`https://api.quran.com/api/v4/chapters/${id}`);
    const chapterJson = await chapterRes.json();
    const chapterName = chapterJson.chapter.name_arabic;
    
    return {
      title: `سورة ${chapterName}`,
      description: `اقرأ واستمع إلى سورة ${chapterName} بالتشكيل والترجمة من القرآن الكريم.`,
      openGraph: {
        title: `سورة ${chapterName} | القرآن الكريم`,
        description: `اقرأ واستمع إلى سورة ${chapterName} من القرآن الكريم.`,
      },
    };
  } catch {
    return {
      title: `سورة ${id}`,
    };
  }
}

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ showTranslation?: string }>;
}) {
  const { id } = await params;
  const { showTranslation } = await searchParams;
  const isTranslationEnabled = showTranslation === "true";
  
  const { chapter, verses } = await getSurahData(id);

  return (
    <div className="max-w-[1600px] mx-auto py-8 sm:py-12 px-3 sm:px-6">
      <SurahReader chapter={chapter} verses={verses} isTranslationEnabled={isTranslationEnabled} />
    </div>
  );
}
