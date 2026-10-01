const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');

// Add display: "swap" and preload: true to Cairo (main font - critical)
c = c.replace(
  'const cairo = Cairo({\r\n  subsets: ["arabic"],\r\n  weight: ["300", "400", "600", "700"],\r\n  variable: "--font-cairo",\r\n});',
  'const cairo = Cairo({\r\n  subsets: ["arabic"],\r\n  weight: ["400", "600", "700"],\r\n  variable: "--font-cairo",\r\n  display: "swap",\r\n  preload: true,\r\n});'
);

c = c.replace(
  'const amiri = Amiri({\r\n  subsets: ["arabic"],\r\n  weight: ["400", "700"],\r\n  variable: "--font-amiri",\r\n});',
  'const amiri = Amiri({\r\n  subsets: ["arabic"],\r\n  weight: ["400", "700"],\r\n  variable: "--font-amiri",\r\n  display: "swap",\r\n  preload: false,\r\n});'
);

c = c.replace(
  'const amiriQuran = Amiri_Quran({\r\n  subsets: ["arabic"],\r\n  weight: ["400"],\r\n  variable: "--font-amiri-quran",\r\n});',
  'const amiriQuran = Amiri_Quran({\r\n  subsets: ["arabic"],\r\n  weight: ["400"],\r\n  variable: "--font-amiri-quran",\r\n  display: "swap",\r\n  preload: false,\r\n});'
);

c = c.replace(
  'const arefRuqaaInk = Aref_Ruqaa_Ink({\r\n  subsets: ["arabic"],\r\n  weight: ["400", "700"],\r\n  variable: "--font-aref-ruqaa",\r\n});',
  'const arefRuqaaInk = Aref_Ruqaa_Ink({\r\n  subsets: ["arabic"],\r\n  weight: ["700"],\r\n  variable: "--font-aref-ruqaa",\r\n  display: "swap",\r\n  preload: false,\r\n});'
);

fs.writeFileSync('src/app/layout.tsx', c);
console.log('Done!');
