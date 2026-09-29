export const dynamic = 'force-dynamic';
import ReciterPlaylist from "./ReciterPlaylist";

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
  if (!res.ok) throw new Error("Failed to fetch surahs");
  const json = await res.json();
  return json.chapters;
}

async function getReciterInfo(id: string) {
  const res = await fetch("https://api.qurancdn.com/api/qdc/audio/reciters?locale=ar", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  
  const reciterData = json.reciters.find((r: any) => r.id.toString() === id);
  if (!reciterData) return null;

  return {
    id: reciterData.id,
    name: reciterData.translated_name?.name || reciterData.name,
    style: reciterData.style || null,
    translated_name: reciterData.translated_name
  };
}

export default async function ReciterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const surahs = await getSurahs();
  const reciter = await getReciterInfo(resolvedParams.id);

  if (!reciter) {
    return <div className="text-center py-20 text-[#1e354d] dark:text-[#f8fafc] text-2xl font-bold">القارئ غير موجود</div>;
  }

  return (
    <div className="w-full">
      <ReciterPlaylist surahs={surahs} reciter={reciter} />
    </div>
  );
}
