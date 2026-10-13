import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ApkFileIcon from "../components/ApkFileIcon";

export const metadata: Metadata = {
  title: "تحميل تطبيق أُنس للقرآن الكريم | أندرويد APK",
  description: "حمّل تطبيق أُنس للقرآن الكريم بصيغة APK مباشرة لهواتف أندرويد. تلاوات خاشعة، أذكار الصباح والمساء، مواقيت الصلاة، وبوصلة القبلة.",
};

export default function DownloadPage() {
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
              <span>تطبيق أندرويد الرسمي • الإصدار 1.0.0</span>
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
                  <span className="block text-[11px] text-white/80 mt-0.5 font-normal">حجم الملف: ~4.5 MB • مجاني 100%</span>
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
                <span className="block text-lg font-black text-[#1e354d] dark:text-white">v1.0.0</span>
                <span className="block text-[11px] text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">آخر إصدار</span>
              </div>
            </div>
          </div>
        </div>

        {/* App Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0f8e5d]/10 dark:bg-[#4ade80]/10 flex items-center justify-center text-[#0f8e5d] dark:text-[#4ade80] shrink-0 text-xl">
              📖
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">المصحف الشريف كاملاً</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                قراءة القرآن الكريم بالرسم العثماني المعتمد مع سهولة البحث والتنقل بين السور والآيات.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0f8e5d]/10 dark:bg-[#4ade80]/10 flex items-center justify-center text-[#0f8e5d] dark:text-[#4ade80] shrink-0 text-xl">
              🎧
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">استماع وتلاوات في الخلفية</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                استمع لأشهر القراء في العالم الإسلامي مع استمرار التلاوة عند قفل شاشة الهاتف أو استخدام تطبيقات أخرى.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0f8e5d]/10 dark:bg-[#4ade80]/10 flex items-center justify-center text-[#0f8e5d] dark:text-[#4ade80] shrink-0 text-xl">
              🕌
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">مواقيت الصلاة الدقيقة</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                حساب مواقيت الصلاة بدقة بناءً على موقعك الجغرافي مع عد تنازلي حي للصلاة القادمة.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0f8e5d]/10 dark:bg-[#4ade80]/10 flex items-center justify-center text-[#0f8e5d] dark:text-[#4ade80] shrink-0 text-xl">
              📿
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1e354d] dark:text-white mb-1">السبحة وحصن المسلم</h3>
              <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed">
                سبحة إلكترونية متطورة مع أذكار الصباح والمساء وأذكار النوم وأدعية نبوية مأثورة.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Guide */}
        <div className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-xs">
          <h2 className="text-xl font-bold text-[#1e354d] dark:text-white mb-6 flex items-center gap-2">
            <span>📲</span>
            <span>طريقة تثبيت ملف APK على جهاز الأندرويد:</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#0f8e5d] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1e354d] dark:text-white">تنزيل الملف</h4>
                <p className="text-xs text-[#4a6b8c] dark:text-[#8ba7c0] mt-0.5">
                  اضغط على زر <strong className="text-[#0f8e5d] dark:text-[#4ade80]">تحميل ملف APK مباشر</strong> في الأعلى لحفظ الملف على جهازك.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#0f8e5d] text-white font-bold flex items-center justify-center shrink-0 text-sm">
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
              <div className="w-8 h-8 rounded-full bg-[#0f8e5d] text-white font-bold flex items-center justify-center shrink-0 text-sm">
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
