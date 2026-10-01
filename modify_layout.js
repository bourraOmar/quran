const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');

c = c.replace(
  'variable: "--font-amiri-quran",\r\n});',
  'variable: "--font-amiri-quran",\r\n});\r\n\r\nconst arefRuqaaInk = Aref_Ruqaa_Ink({\r\n  subsets: ["arabic"],\r\n  weight: ["400", "700"],\r\n  variable: "--font-aref-ruqaa",\r\n});'
);

c = c.replace(
  'variable: "--font-amiri-quran",\n});',
  'variable: "--font-amiri-quran",\n});\n\nconst arefRuqaaInk = Aref_Ruqaa_Ink({\n  subsets: ["arabic"],\n  weight: ["400", "700"],\n  variable: "--font-aref-ruqaa",\n});'
);

c = c.replace(
  '${amiriQuran.variable}',
  '${amiriQuran.variable} ${arefRuqaaInk.variable}'
);

fs.writeFileSync('src/app/layout.tsx', c);
