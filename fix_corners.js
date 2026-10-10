const fs = require('fs');
let c = fs.readFileSync('src/app/dhikr/page.tsx', 'utf8');

c = c.replace(
    'className="w-full h-full flex"',
    'className="w-full h-full flex rounded-[40px] overflow-hidden bg-[#1e354d] dark:bg-[#1e293b]"'
);

fs.writeFileSync('src/app/dhikr/page.tsx', c);
console.log('REPLACED CORNERS');
