import Link from "next/link";
import RecitersGrid from "./RecitersGrid";

export const metadata = {
  title: 'جميع القراء - Quran.co',
  description: 'استمع إلى القرآن الكريم بصوت نخبة من القراء',
};

async function getAllReciters() {
  const [resAr, resEn] = await Promise.all([
    fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", { next: { revalidate: 3600 } }),
    fetch("https://www.mp3quran.net/api/v3/reciters?language=eng", { next: { revalidate: 3600 } })
  ]);

  if (!resAr.ok || !resEn.ok) return [];
  
  const jsonAr = await resAr.json();
  const jsonEn = await resEn.json();
  
  const engNames = new Map();
  if (jsonEn.reciters) {
    jsonEn.reciters.forEach((r: any) => {
      engNames.set(r.id, r.name);
    });
  }
  
  const recitersMap = new Map();
  jsonAr.reciters.forEach((r: any) => {
    if (r.moshaf && r.moshaf.length > 0) {
      const bestMoshaf = r.moshaf.find((m: any) => m.name.includes('مجود')) || r.moshaf[0];
      recitersMap.set(r.id, {
        id: bestMoshaf.id,
        reciter_name: r.name,
        reciter_name_eng: engNames.get(r.id) || "",
        style: bestMoshaf.name,
      });
    }
  });
  
  return Array.from(recitersMap.values());
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
