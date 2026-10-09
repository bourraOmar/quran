const fs = require('fs');

let menu = fs.readFileSync('src/app/components/FloatingMobileMenu.tsx', 'utf8');

const newMenuLinks = `
        {/* 1. Home */}
        <Link href="/" aria-label="الرئيسية" className={\`p-3 flex-1 flex flex-col items-center justify-center transition-all\`}>
          <Image src="/icons/home.png" width={24} height={24} alt="الرئيسية" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname === "/" ? "opacity-100 scale-110" : "opacity-50"}\`} />
        </Link>

        {/* 2. Reciters */}
        <Link href="/reciters" aria-label="القراء" className={\`p-3 flex-1 flex flex-col items-center justify-center transition-all\`}>
          <Image src="/icons/reciters.png" width={24} height={24} alt="القراء" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname.startsWith("/reciter") ? "opacity-100 scale-110" : "opacity-50"}\`} />
        </Link>

        {/* 3. Quran / Surahs */}
        <Link href="/surahs" aria-label="القرآن" className={\`p-3 flex-1 flex flex-col items-center justify-center transition-all\`}>
          <Image src="/icons/quran.png" width={24} height={24} alt="القرآن" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname.startsWith("/surah") ? "opacity-100 scale-110" : "opacity-50"}\`} />
        </Link>

        {/* 4. Dhikr */}
        <Link href="/dhikr" aria-label="الذكر" className={\`p-3 flex-1 flex flex-col items-center justify-center transition-all\`}>
          <Image src="/icons/dhikr.png" width={24} height={24} alt="الذكر" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname === "/dhikr" ? "opacity-100 scale-110" : "opacity-50"}\`} />
        </Link>

        {/* 5. Setting / Profile */}
        <Link href="/profile" aria-label="الإعدادات" className={\`p-3 flex-1 flex flex-col items-center justify-center transition-all\`}>
          <Image src="/icons/profile.png" width={24} height={24} alt="الإعدادات" className={\`w-6 h-6 object-contain dark:invert transition-all \${pathname === "/profile" ? "opacity-100 scale-110" : "opacity-50"}\`} />
        </Link>
`;

menu = menu.replace(
  /<div className=\{`pointer-events-auto[\s\S]*?<\/div>/,
  `<div className={\`pointer-events-auto bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl h-[64px] rounded-[32px] flex items-center justify-around shadow-2xl border border-[#e2e8f0] dark:border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] \${innerClasses}\`}>
${newMenuLinks}
      </div>`
);

fs.writeFileSync('src/app/components/FloatingMobileMenu.tsx', menu);
console.log('Fixed Nav layout');
