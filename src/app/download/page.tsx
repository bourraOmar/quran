import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ApkFileIcon from "../components/ApkFileIcon";

export const metadata: Metadata = {
  title: "تحميل تطبيق أُنس للقرآن الكريم | أندرويد APK",
  description: "حمّل تطبيق أُنس للقرآن الكريم بصيغة APK مباشرة لهواتف أندرويد. تلاوات خاشعة، أذكار الصباح والمساء، مواقيت الصلاة، وبوصلة القبلة.",
};

async function getLatestRelease() {
  try {
    const res = await fetch('https://api.github.com/repos/bourraOmar/uns-app/releases/latest', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'uns-quran-website',
      },
      next: { revalidate: 120 },
    });
    if (res.ok) {
      const data = await res.json();
      const apkAsset = data.assets?.find((a: any) =>
        typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk')
      );
      const sizeMb = apkAsset ? Math.round(apkAsset.size / (1024 * 1024)) : 116;
      const tag = data.tag_name || '1.0.1';
      const cleanVersion = String(tag).replace(/^v/i, '');
      return {
        versionTag: `v${cleanVersion}`,
        versionClean: cleanVersion,
        fileSizeMb: `${sizeMb} MB`,
      };
    }
  } catch (error) {
    console.error('Failed to fetch latest release metadata:', error);
  }
  return {
    versionTag: 'v1.0.1',
    versionClean: '1.0.1',
    fileSizeMb: '116 MB',
  };
}

