const fs = require('fs');

// 1. Update ScrollToTop.tsx
let scroll = fs.readFileSync('src/app/components/ScrollToTop.tsx', 'utf8');
scroll = scroll.replace('bottom-[320px] md:bottom-[110px]', 'bottom-[170px] md:bottom-[110px]');
fs.writeFileSync('src/app/components/ScrollToTop.tsx', scroll);

// 2. Update GlobalPlayer.tsx
let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

const oldMiniPlayerClasses = /className=\{\`fixed bottom-\[80px\] md:bottom-0 left-1\/2 md:left-0 -translate-x-1\/2 md:translate-x-0 w-\[95%\] md:w-full max-w-\[450px\] md:max-w-none\s*bg-\[\#f8fafc\] dark:bg-\[\#1e293b\] md:dark:bg-\[\#0f172a\]\s*rounded-xl md:rounded-none border border-\[\#e2e8f0\] dark:border-white\/10 md:border-t md:border-x-0 md:border-b-0\s*shadow-lg md:shadow-none z-40\s*h-\[60px\] md:h-\[90px\]/;

const newMiniPlayerClasses = `className={\`fixed bottom-[90px] md:bottom-0 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-11/12 md:w-full max-w-[350px] md:max-w-none 
          bg-[#f8fafc] dark:bg-[#1e293b] md:dark:bg-[#0f172a] 
          rounded-xl md:rounded-none border border-[#e2e8f0] dark:border-white/10 md:border-t md:border-x-0 md:border-b-0
          shadow-lg md:shadow-none z-40 
          h-[65px] md:h-[90px]`;

player = player.replace(oldMiniPlayerClasses, newMiniPlayerClasses);

// Add space between Play and Close buttons on mobile mini player
const oldMobileButtons = /<div className="md:hidden flex items-center gap-3 ml-auto shrink-0 text-\[\#1e354d\] dark:text-white">/;
const newMobileButtons = `<div className="md:hidden flex items-center gap-5 ml-auto shrink-0 text-[#1e354d] dark:text-white">`;
player = player.replace(oldMobileButtons, newMobileButtons);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
