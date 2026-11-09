export const revalidate = 86400;

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

import SurahReader from "./SurahReader";
import { qfFetch } from "@/lib/quranFoundation";
import { QURAN_CHAPTERS } from "@/data/quranChapters";

interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  code_v1?: string;
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
  code_v1?: string;
  code_v2?: string;
  v1_page?: number;
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

// In-memory memory cache for lightning-fast 0ms repeated reads
const versesMemoryCache = new Map<string, Verse[]>();

async function getSurahData(id: string) {
  const chapterIdNum = parseInt(id, 10);
  const localMeta = QURAN_CHAPTERS.find((c: any) => c.id === chapterIdNum);

  const chapter: Chapter = localMeta
    ? {
        id: localMeta.id,
        name_arabic: localMeta.name_arabic,
        name_simple: localMeta.name_simple,
        revelation_place: localMeta.revelation_place,
        verses_count: localMeta.verses_count,
      }
    : {
        id: chapterIdNum,
        name_arabic: `سورة ${id}`,
        name_simple: `Surah ${id}`,
        revelation_place: "makkah",
        verses_count: 7,
      };

  // Return cached verses in 0ms if available
  if (versesMemoryCache.has(id)) {
    return { chapter, verses: versesMemoryCache.get(id)! };
  }

  const versesRes = await qfFetch(
    `verses/by_chapter/${id}?language=ar&words=true&translations=16&per_page=300&fields=text_uthmani,code_v1,code_v2,v1_page,v2_page&word_fields=code_v1,code_v2,text_uthmani,line_number,page_number&mushaf=2`,
    { next: { revalidate: 604800 } }
  );

  if (!versesRes.ok) throw new Error("Failed to fetch verses");
  const versesJson = await versesRes.json();
  const verses: Verse[] = versesJson.verses || [];

  // Cache in memory
  versesMemoryCache.set(id, verses);

  return { chapter, verses };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapterIdNum = parseInt(id, 10);
  const localMeta = QURAN_CHAPTERS.find((c: any) => c.id === chapterIdNum);
  const chapterName = localMeta ? localMeta.name_arabic : id;

  return {
    title: `سورة ${chapterName} | القرآن الكريم`,
    description: `اقرأ واستمع إلى سورة ${chapterName} بالتشكيل والرسم العثماني مع التفسير من القرآن الكريم.`,
    openGraph: {
      title: `سورة ${chapterName} | القرآن الكريم`,
      description: `اقرأ واستمع إلى سورة ${chapterName} من القرآن الكريم.`,
    },
  };
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
    <div className="max-w-[1180px] mx-auto py-8 sm:py-12 px-3 sm:px-6">
      <SurahReader chapter={chapter} verses={verses} isTranslationEnabled={isTranslationEnabled} />
    </div>
  );
}
