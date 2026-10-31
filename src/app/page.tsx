import Link from "next/link";
import Image from "next/image";
import ApkFileIcon from "./components/ApkFileIcon";
import InteractiveMockup from "./components/InteractiveMockup";
import InstallAppAction from "./components/InstallAppAction";

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
  try {
    const res = await fetch("https://api.quran.com/api/v4/chapters", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.chapters || [];
  } catch {
    return [];
  }
}

async function getRecitations() {
  try {
    const res = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recitations: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json.reciters?.forEach((r: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      r.moshaf?.forEach((m: any) => {
        recitations.push({
          id: m.id,
          reciter_id: r.id,
          reciter_name: r.name,
          style: m.name,
          server: m.server,
          surah_list: m.surah_list,
        });
      });
    });
    return recitations;
  } catch {
    return [];
  }
}

export default async function Home() {
  const surahs = await getSurahs();
  const recitations = await getRecitations();
  const topSurahs = surahs.slice(0, 8);

  return (
    <div className="w-full">
      {/* Hero Section: App Showcase & Installation CTA */}
      <section className="max-w-[1300px] mx-auto px-4 pt-10 pb-16 md:py-20 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Side (Desktop): Interactive Smartphone App Mockup */}
        <div className="w-full lg:flex-1 flex justify-center items-center">
          <InteractiveMockup />
        </div>

        {/* Right Side: Copy & Direct Install Actions */}
        <div className="w-full lg:flex-1 text-center md:text-right">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 text-[#395675] dark:text-[#94a3b8] px-4 py-2 rounded-full text-xs font-bold mb-5 border border-[#4a6b8c]/20">
            <ApkFileIcon className="w-4 h-4 shrink-0 text-[#0f8e5d] dark:text-[#4ade80]" />
            <span>تطبيق أُنس الرسمي • متاح الآن مجاناً للأندرويد والويب</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1e354d] dark:text-[#f8fafc] leading-[1.25] mb-6">
            تطبيق أُنس<br />
            <span className="text-[#4a6b8c] dark:text-[#94a3b8]">رفيقك الإيماني</span> اليومي
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-[#4a6b8c] dark:text-[#94a3b8] mb-8 leading-relaxed max-w-[580px] mx-auto md:mr-0 font-medium">
            تطبيق إسلامي شامل وخفيف الحجم، صُمم ليرافقك في كل لحظة: استماع متواصل للقرآن في الخلفية حتى مع إغلاق الشاشة، قراءة مريحة للمصحف الشريف، مواقيت الصلاة الدقيقة، وأذكار الصباح والمساء — بدون أي إعلانات نهائياً.
          </p>

          {/* Install & Download CTA Block */}
          <InstallAppAction />

          {/* Quick Feature Pills */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto md:mr-0 mt-8 pt-8 border-t border-[#e2e8f0] dark:border-[#334155]/60 text-center">
            <div className="p-3 bg-white/60 dark:bg-[#1e293b]/60 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="block text-base sm:text-lg font-black text-[#0f8e5d] dark:text-[#4ade80]">مجاني 100%</span>
              <span className="block text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5">خالٍ تماماً من الإعلانات</span>
            </div>
            <div className="p-3 bg-white/60 dark:bg-[#1e293b]/60 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="block text-base sm:text-lg font-black text-[#1e354d] dark:text-white">6.0 MB</span>
              <span className="block text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5">خفيف وفائق السرعة</span>
            </div>
            <div className="p-3 bg-white/60 dark:bg-[#1e293b]/60 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="block text-base sm:text-lg font-black text-[#1e354d] dark:text-white">في الخلفية</span>
              <span className="block text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5">يعمل والشاشة مغلقة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Islamic Ticker Banner */}
      <div className="w-full bg-[#e8edf2] dark:bg-[#1e293b] text-[#395675] dark:text-[#94a3b8] border-y border-[#d8e2eb] dark:border-[#334155] py-4 overflow-hidden whitespace-nowrap text-xl sm:text-2xl font-serif flex relative" dir="ltr">
        <div className="animate-[scroll_40s_linear_infinite] flex shrink-0" style={{ willChange: "transform" }}>
          {Array(4).fill(0).map((_, i) => (
            <span key={`first-${i}`} className="flex items-center">
              <span className="mx-8 font-bold" dir="rtl">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</span>
              <span className="text-[#4a6b8c] dark:text-[#94a3b8] text-sm align-middle -translate-y-0.5">✦</span>
              <span className="mx-8 font-bold" dir="rtl">كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ</span>
              <span className="text-[#4a6b8c] dark:text-[#94a3b8] text-sm align-middle -translate-y-0.5">✦</span>
            </span>
          ))}
        </div>
        <div className="animate-[scroll_40s_linear_infinite] flex shrink-0" style={{ willChange: "transform" }}>
          {Array(4).fill(0).map((_, i) => (
            <span key={`second-${i}`} className="flex items-center">
              <span className="mx-8 font-bold" dir="rtl">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</span>
              <span className="text-[#4a6b8c] dark:text-[#94a3b8] text-sm align-middle -translate-y-0.5">✦</span>
              <span className="mx-8 font-bold" dir="rtl">كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ</span>
              <span className="text-[#4a6b8c] dark:text-[#94a3b8] text-sm align-middle -translate-y-0.5">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Why Uns App Features Section */}
      <section className="max-w-[1200px] mx-auto py-20 px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a6b8c] dark:text-[#94a3b8] bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 px-3.5 py-1.5 rounded-full mb-3">
            <span>مميزات حصرية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1e354d] dark:text-[#f8fafc] mb-4">
            لماذا تختار تطبيق أُنس على هاتفك؟
          </h2>
          <p className="text-sm sm:text-base text-[#4a6b8c] dark:text-[#94a3b8]">
            صُمم التطبيق ليوفر لك تجربة إيمانية متكاملة بهاتفك مع الحفاظ على بطاريتك وسرعة جهازك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#1e293b] p-7 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-xs hover:shadow-md hover:border-[#4a6b8c]/40 transition-all text-right group">
            <div className="w-14 h-14 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 text-[#4a6b8c] dark:text-[#94a3b8] flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
              🎧
            </div>
            <h3 className="text-xl font-bold text-[#1e354d] dark:text-white mb-2">
              استماع في الخلفية وشاشة القفل
            </h3>
            <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed">
              استمع لتلاوات عذبة بأصوات كبار القراء، مع استمرار الصوت بسلاسة أثناء تصفح التطبيقات الأخرى أو عند قفل شاشة الهاتف.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#1e293b] p-7 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-xs hover:shadow-md hover:border-[#4a6b8c]/40 transition-all text-right group">
            <div className="w-14 h-14 rounded-2xl bg-[#0f8e5d]/10 text-[#0f8e5d] dark:text-[#4ade80] flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
              🚫
            </div>
            <h3 className="text-xl font-bold text-[#1e354d] dark:text-white mb-2">
              خالٍ تماماً من الإعلانات
            </h3>
            <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed">
              تطبيق أُنس وقف خالص لوجه الله، لا يحتوي على أي إعلانات مزعجة أو مقاطعات تجارية لتنعم بخشوع تام أثناء القراءة والاستماع.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#1e293b] p-7 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-xs hover:shadow-md hover:border-[#4a6b8c]/40 transition-all text-right group">
            <div className="w-14 h-14 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 text-[#4a6b8c] dark:text-[#94a3b8] flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
              📖
            </div>
            <h3 className="text-xl font-bold text-[#1e354d] dark:text-white mb-2">
              مصحف مريح بالقراءة العمودية
            </h3>
            <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed">
              تصفح سور وآيات القرآن الكريم بالرسم العثماني المعتمد مع إمكانية التمرير العمودي السلس والوصول الفوري للسورة التالية.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-[#1e293b] p-7 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-xs hover:shadow-md hover:border-[#4a6b8c]/40 transition-all text-right group">
            <div className="w-14 h-14 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 text-[#4a6b8c] dark:text-[#94a3b8] flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
              🕌
            </div>
            <h3 className="text-xl font-bold text-[#1e354d] dark:text-white mb-2">
              مواقيت الصلاة وتنبيهات الأذان
            </h3>
            <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed">
              حساب مواقيت الصلاة الخمس بدقة متناهية حسب موقعك الجغرافي في أي دولة، مع عداد تنازلي للوقت المتبقي حتى الصلاة القادمة.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-[#1e293b] p-7 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-xs hover:shadow-md hover:border-[#4a6b8c]/40 transition-all text-right group">
            <div className="w-14 h-14 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 text-[#4a6b8c] dark:text-[#94a3b8] flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
              🧭
            </div>
            <h3 className="text-xl font-bold text-[#1e354d] dark:text-white mb-2">
              الأذكار والقبلة والتسبيح
            </h3>
            <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed">
              أذكار الصباح والمساء، الرقية الشرعية، حصن المسلم، مسبحة إلكترونية تفاعلية، وبوصلة لتحديد اتجاه القبلة أينما كنت.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white dark:bg-[#1e293b] p-7 rounded-3xl border border-[#e2e8f0] dark:border-[#334155] shadow-xs hover:shadow-md hover:border-[#4a6b8c]/40 transition-all text-right group">
            <div className="w-14 h-14 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 text-[#4a6b8c] dark:text-[#94a3b8] flex items-center justify-center text-2xl mb-5 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-[#1e354d] dark:text-white mb-2">
              خفيف وسريع جداً (6 MB)
            </h3>
            <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed">
              حجم صغير للغاية يتيح التثبيت في ثوانٍ معدودة دون التأثير على ذاكرة هاتفك أو استهلاك باقة الإنترنت.
            </p>
          </div>
        </div>
      </section>

      {/* App Real Screenshots Gallery */}
      <section className="max-w-[1200px] mx-auto py-16 px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a6b8c] dark:text-[#94a3b8] bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 px-3.5 py-1.5 rounded-full mb-3">
            <span>واجهات التطبيق الحقيقية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1e354d] dark:text-[#f8fafc] mb-3">
            تجربة بصرية مريحة للعين ومتقنة
          </h2>
          <p className="text-sm sm:text-base text-[#4a6b8c] dark:text-[#94a3b8]">
            شاهد التصميم الداخلي لتطبيق أُنس مع الوضع الداكن المريح والخطوط الواضحة
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[9/19.5] relative rounded-[28px] overflow-hidden shadow-xl border-4 border-[#223547] dark:border-[#33485d] bg-[#0c151f] hover:scale-[1.02] transition-transform duration-300">
              <Image src="/images/app-screen-home.png" alt="الشاشة الرئيسية - تطبيق أُنس" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
            </div>
            <h4 className="text-sm font-bold text-[#1e354d] dark:text-white mt-3 text-center">الرئيسية ومواقيت الصلاة</h4>
            <p className="text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] text-center mt-0.5">أوقات الصلاة والعد التنازلي</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full aspect-[9/19.5] relative rounded-[28px] overflow-hidden shadow-xl border-4 border-[#223547] dark:border-[#33485d] bg-[#0c151f] hover:scale-[1.02] transition-transform duration-300">
              <Image src="/images/app-screen-quran.png" alt="المصحف الشريف - تطبيق أُنس" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
            </div>
            <h4 className="text-sm font-bold text-[#1e354d] dark:text-white mt-3 text-center">المصحف الشريف</h4>
            <p className="text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] text-center mt-0.5">فهرس السور بالرسم العثماني</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full aspect-[9/19.5] relative rounded-[28px] overflow-hidden shadow-xl border-4 border-[#223547] dark:border-[#33485d] bg-[#0c151f] hover:scale-[1.02] transition-transform duration-300">
              <Image src="/images/app-screen-reciters.png" alt="أشهر القراء - تطبيق أُنس" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
            </div>
            <h4 className="text-sm font-bold text-[#1e354d] dark:text-white mt-3 text-center">قائمة كبار القراء</h4>
            <p className="text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] text-center mt-0.5">استماع متواصل في الخلفية</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full aspect-[9/19.5] relative rounded-[28px] overflow-hidden shadow-xl border-4 border-[#223547] dark:border-[#33485d] bg-[#0c151f] hover:scale-[1.02] transition-transform duration-300">
              <Image src="/images/app-screen-adhkar.png" alt="الأذكار والأدعية - تطبيق أُنس" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
            </div>
            <h4 className="text-sm font-bold text-[#1e354d] dark:text-white mt-3 text-center">الأذكار وحصن المسلم</h4>
            <p className="text-[11px] text-[#4a6b8c] dark:text-[#94a3b8] text-center mt-0.5">الرقية الشرعية والمسبحة</p>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Installation Guide */}
      <section id="install-guide" className="w-full bg-[#e8edf2] dark:bg-[#1e293b]/70 py-20 border-y border-[#d8e2eb] dark:border-[#334155]">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e354d] dark:text-white mb-3">
              خطوات التثبيت السريعة
            </h2>
            <p className="text-sm sm:text-base text-[#4a6b8c] dark:text-[#94a3b8]">
              ثبّت تطبيق أُنس على هاتفك خلال أقل من دقيقة واحدة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl shadow-sm border border-[#d8e2eb] dark:border-[#334155] text-right relative overflow-hidden">
              <span className="text-6xl font-black text-[#4a6b8c]/15 dark:text-white/10 absolute -left-2 -top-2 select-none">
                01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-[#4a6b8c] text-white flex items-center justify-center font-bold text-lg mb-5 relative z-10 shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-[#1e354d] dark:text-white mb-2 relative z-10">
                تحميل ملف التطبيق
              </h3>
              <p className="text-xs sm:text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed relative z-10">
                اضغط على زر تحميل ملف APK المباشر لهواتف أندرويد (بحجم 6 ميجابايت فقط) أو اضغط &quot;إضافة للشاشة الرئيسية&quot;.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl shadow-sm border border-[#d8e2eb] dark:border-[#334155] text-right relative overflow-hidden">
              <span className="text-6xl font-black text-[#4a6b8c]/15 dark:text-white/10 absolute -left-2 -top-2 select-none">
                02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-[#4a6b8c] text-white flex items-center justify-center font-bold text-lg mb-5 relative z-10 shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-[#1e354d] dark:text-white mb-2 relative z-10">
                فتح الملف والموافقة
              </h3>
              <p className="text-xs sm:text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed relative z-10">
                افتح الملف من قائمة التنزيلات واضغط &quot;تثبيت&quot;. في حال ظهر تنبيه أمان، اختر السماح بالتثبيت من هذا المصدر.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e293b] p-8 rounded-3xl shadow-sm border border-[#d8e2eb] dark:border-[#334155] text-right relative overflow-hidden">
              <span className="text-6xl font-black text-[#4a6b8c]/15 dark:text-white/10 absolute -left-2 -top-2 select-none">
                03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-[#0f8e5d] text-white flex items-center justify-center font-bold text-lg mb-5 relative z-10 shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-[#1e354d] dark:text-white mb-2 relative z-10">
                انطلاق في رحاب القرآن
              </h3>
              <p className="text-xs sm:text-sm text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed relative z-10">
                افتح تطبيق أُنس واستمتع بالاستماع والتلاوة ومواقيت الصلاة والأذكار في أي وقت دون إعلانات.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/downloads/uns-quran.apk"
              download="uns-quran.apk"
              className="inline-flex items-center gap-3 bg-[#4a6b8c] hover:bg-[#395675] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#4a6b8c]/25 hover:shadow-xl transition-all"
            >
              <ApkFileIcon className="w-5 h-5" />
              <span>تحميل ملف APK الآن (6.0 MB)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Online Web Reader Section */}
      <section id="surahs" className="max-w-[1200px] mx-auto py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a6b8c] dark:text-[#94a3b8] bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 px-3.5 py-1.5 rounded-full mb-3">
            <span>تصفح أونلاين</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e354d] dark:text-[#f8fafc] mb-3">
            تصفح القرآن الكريم مباشرة عبر الموقع
          </h2>
          <p className="text-sm text-[#4a6b8c] dark:text-[#94a3b8]">
            يمكنك أيضاً قراءة سور القرآن والاستماع للتلاوات مباشرة من متصفحك
          </p>
        </div>

        {/* Top Surahs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-right">
          {topSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-xs border border-[#e2e8f0] dark:border-[#334155] hover:border-[#4a6b8c] hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="text-left" dir="ltr">
                <span className="block font-bold text-[#1e354d] dark:text-[#f8fafc] group-hover:text-[#4a6b8c] transition-colors">
                  {surah.id}. {surah.name_simple}
                </span>
                <span className="block text-xs text-[#4a6b8c] dark:text-[#94a3b8] uppercase mt-0.5">
                  {surah.revelation_place}
                </span>
              </div>
              <div className="text-right">
                <span className="block font-serif text-xl font-bold text-[#395675] dark:text-[#94a3b8]">
                  {surah.name_arabic}
                </span>
                <span className="block text-xs text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5">
                  {surah.verses_count} آيات
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/surahs"
            className="inline-flex items-center gap-2 bg-[#e8edf2] dark:bg-[#1e293b] text-[#1e354d] dark:text-[#f8fafc] px-7 py-3 rounded-full font-bold hover:bg-[#d8e2eb] dark:hover:bg-[#334155] transition-colors text-sm"
          >
            <span>عرض جميع سور القرآن (114 سورة)</span>
            <span>←</span>
          </Link>
          <Link
            href="/reciters"
            className="inline-flex items-center gap-2 bg-[#e8edf2] dark:bg-[#1e293b] text-[#1e354d] dark:text-[#f8fafc] px-7 py-3 rounded-full font-bold hover:bg-[#d8e2eb] dark:hover:bg-[#334155] transition-colors text-sm"
          >
            <span>الاستماع لأشهر القراء</span>
            <span>←</span>
          </Link>
        </div>
      </section>

      {/* Reciters Preview Section */}
      {recitations.length > 0 && (
        <section className="max-w-[1200px] mx-auto pb-20 px-4 text-center">
          <h3 className="text-2xl font-bold text-[#1e354d] dark:text-[#f8fafc] mb-8">
            أصوات خاشعة لكبار القراء
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recitations.slice(0, 3).map((r: any) => (
              <Link
                key={r.id}
                href={`/reciter/${r.id}`}
                className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-xs border border-[#e2e8f0] dark:border-[#334155] hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 flex items-center justify-center text-[#4a6b8c] dark:text-[#94a3b8] shrink-0 font-bold">
                  🎧
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#1e354d] dark:text-[#f8fafc]">
                    {r.reciter_name}
                  </h4>
                  <p className="text-xs text-[#4a6b8c] dark:text-[#94a3b8] mt-0.5">{r.style}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final Bottom Conversion Banner */}
      <section className="w-full bg-[#4a6b8c] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
        <div className="max-w-[800px] mx-auto text-center relative z-10 px-4">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 mx-auto mb-6 p-1 bg-white">
            <Image
              src="/logo.jpg"
              alt="أُنس"
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            اجعل القرآن رفيقك الدائم
          </h2>
          <p className="text-[#e2e8f0] text-sm sm:text-base mb-10 max-w-lg mx-auto leading-relaxed">
            حمّل تطبيق أُنس الآن على هاتفك مجاناً واستمتع بالقراءة والتلاوة في أي وقت ومكان بدون إعلانات.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/downloads/uns-quran.apk"
              download="uns-quran.apk"
              className="bg-white text-[#395675] hover:bg-gray-100 px-8 py-4 rounded-2xl font-black transition-all shadow-xl flex items-center gap-3 text-right group"
            >
              <ApkFileIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform text-[#0f8e5d]" />
              <div>
                <span className="block text-base leading-tight font-extrabold">تحميل تطبيق أندرويد (APK)</span>
                <span className="block text-[11px] text-[#4a6b8c] font-normal">تنزيل مباشر 116 MB • مجاني 100%</span>
              </div>
            </a>

            <Link
              href="/download"
              className="bg-[#1e354d] text-white hover:bg-[#0f172a] px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-3"
            >
              <span>صفحة التحميل وتفاصيل الإصدار</span>
              <span>←</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
