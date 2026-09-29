import Link from "next/link";
import Image from "next/image";

interface Chapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    name: string;
  };
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

async function getRecitations() {
  const res = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  
  const recitations: any[] = [];
  json.reciters.forEach((r: any) => {
    r.moshaf.forEach((m: any) => {
      recitations.push({
        id: m.id, // Use moshaf ID as the unique ID for the playlist
        reciter_id: r.id,
        reciter_name: r.name,
        style: m.name,
        server: m.server,
        surah_list: m.surah_list
      });
    });
  });
  return recitations;
}

export default async function Home() {
  const surahs = await getSurahs();
  const recitations = await getRecitations();
  
  // Display only first 12 for the grid to keep it clean as in design
  const topSurahs = surahs.slice(0, 12);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-4 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left Side: Images */}
        <div className="w-full md:flex-1 relative flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 md:mt-0 md:h-[500px]">
           <div className="w-full sm:w-1/2 h-64 md:absolute md:left-10 md:top-10 md:w-2/3 md:h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#f4f7f9] dark:border-[#0f172a] z-10 relative">
              <Image src="/hero1.jpg" alt="Quran 1" fill className="object-cover" />
           </div>
           <div className="w-full sm:w-1/2 h-64 md:absolute md:right-10 md:bottom-10 md:w-2/3 md:h-72 bg-gray-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#f4f7f9] dark:border-[#0f172a] z-20 relative">
              <Image src="/hero2.jpg" alt="Quran 2" fill className="object-cover" />
           </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 text-center md:text-right">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] leading-[1.3] md:leading-[1.2] mb-6">
            تزكية النفس<br/>بقراءة القرآن الكريم
          </h1>
          <p className="text-base md:text-lg text-[#5a7b9c] dark:text-[#94a3b8] mb-8 leading-relaxed max-w-[500px] mx-auto md:mr-0">
            القرآن الكريم هو الكتاب الرئيسي في الإسلام، نزل به جبريل على النبي محمد ليكون هداية للناس كافة.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-end">
             <Link href="/surahs" className="w-full sm:w-auto justify-center bg-[#6b8ba7] text-white px-8 py-4 rounded-full font-bold hover:bg-[#537592] transition-shadow shadow-lg shadow-[#6b8ba7]/30 flex items-center gap-3">
               <span>قراءة القرآن</span>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             </Link>
             <Link href="/reciters" className="w-full sm:w-auto justify-center bg-[#4a6b8c] text-white px-8 py-4 rounded-full font-bold hover:bg-[#395675] transition-shadow shadow-lg shadow-[#4a6b8c]/30 flex items-center gap-3">
               <span>استماع للقرآن</span>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </Link>
          </div>
        </div>
      </section>

      {/* Ticker Banner */}
      <div className="w-full bg-[#e8edf2] dark:bg-[#1e293b] text-[#6b8ba7] dark:text-[#94a3b8] border-y border-[#d8e2eb] dark:border-[#334155] py-4 overflow-hidden whitespace-nowrap text-2xl font-serif flex relative" dir="ltr">
         <div className="animate-[scroll_40s_linear_infinite] flex shrink-0">
            {Array(4).fill(0).map((_, i) => (
              <span key={`first-${i}`} className="flex items-center">
                <span className="mx-8 font-bold" dir="rtl">كتاب أنزلناه إليك مبارك ليدبروا آياته وليتذكر أولوا الألباب</span>
                <span className="text-[#5a7b9c] dark:text-[#94a3b8] text-sm align-middle -translate-y-1">✦</span>
              </span>
            ))}
         </div>
         <div className="animate-[scroll_40s_linear_infinite] flex shrink-0">
            {Array(4).fill(0).map((_, i) => (
              <span key={`second-${i}`} className="flex items-center">
                <span className="mx-8 font-bold" dir="rtl">كتاب أنزلناه إليك مبارك ليدبروا آياته وليتذكر أولوا الألباب</span>
                <span className="text-[#5a7b9c] dark:text-[#94a3b8] text-sm align-middle -translate-y-1">✦</span>
              </span>
            ))}
         </div>
      </div>

      {/* Surah Grid Section */}
      <section id="surahs" className="max-w-[1200px] mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-12">ابدأ رحلة<br/>التنوير</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 text-right">
          {topSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="bg-white dark:bg-[#1e293b] rounded-xl p-5 shadow-sm border border-[#e2e8f0] dark:border-[#334155] hover:border-[#6b8ba7] hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="text-left" dir="ltr">
                <span className="block font-bold text-[#1e354d] dark:text-[#f8fafc] group-hover:text-[#6b8ba7] dark:text-[#94a3b8]">{surah.id}. {surah.name_simple}</span>
                <span className="block text-xs text-[#5a7b9c] dark:text-[#94a3b8] uppercase mt-1">{surah.revelation_place}</span>
              </div>
              <div className="text-right">
                <span className="block font-serif text-xl font-bold text-[#6b8ba7] dark:text-[#94a3b8]">{surah.name_arabic}</span>
                <span className="block text-xs text-[#5a7b9c] dark:text-[#94a3b8] mt-1">{surah.verses_count} آيات</span>
              </div>
            </Link>
          ))}
        </div>
        
        <Link href="/surahs" className="inline-block bg-[#e8edf2] dark:bg-[#1e293b] text-[#1e354d] dark:text-[#f8fafc] px-8 py-3 rounded-full font-bold hover:bg-[#d8e2eb] dark:bg-[#334155] transition-colors">
          عرض جميع السور
        </Link>
      </section>

      {/* Reciters Section */}
      <section className="max-w-[1200px] mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-4">استمع للقرآن بصوت<br/>مقرئك المفضل</h2>
        <p className="text-[#5a7b9c] dark:text-[#94a3b8] mb-12">اكتشف أجمل الأصوات في تلاوة القرآن الكريم.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {recitations.slice(0, 6).map((r: any) => (
             <Link key={r.id} href={`/reciter/${r.id}`} className="bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-sm border border-[#e2e8f0] dark:border-[#334155] group cursor-pointer hover:shadow-xl transition-shadow block text-right">
               <div className="h-48 bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center overflow-hidden relative">
                 <div className="w-full h-full bg-[#d8e2eb] dark:bg-[#334155] group-hover:scale-105 transition-transform duration-500 absolute inset-0 flex items-center justify-center">
                   <svg className="w-20 h-20 text-[#6b8ba7] dark:text-[#94a3b8] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 </div>
               </div>
               <div className="p-6">
                 <h3 className="font-bold text-xl text-[#1e354d] dark:text-[#f8fafc] mb-1">{r.reciter_name}</h3>
                 <p className="text-sm text-[#5a7b9c] dark:text-[#94a3b8]">{r.style}</p>
               </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full bg-[#6b8ba7] py-20 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ffffff] to-transparent"></div>
         <div className="max-w-[800px] mx-auto text-center relative z-10 px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">ابدأ رحلتك<br/>مع القرآن الكريم</h2>
            <p className="text-[#e2e8f0] text-lg mb-10">انضم إلى ملايين المسلمين في قراءة واستماع وتعلم القرآن كل يوم.</p>
            <div className="flex justify-center gap-4">
               <Link href="/surahs" className="bg-white dark:bg-[#1e293b] text-[#6b8ba7] dark:text-[#94a3b8] px-8 py-4 rounded-full font-bold hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors shadow-lg flex items-center gap-3">
                 <span>قراءة القرآن</span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
               </Link>
               <Link href="/reciters" className="bg-[#1e354d] text-white px-8 py-4 rounded-full font-bold hover:bg-[#0f172a] transition-colors shadow-lg flex items-center gap-3">
                 <span>استماع للقرآن</span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
