import Link from "next/link";
import ApkFileIcon from "./ApkFileIcon";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#1e293b] border-t border-[#e2e8f0] dark:border-[#334155] pt-16 pb-8 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
          
          {/* Brand Column */}
          <div className="lg:w-1/3">
            <Link href="/" className="flex items-center mb-6">
              <span className="text-4xl font-bold tracking-tight text-[#1e354d] dark:text-white hover:text-[#4a6b8c] dark:hover:text-[#94a3b8] transition-colors" style={{ fontFamily: 'var(--font-aref-ruqaa)' }}>أُنس</span>
            </Link>
            <p className="text-[#4a6b8c] dark:text-[#94a3b8] leading-relaxed mb-6 font-medium">
              المكان الذي تبدأ منه رحلتك الإيمانية عبر قراءة واستماع كتاب الله الكريم، وتنزيل التطبيق المباشر للأندرويد.
            </p>
            <Link 
              href="/download" 
              className="inline-flex items-center gap-2 bg-[#4a6b8c] hover:bg-[#395675] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <ApkFileIcon className="w-4.5 h-4.5 shrink-0" />
              <span>تحميل تطبيق أندرويد (APK)</span>
            </Link>
          </div>

          {/* Links Columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[#1e354d] dark:text-[#f8fafc] font-bold text-lg mb-6">تصفح</h4>
              <ul className="flex flex-col gap-4 text-[#4a6b8c] dark:text-[#94a3b8] font-medium">
                <li><Link href="/" className="hover:text-[#395675] dark:hover:text-white transition-colors">الرئيسية</Link></li>
                <li><Link href="/surahs" className="hover:text-[#395675] dark:hover:text-white transition-colors">سور القرآن</Link></li>
                <li><Link href="/reciters" className="hover:text-[#395675] dark:hover:text-white transition-colors">القراء</Link></li>
                <li><Link href="/download" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors font-bold text-[#0f8e5d] dark:text-[#4ade80]">تحميل التطبيق APK</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#1e354d] dark:text-[#f8fafc] font-bold text-lg mb-6">سور مختارة</h4>
              <ul className="flex flex-col gap-4 text-[#4a6b8c] dark:text-[#94a3b8] font-medium">
                <li><Link href="/surah/2" className="hover:text-[#395675] dark:hover:text-white transition-colors">سورة البقرة</Link></li>
                <li><Link href="/surah/36" className="hover:text-[#395675] dark:hover:text-white transition-colors">سورة يس</Link></li>
                <li><Link href="/surah/55" className="hover:text-[#395675] dark:hover:text-white transition-colors">سورة الرحمن</Link></li>
                <li><Link href="/surah/67" className="hover:text-[#395675] dark:hover:text-white transition-colors">سورة الملك</Link></li>
                <li><Link href="/surah/18" className="hover:text-[#395675] dark:hover:text-white transition-colors">سورة الكهف</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#1e354d] dark:text-[#f8fafc] font-bold text-lg mb-6">معلومات</h4>
              <ul className="flex flex-col gap-4 text-[#4a6b8c] dark:text-[#94a3b8] font-medium">
                <li><Link href="/download" className="hover:text-[#395675] dark:hover:text-white transition-colors">عن التطبيق</Link></li>
                <li><Link href="#" className="hover:text-[#395675] dark:hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
                <li><Link href="#" className="hover:text-[#395675] dark:hover:text-white transition-colors">إعدادات الخصوصية</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e2e8f0] dark:border-[#334155] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#4a6b8c] dark:text-[#94a3b8] font-medium text-sm">حقوق النشر © 2026 أُنس - جميع الحقوق محفوظة</p>
          
          <div className="flex items-center gap-6 text-[#4a6b8c] dark:text-[#94a3b8] font-medium text-sm">
            <Link href="#" className="hover:text-[#395675] dark:hover:text-white transition-colors">الشروط</Link>
            <Link href="#" className="hover:text-[#395675] dark:hover:text-white transition-colors">القانونية</Link>
            <Link href="#" className="hover:text-[#395675] dark:hover:text-white transition-colors">الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