export default async function DownloadPage() {
  const release = await getLatestRelease();
  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e354d] dark:text-[#f8fafc] py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#4a6b8c] dark:text-[#94a3b8] font-bold">
          <Link href="/" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#0f8e5d] dark:text-[#4ade80]">تحميل تطبيق الأندرويد (APK)</span>
        </div>

        {/* Hero Download Card */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[32px] p-6 sm:p-10 border border-black/5 dark:border-white/5 shadow-sm text-center relative overflow-hidden">
          {/* Decorative Background Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0f8e5d]/10 dark:bg-[#4ade80]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* App Icon */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-lg border-2 border-[#0f8e5d]/20 mb-6 p-1 bg-white dark:bg-[#0f172a]">
              <Image
                src="/logo.jpg"
                alt="أُنس"
                width={112}
                height={112}
                className="w-full h-full object-cover rounded-2xl"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 text-[#395675] dark:text-[#94a3b8] px-4 py-1.5 rounded-full text-xs font-bold mb-3">
              <ApkFileIcon className="w-4.5 h-4.5 shrink-0" />
              <span>تطبيق أندرويد الرسمي • الإصدار {release.versionClean}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e354d] dark:text-white tracking-tight mb-3">
              تحميل تطبيق أُنس للقرآن الكريم
            </h1>

            <p className="text-sm sm:text-base text-[#4a6b8c] dark:text-[#8ba7c0] max-w-xl mx-auto leading-relaxed mb-8">
              استمع للقرآن الكريم وتصفح المصحف الشريف والأذكار ومواقيت الصلاة في تطبيق خفيف وسريع، يدعم الاستماع في الخلفية وشاشة القفل بدون انقطاع.
            </p>

            {/* Primary Download Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
              <a
                href="/downloads/uns-quran.apk"
                download="uns-quran.apk"
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 bg-[#4a6b8c] hover:bg-[#395675] text-white py-4 px-8 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] group"
              >
                <ApkFileIcon className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-right">
                  <span className="block text-base leading-tight">تحميل ملف APK مباشر</span>
                  <span className="block text-[11px] text-white/80 mt-0.5 font-normal">حجم الملف: {release.fileSizeMb} • مجاني 100%</span>
                </div>
              </a>

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#f4f7f9] dark:bg-[#0f172a] text-[#4a6b8c] dark:text-[#8ba7c0] hover:text-[#0f8e5d] dark:hover:text-[#4ade80] font-bold text-sm transition-colors border border-black/5 dark:border-white/5 text-center"
              >
                تصفح الموقع
              </Link>
            </div>

            {/* Badges Info */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-black/5 dark:border-white/5 w-full max-w-lg text-center">
              <div>
                <span className="block text-lg font-black text-[#1e354d] dark:text-white">Android 7.0+</span>
                <span className="block text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">التوافق</span>
              </div>
              <div>
                <span className="block text-lg font-black text-[#0f8e5d] dark:text-[#4ade80]">مجاني بالكامل</span>
                <span className="block text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">بدون إعلانات</span>
              </div>
              <div>
                <span className="block text-lg font-black text-[#1e354d] dark:text-white">{release.versionTag}</span>
                <span className="block text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">آخر إصدار</span>
              </div>
            </div>
          </div>
        </div>

        {/* App Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 flex items-center justify-center text-[#4a6b8c] dark:text-[#94a3b8] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">المصحف الشريف كاملاً</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                قراءة القرآن الكريم بالرسم العثماني المعتمد مع سهولة البحث والتنقل بين السور والآيات.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 flex items-center justify-center text-[#4a6b8c] dark:text-[#94a3b8] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">استماع وتلاوات في الخلفية</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                استمع لأشهر القراء في العالم الإسلامي مع استمرار التلاوة عند قفل شاشة الهاتف أو استخدام تطبيقات أخرى.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 flex items-center justify-center text-[#4a6b8c] dark:text-[#94a3b8] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.5a.5.5 0 0 1 .5.5v1.2a4.8 4.8 0 0 1 2.3 1.3C16 6.7 16.5 8.5 16.5 10H7.5c0-1.5.5-3.3 1.7-4.5A4.8 4.8 0 0 1 11.5 4.2V3a.5.5 0 0 1 .5-.5z" />
                <path d="M5 21v-8l1.5-1.5L8 13v8" />
                <path d="M16 21v-8l1.5-1.5L19 13v8" />
                <path d="M8 14h8v7H8z" />
                <path d="M12 17a1.5 1.5 0 0 1 1.5 1.5V21h-3v-2.5A1.5 1.5 0 0 1 12 17z" />
                <path d="M3 21h18" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">مواقيت الصلاة الدقيقة</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                حساب مواقيت الصلاة بدقة بناءً على موقعك الجغرافي مع عد تنازلي حي للصلاة القادمة.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 flex items-center justify-center text-[#4a6b8c] dark:text-[#94a3b8] shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="16" cy="6.5" r="1.5" />
                <circle cx="18.5" cy="10" r="1.5" />
                <circle cx="18" cy="14" r="1.5" />
                <circle cx="15.5" cy="17" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
                <circle cx="8.5" cy="17" r="1.5" />
                <circle cx="6" cy="14" r="1.5" />
                <circle cx="5.5" cy="10" r="1.5" />
                <circle cx="8" cy="6.5" r="1.5" />
                <path d="M12 18v3.5" />
                <path d="M10.5 21.5h3" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">السبحة وحصن المسلم</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                سبحة إلكترونية متطورة مع أذكار الصباح والمساء وأذكار النوم وأدعية نبوية مأثورة.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshots Showcase */}
        <div className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs">
          <div className="text-right mb-6">
            <h2 className="text-xl font-bold text-[#1e354d] dark:text-white mb-1">لقطات حقيقية من داخل التطبيق</h2>
            <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0]">تصميم إسلامي عصري ومريح للعين مع الوضع الداكن</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[9/19.5] relative rounded-2xl overflow-hidden shadow-md border-2 border-[#223547] dark:border-[#33485d] bg-[#0c151f]">
                <Image src="/images/app-screen-home.png" alt="الشاشة الرئيسية" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white mt-2">الرئيسية والمواقيت</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[9/19.5] relative rounded-2xl overflow-hidden shadow-md border-2 border-[#223547] dark:border-[#33485d] bg-[#0c151f]">
                <Image src="/images/app-screen-quran.png" alt="المصحف الشريف" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white mt-2">المصحف الشريف</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[9/19.5] relative rounded-2xl overflow-hidden shadow-md border-2 border-[#223547] dark:border-[#33485d] bg-[#0c151f]">
                <Image src="/images/app-screen-reciters.png" alt="القراء والتلاوات" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white mt-2">كبار القراء</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[9/19.5] relative rounded-2xl overflow-hidden shadow-md border-2 border-[#223547] dark:border-[#33485d] bg-[#0c151f]">
                <Image src="/images/app-screen-adhkar.png" alt="الأذكار والأدعية" fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 25vw" />
              </div>
              <span className="text-xs font-bold text-[#1e354d] dark:text-white mt-2">الأذكار وحصن المسلم</span>
            </div>
          </div>
        </div>

        {/* Installation Guide */}
        <div className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs">
          <h2 className="text-xl font-bold text-[#1e354d] dark:text-white mb-6 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#4a6b8c]/10 dark:bg-[#4a6b8c]/20 flex items-center justify-center text-[#4a6b8c] dark:text-[#94a3b8] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <path d="M12 18h.01" />
                <path d="M12 7v6m-2.5-2.5L12 13l2.5-2.5" />
              </svg>
            </span>
            <span>طريقة تثبيت ملف APK على جهاز الأندرويد:</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#4a6b8c] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1e354d] dark:text-white">تنزيل الملف</h4>
                <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                  اضغط على زر <strong className="text-[#4a6b8c] dark:text-[#94a3b8]">تحميل ملف APK مباشر</strong> في الأعلى لحفظ الملف على جهازك.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#4a6b8c] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                2
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1e354d] dark:text-white">فتح الملف بعد اكتمال التنزيل</h4>
                <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                  افتح شريط الإشعارات واضغط على الملف المكتمل تنزيله <code className="bg-[#f4f7f9] dark:bg-[#0f172a] px-2 py-0.5 rounded text-[11px]">uns-quran.apk</code>، أو افتحه من مجلد «الملفات / التنزيلات» (Downloads).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#4a6b8c] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                3
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1e354d] dark:text-white">تأكيد التثبيت</h4>
                <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                  اضغط على «تثبيت». إذا طلب منك الهاتف تفعيل خيار <em>«تثبيت التطبيقات غير المعروفة»</em>، فعّل الخيار للمتصفح واضغط تثبيت.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
