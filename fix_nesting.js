const fs = require('fs');
let c = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

c = c.replace(/azkarData as any\)\['أذكار الصباح'\] \|\| \[\]/g, "azkarData as any)['أذكار الصباح']?.flat() || []");
c = c.replace(/azkarData as any\)\['أذكار المساء'\] \|\| \[\]/g, "azkarData as any)['أذكار المساء']?.flat() || []");
c = c.replace(/azkarData as any\)\['أذكار بعد السلام من الصلاة المفروضة'\] \|\| \[\]/g, "azkarData as any)['أذكار بعد السلام من الصلاة المفروضة']?.flat() || []");
c = c.replace(/azkarData as any\)\['أذكار النوم'\] \|\| \[\]/g, "azkarData as any)['أذكار النوم']?.flat() || []");

fs.writeFileSync('src/app/dhikr/page.tsx', c);
console.log("FIXED NESTING");
