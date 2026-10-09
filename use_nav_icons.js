const fs = require('fs');

let menu = fs.readFileSync('src/app/components/FloatingMobileMenu.tsx', 'utf8');

if (!menu.includes('import Image from "next/image"')) {
  menu = menu.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";');
}

// 1. Home
menu = menu.replace(
  /<svg className="w-6 h-6" fill=\{pathname === "\/" \? "currentColor" : "none"\}[\s\S]*?<\/svg>/,
  `<Image src="/icons/home.png" width={24} height={24} alt="الرئيسية" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname === "/" ? "opacity-100 scale-110" : "opacity-50"}\`} />`
);

// 2. Quran (Surahs)
menu = menu.replace(
  /<svg className="w-6 h-6" fill=\{pathname.startsWith\("\/surah"\) \? "currentColor" : "none"\}[\s\S]*?<\/svg>/,
  `<Image src="/icons/quran.png" width={24} height={24} alt="القرآن" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname.startsWith("/surah") ? "opacity-100 scale-110" : "opacity-50"}\`} />`
);

// 3. Reciters
menu = menu.replace(
  /<svg className="w-6 h-6" fill=\{pathname.startsWith\("\/reciter"\) \? "currentColor" : "none"\}[\s\S]*?<\/svg>/,
  `<Image src="/icons/reciters.png" width={24} height={24} alt="القراء" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname.startsWith("/reciter") ? "opacity-100 scale-110" : "opacity-50"}\`} />`
);

// 4. Profile / Settings
menu = menu.replace(
  /<svg className="w-6 h-6" fill=\{pathname === "\/profile" \? "currentColor" : "none"\}[\s\S]*?<\/svg>/,
  `<Image src="/icons/profile.png" width={24} height={24} alt="الملف الشخصي" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname === "/profile" ? "opacity-100 scale-110" : "opacity-50"}\`} />`
);

fs.writeFileSync('src/app/components/FloatingMobileMenu.tsx', menu);
console.log('Fixed Nav Icons');
