export const dynamic = 'force-dynamic';
import Link from "next/link";
import SurahReader from "./SurahReader";
import Sidebar from "../../components/Sidebar";

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translation?: string;
}

interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  revelation_place: string;
  verses_count: number;
  translated_name: {
    name: string;
  };
  bismillah_pre: boolean;
}

async function getSurahData(id: string) {
  const chapterRes = await fetch(`https://api.quran.com/api/v4/chapters/${id}`, { next: { revalidate: 3600 } });
  if (!chapterRes.ok) throw new Error("Failed to fetch chapter info");
  const chapterJson = await chapterRes.json();
  const chapter: Chapter = chapterJson.chapter;

  const versesRes = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`, { next: { revalidate: 3600 } });
  if (!versesRes.ok) throw new Error("Failed to fetch verses");
  const versesJson = await versesRes.json();
  const verses: Verse[] = versesJson.verses;

  const transRes = await fetch(`https://api.quran.com/api/v4/quran/translations/131?chapter_number=${id}`, { next: { revalidate: 3600 } });
  if (transRes.ok) {
    const transJson = await transRes.json();
    verses.forEach((verse, index) => {
      if (transJson.translations[index]) {
        verse.translation = transJson.translations[index].text;
      }
    });
  }

  return { chapter, verses };
}

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { showTranslation } = await searchParams;
  const isTranslationEnabled = showTranslation === "true";
  
  const { chapter, verses } = await getSurahData(id);
  const surahName = `سورة ${chapter.name_arabic}`;

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-4">
      <SurahReader chapter={chapter} verses={verses} isTranslationEnabled={isTranslationEnabled} />
    </div>
  );
}
