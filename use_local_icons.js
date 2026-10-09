const fs = require('fs');

let dashboard = fs.readFileSync('src/app/components/Dashboard.tsx', 'utf8');

// Ensure Image is imported
if (!dashboard.includes('import Image from "next/image"')) {
  dashboard = dashboard.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";');
}

const newGridHtml = `
        <div className="grid grid-cols-4 gap-3">
           {[
             { name: "الحديث", icon: <Image src="/icons/hadith.png" width={32} height={32} alt="الحديث" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/hadith" },
             { name: "الدعاء", icon: <Image src="/icons/dua.png" width={32} height={32} alt="الدعاء" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/dua" },
             { name: "الذكر", icon: <Image src="/icons/dhikr.png" width={32} height={32} alt="الذكر" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/dhikr" },
             { name: "القبلة", icon: <Image src="/icons/qibla.png" width={32} height={32} alt="القبلة" className="opacity-70 dark:invert dark:opacity-80 object-contain w-8 h-8" />, href: "/qibla" },
           ].map((item, i) => (
             <Link href={item.href} key={i} className="bg-white dark:bg-[#1e293b] py-5 px-2 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-3 hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] transition-all border border-transparent hover:border-[#e2e8f0] dark:hover:border-[#334155]">
               {item.icon}
               <span className="text-[11px] font-bold text-[#4a6b8c] dark:text-[#94a3b8]">{item.name}</span>
             </Link>
           ))}
        </div>
`;

// Replace the old grid section
dashboard = dashboard.replace(
  /<div className="grid grid-cols-4 gap-3">[\s\S]*?<\/div>/,
  newGridHtml.trim()
);

fs.writeFileSync('src/app/components/Dashboard.tsx', dashboard);
console.log('Fixed Dashboard with local PNG icons');
