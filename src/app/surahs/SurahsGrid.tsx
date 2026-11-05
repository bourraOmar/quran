"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  start_page: number;
  end_page: number;
}

function toArabicDigits(num: number | string): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => digits[+d]);
}

function normalizeArabic(text: string): string {
  return text
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim();
}

type FilterType = "all" | "makkah" | "madinah";
type SortType = "mushaf" | "verses" | "pages";

export default function SurahsGrid({ initialSurahs }: { initialSurahs: Chapter[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("mushaf");

  const filteredSurahs = useMemo(() => {
    const query = normalizeArabic(search);
    const numQuery = parseInt(search.trim(), 10);

    let list = initialSurahs.filter((surah) => {
      // Type filter
      if (filterType !== "all" && surah.revelation_place !== filterType) {
        return false;
      }

      // Search query
      if (!query) return true;

      const normArabic = normalizeArabic(surah.name_arabic);
      const simple = surah.name_simple.toLowerCase();

      // Number match
      if (!isNaN(numQuery) && surah.id === numQuery) return true;

      // Text match
      return (
        normArabic.includes(query) ||
        `سوره ${normArabic}`.includes(query) ||
        simple.includes(query)
      );
    });

    // Sorting
    if (sortBy === "verses") {
      list = [...list].sort((a, b) => b.verses_count - a.verses_count);
    } else if (sortBy === "pages") {
      list = [...list].sort((a, b) => a.start_page - b.start_page);
    } else {
      list = [...list].sort((a, b) => a.id - b.id);
    }

    return list;
  }, [initialSurahs, search, filterType, sortBy]);

  const makkahCount = useMemo(
    () => initialSurahs.filter((s) => s.revelation_place === "makkah").length,
    [initialSurahs]
  );
  const madinahCount = useMemo(
    () => initialSurahs.filter((s) => s.revelation_place === "madinah").length,
    [initialSurahs]
  );

  return (
    <div className="w-full">
      {/* Controls Bar: Search + Filter Tabs + Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث برقم السورة أو اسمها (البقرة، Al-Baqarah)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#131d2a] border border-[#e2e8f0] dark:border-[#1e293b] focus:border-[#0f8e5d] dark:focus:border-[#4ade80] rounded-2xl px-5 py-3 pr-11 text-sm text-[#1e354d] dark:text-[#f8fafc] placeholder-[#8ba7c0] outline-none shadow-xs transition-all"
          />
          <svg
            className="w-4 h-4 text-[#8ba7c0] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8ba7c0] hover:text-[#1e354d] dark:hover:text-white transition-colors"
              aria-label="مسح البحث"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Revelation Place Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-[#e8edf2] dark:bg-[#0c1421] border border-[#e2e8f0] dark:border-[#1e293b] text-xs font-bold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === "all"
                  ? "bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white shadow-xs"
                  : "text-[#4a6b8c] dark:text-[#8ba7c0] hover:text-[#1e354d] dark:hover:text-white"
              }`}
            >
              الكل ({toArabicDigits(initialSurahs.length)})
            </button>
            <button
              onClick={() => setFilterType("makkah")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === "makkah"
                  ? "bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white shadow-xs"
                  : "text-[#4a6b8c] dark:text-[#8ba7c0] hover:text-[#1e354d] dark:hover:text-white"
              }`}
            >
              مكية ({toArabicDigits(makkahCount)})
            </button>
            <button
              onClick={() => setFilterType("madinah")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === "madinah"
                  ? "bg-white dark:bg-[#1e293b] text-[#1e354d] dark:text-white shadow-xs"
                  : "text-[#4a6b8c] dark:text-[#8ba7c0] hover:text-[#1e354d] dark:hover:text-white"
              }`}
            >
              مدنية ({toArabicDigits(madinahCount)})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#4a6b8c] dark:text-[#8ba7c0]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-white dark:bg-[#131d2a] border border-[#e2e8f0] dark:border-[#1e293b] text-[#1e354d] dark:text-white px-3 py-2 rounded-2xl outline-none font-bold cursor-pointer text-xs shadow-xs"
            >
              <option value="mushaf">ترتيب المصحف (١ - ١١٤)</option>
              <option value="verses">حسب عدد الآيات (الأطول أولاً)</option>
              <option value="pages">حسب رقم الصفحة</option>
            </select>
          </div>

        </div>

      </div>

      {/* Surahs Grid */}
      {filteredSurahs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="group bg-white dark:bg-[#131d2a] p-4 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] hover:border-[#0f8e5d]/40 dark:hover:border-[#0f8e5d]/40 hover:shadow-md transition-all flex items-center justify-between"
            >
              {/* Right Side (Arabic in RTL) */}
              <div className="text-right">
                <span className="block font-serif text-xl font-bold text-[#1e354d] dark:text-[#f8fafc] group-hover:text-[#0f8e5d] dark:group-hover:text-[#4ade80] transition-colors leading-tight" style={{ fontFamily: 'var(--font-amiri)' }}>
                  سورة {surah.name_arabic}
                </span>
                
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0]">
                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                    surah.revelation_place === "makkah"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    {surah.revelation_place === "makkah" ? "مكية" : "مدنية"}
                  </span>
                  <span>•</span>
                  <span>{toArabicDigits(surah.verses_count)} آية</span>
                  <span>•</span>
                  <span>صفحة {toArabicDigits(surah.start_page)}</span>
                </div>
              </div>

              {/* Left Side: Number Badge + English Name */}
              <div className="flex flex-col items-center justify-center shrink-0 mr-3">
                <span className="w-9 h-9 rounded-xl bg-[#f4f7f9] dark:bg-[#0c1421] text-xs font-mono font-bold text-[#1e354d] dark:text-[#8ba7c0] flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:bg-[#0f8e5d]/10 group-hover:text-[#0f8e5d] dark:group-hover:text-[#4ade80] transition-colors">
                  {toArabicDigits(surah.id)}
                </span>
                <span className="text-[10px] text-[#8ba7c0] mt-1 font-medium tracking-tight truncate max-w-[70px]">
                  {surah.name_simple}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center bg-white dark:bg-[#131d2a] rounded-3xl border border-[#e2e8f0] dark:border-[#1e293b] p-8 max-w-md mx-auto">
          <svg className="w-12 h-12 text-[#8ba7c0] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">
            لم يتم العثور على أية سورة
          </h3>
          <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mb-4">
            تأكد من كتابة اسم السورة أو رقمها بشكل صحيح
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilterType("all");
            }}
            className="px-4 py-2 bg-[#0f8e5d] text-white text-xs font-bold rounded-xl hover:bg-[#0c734b] transition-all"
          >
            إعادة تعيين البحث
          </button>
        </div>
      )}
    </div>
  );
}
