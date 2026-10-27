export const dynamic = 'force-dynamic';
import Link from "next/link";
import SurahsGrid from "./SurahsGrid";

interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

async function getSurahs(): Promise<Chapter[]> {
  const res = await fetch("https://api.quran.com/api/v4/chapters", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch surahs");
  }
  const json = await res.json();
  return json.chapters;
}

export default async function AllSurahsPage() {
  const surahs = await getSurahs();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-6">
          فهرس سور القرآن الكريم
        </h1>
        <p className="text-[#4a6b8c] dark:text-[#94a3b8] text-lg max-w-2xl mx-auto">
          تصفح جميع سور القرآن الكريم المائة وأربع عشرة سورة، مكتوبة بالتشكيل مع إمكانية الاستماع والترجمة.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10">
        <span className="bg-[#4a6b8c] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-sm">
          فهرس السور
        </span>
        <Link
          href="/mushaf"
          className="bg-white dark:bg-[#1e293b] hover:bg-gray-100 dark:hover:bg-[#334155] text-[#1e354d] dark:text-[#f8fafc] border border-black/5 dark:border-white/5 px-5 py-2.5 rounded-full font-bold text-sm transition-colors shadow-xs flex items-center gap-2"
        >
          <span>📖 قراءة بالمصحف الشريف (صفحات)</span>
          <span>←</span>
        </Link>
      </div>

      <SurahsGrid initialSurahs={surahs} />
    </div>
  );
}
