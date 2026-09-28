import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="w-full shrink-0">
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-[#e2dfd4] p-6 shadow-sm flex flex-col gap-8">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center border-b border-[#e2dfd4] pb-6">
          <div className="w-32 h-32 rounded-full border-4 border-[#0f6b56] flex items-center justify-center mb-4 p-2 relative overflow-hidden bg-[#fdfaf2]">
             {/* Using a placeholder circle for the beautiful Islamic geometric pattern */}
             <div className="absolute inset-0 border-2 border-dashed border-[#0f6b56] rounded-full m-1 animate-[spin_60s_linear_infinite]" />
             <div className="text-[#0f6b56] font-bold text-center leading-tight">
               القرآن<br/>الكريم
             </div>
          </div>
          <h2 className="text-[#0d2a23] font-bold text-xl">القرآن الكريم quran</h2>
        </div>

        {/* Featured Reciters */}
        <div>
          <h3 className="text-[#0d2a23] font-bold text-lg mb-4 text-right">قراء مميزون</h3>
          <ul className="flex flex-col gap-4">
            {[
              "عبد الباسط عبد الصمد",
              "عبد الرحمن السديس",
              "سعود الشريم",
              "ماهر المعيقلي",
              "ياسر الدوسري"
            ].map((reciter, i) => (
              <li key={i} className="flex items-center gap-3 justify-end cursor-pointer group">
                <div className="text-right">
                  <p className="text-sm text-[#3a5a51] group-hover:text-[#0f6b56] transition-colors font-bold">{reciter}</p>
                  <p className="text-xs text-gray-500">المصحف المرتل</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#fdfaf2] border border-[#0f6b56] shrink-0 overflow-hidden relative">
                   <div className="absolute inset-0 bg-[#0f6b56] opacity-10"></div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chosen for you */}
        <div>
          <h3 className="text-[#0d2a23] font-bold text-lg mb-4 text-right">اخترنا لكم</h3>
          <ul className="flex flex-col text-right text-sm text-[#3a5a51]">
            {["القاموس القرآني (عربي انجليزي)", "موسوعة النابلسي", "إذاعة القرآن الكريم", "تفسير القرآن الكريم", "ترجمة القرآن"].map((item, i) => (
              <li key={i} className="border-t border-[#e2dfd4] py-3 hover:text-[#0f6b56] font-medium cursor-pointer transition-colors">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Popular Surahs Tags */}
        <div>
          <h3 className="text-[#0d2a23] font-bold text-lg mb-4 text-right">سور تكثر قراءتها</h3>
          <div className="flex flex-wrap gap-2 justify-end">
            {["الكهف", "البقرة", "الملك", "يس", "الرحمن", "الواقعة", "مريم"].map((tag, i) => (
              <Link
                href="#"
                key={i}
                className="px-4 py-2 border border-[#e2dfd4] rounded text-sm text-[#3a5a51] hover:border-[#0f6b56] hover:bg-[#f3efdf] hover:text-[#0f6b56] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
