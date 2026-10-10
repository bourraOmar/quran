const fs = require('fs');
let c = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');
c = c.replace(
  'readingData = readingData.map((d, index) => ({',
  'readingData = readingData.filter(d => d.content && d.content !== "stop").map((d, index) => ({'
);
fs.writeFileSync('src/app/dhikr/page.tsx', c);
console.log('Fixed');
