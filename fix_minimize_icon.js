const fs = require('fs');

let player = fs.readFileSync('src/app/components/GlobalPlayer.tsx', 'utf8');

const oldMinimizeIcon = /<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M9 11l-4 4m0 0l4 4m-4-4h14m-14 0V3" \/><\/svg>/;

const newMinimizeIcon = `<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>`;

player = player.replace(oldMinimizeIcon, newMinimizeIcon);

fs.writeFileSync('src/app/components/GlobalPlayer.tsx', player);
