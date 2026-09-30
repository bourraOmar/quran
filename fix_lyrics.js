const fs = require('fs');
let code = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

// 1. Remove setTimeout from auto-scroll since layout won't shift anymore
code = code.replace(
  /setTimeout\(\(\) => \{[\s\S]*?el\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\);[\s\S]*?\}, 100\);/,
  `const el = document.getElementById(\`verse-\${activeVerse.id}\`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }`
);

// 2. Make container wider (max-w-5xl -> max-w-[90%])
code = code.replace(
  'className="flex-1 flex flex-col items-center justify-center min-h-0 relative w-full max-w-5xl mx-auto overflow-hidden"',
  'className="flex-1 flex flex-col items-center justify-center min-h-0 relative w-full max-w-[90%] mx-auto overflow-hidden"'
);

// 3. Prevent layout shifting (weird transformations) on the verse text
const regex = /className=\{\`transition-all duration-300 font-quran text-center leading-\[1\.8\] cursor-pointer max-w-4xl \$\{isActive \? 'text-white text-5xl md:text-6xl lg:text-7xl font-bold drop-shadow-\[0_0_15px_rgba\(255,255,255,0\.4\)\] scale-105' : 'text-white\/40 hover:text-white\/80 text-4xl md:text-5xl lg:text-6xl blur-\[0\.5px\] hover:blur-none'\}\`\}/;

const replacement = `className={\`transition-all duration-500 font-quran text-center leading-[1.8] cursor-pointer w-full text-5xl md:text-6xl lg:text-7xl \${isActive ? 'text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-white/30 hover:text-white/60 blur-[1px] hover:blur-none'}\`}`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', code);
