export const revalidate = 86400;

import { Metadata } from "next";
import SurahsGrid from "./SurahsGrid";
import { QURAN_CHAPTERS } from "@/data/quranChapters";

export const metadata: Metadata = {
  title: "فهرس سور القرآن الكريم | تطبيق أُنس",
  description: "تصفح جميع سور القرآن الكريم المائة وأربع عشرة بالرسم العثماني المعتمد، مع معلومات النزول والصفحات والاستماع المباشر.",
};

export default function AllSurahsPage() {
  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>المصحف الشريف</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-4 tracking-tight">
          فهرس سور القرآن الكريم
        </h1>
        <p className="text-sm sm:text-base text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed">
          مائة وأربع عشرة سورة كاملة بالرسم العثماني المعتمد لمجمع الملك فهد، مع إمكانية القراءة المركزة والتفسير الميسر والاستماع المباشر.
        </p>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 text-xs font-semibold text-[#4a6b8c] dark:text-[#8ba7c0]">
          <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#131d2a] border border-[#e2e8f0] dark:border-[#1e293b] shadow-xs">
            ١١٤ سورة
          </span>
          <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#131d2a] border border-[#e2e8f0] dark:border-[#1e293b] shadow-xs">
            ٦,٢٣٦ آية
          </span>
          <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#131d2a] border border-[#e2e8f0] dark:border-[#1e293b] shadow-xs">
            ٣٠ جزءاً
          </span>
          <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#131d2a] border border-[#e2e8f0] dark:border-[#1e293b] shadow-xs">
            ٦٠٤ صفحة
          </span>
        </div>
      </div>

      <SurahsGrid initialSurahs={QURAN_CHAPTERS} />
    </div>
  );
}
