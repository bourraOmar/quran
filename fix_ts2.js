const fs = require('fs');
let c = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');
c = c.replace('.map((line, i) => (', '.map((line: string, i: number) => (');
fs.writeFileSync('src/app/dhikr/page.tsx', c);
