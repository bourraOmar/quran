const fs = require('fs');
let code = fs.readFileSync('src/app/components/FloatingMobileMenu.tsx', 'utf8');

// Replace the Dhikr icon size
code = code.replace(
  /<Image src="\/icons\/dhikr\.png" width=\{24\} height=\{24\} alt=".*?" className=\{`w-6 h-6 object-contain dark:invert transition-all \$\{pathname === "\/dhikr" \? "opacity-100 scale-110" : "opacity-50"\}`\} \/>/,
  `<Image src="/icons/dhikr.png" width={32} height={32} alt="الذكر" className={\`w-8 h-8 object-contain dark:invert transition-all \${pathname === "/dhikr" ? "opacity-100 scale-110" : "opacity-50"}\`} />`
);

fs.writeFileSync('src/app/components/FloatingMobileMenu.tsx', code);
console.log('Fixed Dhikr Icon Size');
