const fs = require('fs');

let dashboard = fs.readFileSync('src/app/components/Dashboard.tsx', 'utf8');

// 1. Fix the Arc Indicator
// Original: <div className="absolute top-0 right-1/4 w-4 h-4 bg-[#4a6b8c] dark:bg-[#8ba7c0] rounded-full -translate-y-1/2 shadow-lg shadow-[#4a6b8c]/50"></div>
// New: <div className="absolute top-0 left-1/2 w-4 h-4 bg-[#4a6b8c] dark:bg-[#8ba7c0] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-[#4a6b8c]/50"></div>
dashboard = dashboard.replace(
  'top-0 right-1/4 w-4 h-4',
  'top-0 left-1/2 w-4 h-4 -translate-x-1/2'
);

// 2. Fix the Toggles to look like real switches
dashboard = dashboard.replace(
  /w-10 h-5 rounded-full p-1 transition-colors/g,
  'w-11 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer shadow-inner'
);
dashboard = dashboard.replace(
  /w-3 h-3 bg-white rounded-full transition-transform/g,
  'w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300'
);

// 3. Replace Emojis in Grid with beautiful SVGs
const gridHtml = `
           {[
             { name: "الحديث", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, href: "/hadith" },
             { name: "الدعاء", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, href: "/dua" },
             { name: "الذكر", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, href: "/dhikr" },
             { name: "القبلة", svg: <svg className="w-8 h-8 text-[#4a6b8c] dark:text-[#8ba7c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>, href: "/qibla" },
           ].map((item, i) => (
             <Link href={item.href} key={i} className="bg-white dark:bg-[#1e293b] py-5 px-2 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-3 hover:bg-[#f4f7f9] dark:hover:bg-[#0f172a] transition-all border border-transparent hover:border-[#e2e8f0] dark:hover:border-[#334155]">
               {item.svg}
               <span className="text-[11px] font-bold text-[#4a6b8c] dark:text-[#94a3b8]">{item.name}</span>
             </Link>
           ))}
`;

dashboard = dashboard.replace(
  /\{\[\s*\{\s*name:\s*"الحديث"[\s\S]*?\}\)\}/,
  gridHtml
);

fs.writeFileSync('src/app/components/Dashboard.tsx', dashboard);
console.log('Fixed Dashboard design');
