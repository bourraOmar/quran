const fs = require('fs');

let dashboard = fs.readFileSync('src/app/components/Dashboard.tsx', 'utf8');

const newGridHtml = `
        <div className="grid grid-cols-4 gap-3">
           {[
             { name: "الحديث", icon: <i className="fi fi-rr-book-alt text-3xl text-[#4a6b8c] dark:text-[#8ba7c0]"></i>, href: "/hadith" },
             { name: "الدعاء", icon: <i className="fi fi-rr-person-praying text-3xl text-[#4a6b8c] dark:text-[#8ba7c0]"></i>, href: "/dua" },
             { name: "الذكر", icon: <i className="fi fi-rr-moon-stars text-3xl text-[#4a6b8c] dark:text-[#8ba7c0]"></i>, href: "/dhikr" },
             { name: "القبلة", icon: <i className="fi fi-rr-compass text-3xl text-[#4a6b8c] dark:text-[#8ba7c0]"></i>, href: "/qibla" },
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
console.log('Fixed Dashboard SVGs with Flaticon UIcons');
