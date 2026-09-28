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
    <div className="max-w-[1400px] mx-auto py-12 px-4 flex flex-col md:flex-row gap-12">
      
      {/* Sidebar - Right Side in RTL */}
      <div className="w-full md:w-[300px] shrink-0">
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-[#e2e8f0] dark:border-[#334155] p-6 shadow-sm sticky top-8">
           <h3 className="font-bold text-[#1e354d] dark:text-[#f8fafc] text-lg mb-4 text-right border-b border-[#e2e8f0] dark:border-[#334155] pb-4">فهرس السورة</h3>
           <ul className="flex flex-col gap-3 text-right">
             <li className="text-[#6b8ba7] dark:text-[#94a3b8] font-bold cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] p-2 rounded transition-colors">قراءة السورة</li>
             <li className="text-[#5a7b9c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#6b8ba7] dark:text-[#94a3b8] p-2 rounded transition-colors">استماع للسورة</li>
             <li className="text-[#5a7b9c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#6b8ba7] dark:text-[#94a3b8] p-2 rounded transition-colors">
               <Link href={`/surah/${id}?showTranslation=${isTranslationEnabled ? 'false' : 'true'}`}>
                 {isTranslationEnabled ? "إخفاء الترجمة" : "إظهار الترجمة"}
               </Link>
             </li>
             <li className="text-[#5a7b9c] dark:text-[#94a3b8] cursor-pointer hover:bg-[#e8edf2] dark:bg-[#1e293b] hover:text-[#6b8ba7] dark:text-[#94a3b8] p-2 rounded transition-colors">
               <Link href="/">العودة للفهرس</Link>
             </li>
           </ul>
        </div>
      </div>

      {/* Main Content - Left Side in RTL */}
      <SurahReader chapter={chapter} verses={verses} isTranslationEnabled={isTranslationEnabled} />
    </div>
  );
}
