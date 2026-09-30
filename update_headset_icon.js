const fs = require('fs');
let menu = fs.readFileSync('src/app/components/FloatingMobileMenu.tsx', 'utf8');

const oldMusicIcon = /<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M9 19V6l12-3v13M9 19c0 1\.105-1\.343 2-3 2s-3-\.895-3-2 1\.343-2 3-2 3 \.895 3 2zm12-3c0 1\.105-1\.343 2-3 2s-3-\.895-3-2 1\.343-2 3-2 3 \.895 3 2zM9 10l12-3" \/>\s*<\/svg>/;

const newHeadphonesIcon = `<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
        </svg>`;

menu = menu.replace(oldMusicIcon, newHeadphonesIcon);
fs.writeFileSync('src/app/components/FloatingMobileMenu.tsx', menu);
