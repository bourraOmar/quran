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
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] pb-32 pt-8 px-4 md:px-8 transition-colors" dir="rtl">
      <div className="max-w-[1300px] mx-auto">
        {/* Header Bar matching Dua/Dhikr */}
        <div className="flex items-center justify-between mb-10 pt-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-11 h-11 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center text-[#1e354d] dark:text-white shadow-sm border border-transparent hover:border-[#4a6b8c]/30 active:scale-95 transition-all"
              title="الرجوع للرئيسية"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e354d] dark:text-white">
                سور القرآن الكريم
              </h1>
              <p className="text-sm text-[#4a6b8c] dark:text-[#8ba7c0] mt-1">
                تصفح واقرأ جميع سور القرآن الكريم المكتوبة بالتشكيل
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] text-xs font-bold">
            <span>114 سورة كاملة</span>
          </div>
        </div>

        {/* Surahs Grid Component */}
        <SurahsGrid initialSurahs={surahs} />
      </div>
    </div>
  );
}
