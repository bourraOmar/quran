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
        <p className="text-[#5a7b9c] dark:text-[#94a3b8] text-lg max-w-2xl mx-auto">
          تصفح جميع سور القرآن الكريم المائة وأربع عشرة سورة، مكتوبة بالتشكيل مع إمكانية الاستماع والترجمة.
        </p>
      </div>

      <SurahsGrid initialSurahs={surahs} />
    </div>
  );
}
