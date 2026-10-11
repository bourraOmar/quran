import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#1e293b] border-t border-black/5 dark:border-white/5 pt-20 pb-12 mt-auto transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
          
          {/* Brand Column */}
          <div className="lg:w-1/3">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Image src="/logo.jpg" alt="Quran Logo" width={42} height={42} className="rounded-full shadow-sm group-hover:scale-105 transition-transform" />
              <span className="text-4xl font-bold tracking-tight text-[#1e354d] dark:text-white" style={{ fontFamily: 'var(--font-aref-ruqaa)' }}>أُنس</span>
            </Link>
            <p className="text-[#4a6b8c] dark:text-[#8ba7c0] leading-relaxed mb-8 font-medium">
              المكان الذي تبدأ منه رحلتك الإيمانية عبر قراءة واستماع كتاب الله الكريم، والأذكار والأدعية النبوية الشريفة.
            </p>
          </div>

          {/* Links Columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[#1e354d] dark:text-white font-bold text-lg mb-6">تصفح</h4>
              <ul className="flex flex-col gap-3.5 text-[#4a6b8c] dark:text-[#8ba7c0] font-medium text-sm">
                <li><Link href="/" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">الرئيسية</Link></li>
                <li><Link href="/surahs" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">فهرس السور</Link></li>
                <li><Link href="/reciters" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">القراء والتلاوات</Link></li>
                <li><Link href="/dhikr" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">حصن المسلم (الأذكار)</Link></li>
                <li><Link href="/dua" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">قسم الأدعية</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#1e354d] dark:text-white font-bold text-lg mb-6">سور مختارة</h4>
              <ul className="flex flex-col gap-3.5 text-[#4a6b8c] dark:text-[#8ba7c0] font-medium text-sm">
                <li><Link href="/surah/1" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">سورة الفاتحة</Link></li>
                <li><Link href="/surah/2" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">سورة البقرة</Link></li>
                <li><Link href="/surah/18" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">سورة الكهف</Link></li>
                <li><Link href="/surah/36" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">سورة يس</Link></li>
                <li><Link href="/surah/67" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">سورة الملك</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#1e354d] dark:text-white font-bold text-lg mb-6">عن المشروع</h4>
              <ul className="flex flex-col gap-3.5 text-[#4a6b8c] dark:text-[#8ba7c0] font-medium text-sm">
                <li><Link href="#" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">عن أُنس</Link></li>
                <li><Link href="#" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">الأسئلة الشائعة</Link></li>
                <li><Link href="#" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">إعدادات الخصوصية</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-black/5 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#4a6b8c] dark:text-[#8ba7c0] font-medium text-sm">حقوق النشر © 2026 تطبيق أُنس للقرآن الكريم</p>
          
          <div className="flex items-center gap-6 text-[#4a6b8c] dark:text-[#8ba7c0] font-medium text-sm">
            <Link href="#" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">الشروط والأحكام</Link>
            <Link href="#" className="hover:text-[#0f8e5d] dark:hover:text-[#4ade80] transition-colors">الخصوصية</Link>
          </div>

          <div className="flex items-center gap-3 text-[#1e354d] dark:text-white">
            <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center hover:bg-[#0f8e5d] hover:text-white transition-colors border border-black/5 dark:border-white/5">
              <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-[#f4f7f9] dark:bg-[#0f172a] flex items-center justify-center hover:bg-[#0f8e5d] hover:text-white transition-colors border border-black/5 dark:border-white/5">
              <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
