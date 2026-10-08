const fs = require('fs');
let nav = fs.readFileSync('src/app/components/FloatingMobileMenu.tsx', 'utf8');

// Replace the Microphone SVG with a Play / Audio wave SVG
const newCenterIcon = `<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>`;

nav = nav.replace(
  /<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth=\{2\}>\s*<path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" \/>\s*<\/svg>/,
  newCenterIcon
);

fs.writeFileSync('src/app/components/FloatingMobileMenu.tsx', nav);
console.log('Fixed Mobile Nav Center Icon');
