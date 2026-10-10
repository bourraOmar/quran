/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
export const dynamic = 'force-dynamic';
import Link from "next/link";
import RecitersGrid from "./RecitersGrid";

export const metadata = {
  title: 'جميع القراء - أُنس',
  description: 'استمع إلى القرآن الكريم بصوت نخبة من القراء',
};

async function getAllReciters() {
  const res = await fetch("https://mp3quran.net/api/v3/ayat_timing/reads", { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  
  const json = await res.json();
  
  return json.map((r: any) => ({
    id: r.id,
    reciter_name: r.name,
    reciter_name_eng: "", // English name not provided by this endpoint, fallback to empty
    style: r.rewaya
  }));
}

export default async function RecitersPage() {
  const reciters = await getAllReciters();

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] pb-32">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#8ba7c0] to-[#f4f7f9] dark:from-[#0f172a] dark:to-[#1e293b] dark:from-[#0f172a] dark:to-[#1e293b] pt-24 pb-12 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-4">
          القرّاء
        </h1>
        <p className="text-[#1e354d] dark:text-[#f8fafc]/80 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          استمع للقرآن الكريم بصوت أكثر من {reciters.length} قارئ من العالم الإسلامي
        </p>
      </div>

      {/* Grid */}
      <RecitersGrid initialReciters={reciters} />
    </div>
  );
}
