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
  const res = await fetch("https://mp3quran.net/api/v3/ayat_timing/reads", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  
  const r = json.find((r: any) => r.id.toString() === id);
  if (!r) return null;

  return {
    id: r.id,
    reciter_id: r.id,
    reciter_name: r.name,
    style: r.rewaya,
    server: r.folder_url,
    surah_list: Array.from({length: r.soar_count}, (_, i) => (i + 1).toString()).join(",")
  };
}


export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const res = await fetch(`https://www.mp3quran.net/api/v3/reciters?language=ar&reciter=${id}`);
    const data = await res.json();
    const reciterName = data.reciters[0].name;
    
    return {
      title: `تلاوات ${reciterName}`,
      description: `استمع إلى جميع سور القرآن الكريم بصوت القارئ ${reciterName}.`,
      openGraph: {
        title: `القارئ ${reciterName} | القرآن الكريم`,
        description: `القرآن الكريم كاملاً بصوت ${reciterName}.`,
      },
    };
  } catch (error) {
    return {
      title: `القارئ`,
    };
  }
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
